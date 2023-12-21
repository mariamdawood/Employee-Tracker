const { prompt } = require("inquirer");
const connection = require("./config/connection");

// Initialize the app
init();

// Function to initiate prompts
function init() {
    mainPrompts();
}

// Main prompts and assign each option to its corresponding function
async function mainPrompts() {
    // Options for user actions
    const actions = [
        { name: "View All Departments", value: viewAllDepartments },
        { name: "Add Department", value: addDepartment },
        { name: "Remove Department", value: removeDepartment },
        { name: "View All Roles", value: viewAllRoles },
        { name: "Add Role", value: addRole },
        { name: "Remove Role", value: removeRole },
        { name: "View All Employees", value: viewAllEmployees },
        { name: "View Employees By Department", value: viewEmployeesByDepartment },
        { name: "View Employees By Manager", value: viewEmployeesByManager },
        { name: "Update Employee Role", value: updateEmployeeRole },
        { name: "Update Employee Manager", value: updateEmployeeManager },
        { name: "Add Employee", value: addEmployee },
        { name: "Remove Employee", value: removeEmployee },
        { name: "View Utilized Budget By Department", value: viewUtilizedBudgetByDepartment },
        { name: "Quit", value: quit }
    ];

    // Prompt user for action choice
    const { choice } = await prompt({
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: actions.map(action => action.name)
    });

    // Find the selected action and execute its corresponding function
    const selectedAction = actions.find(action => action.name === choice);
    if (selectedAction) {
        selectedAction.value();
    } else {
        // Quit the application if no action is selected
        quit();
    }
}

// Function to fetch all departments from the database
function fetchAllDepartments() {
    return new Promise((resolve, reject) => {
        // Query the database to retrieve department information
        connection.query("SELECT * FROM department ORDER BY id ASC", (err, results) => {
            if (err) {
                // Reject the promise if there's an error
                reject(err);
            } else {
                // Resolve the promise with the query results
                resolve(results);
            }
        });
    });
}

// Function to view all departments
async function viewAllDepartments() {
    try {
        // Fetch all departments
        const departments = await fetchAllDepartments();
        // Display the departments in a console table
        console.log("\n");
        console.table(departments);
    } catch (error) {
        // Log an error message if an error occurs
        console.error("Error fetching departments: ", error.message);
    }
    // Display the main prompts
    mainPrompts();
}

// Function to add a new department
async function addDepartment() {
    // Prompt user for the name of the new department
    const departmentInfo = await prompt([
        {
            type: "input",
            name: "name",
            message: "What is the name of the new department?",
            validate: input => input.trim() !== ""
        },
    ]);
    try {
        // Insert the new department into the database
        await insertDepartment(departmentInfo.name);
        // Display a success message
        console.log(`\n${departmentInfo.name} department added successfully!\n`);
    } catch (error) {
        // Log an error message if an error occurs
        console.error("Error adding department: ", error.message);
    }
    // Display the main prompts
    mainPrompts();
}

// Function to add a new department to the database
function insertDepartment(name) {
    return new Promise((resolve, reject) => {
        // Insert the new department into the department table
        connection.query("INSERT INTO department (name) VALUES (?)", [name], (err, result) => {
            if (err) {
                // Reject the promise if there's an error
                reject(err);
            } else {
                // Query the database to retrieve all departments after the insertion
                connection.query("SELECT * FROM department ORDER BY id", (err, results) => {
                    if (err) {
                        // Reject the promise if there's an error
                        reject(err);
                    } else {
                        // Resolve the promise with the updated department list
                        resolve(results);
                    }
                });
            }
        });
    });
}

// Function to remove a department
async function removeDepartment() {
    try {
        // Fetch all departments
        const departments = await fetchAllDepartments();
        // Generate choices for the department selection prompt
        const departmentChoices = departments.map((department) => department.name);
        // Prompt user to choose a department to remove
        const selectedDepartmentTitle = await prompt({
            type: "list",
            name: "departmentTitle",
            message: "Choose the department to remove:",
            choices: departmentChoices,
        });
        // Find the department to remove
        const departmentToRemove = departments.find(
            (department) => department.name === selectedDepartmentTitle.departmentTitle
        );
        // Check if the department is found
        if (departmentToRemove) {
            // Remove the department from the database
            await removeDepartmentById(departmentToRemove.id);
            // Display a success message
            console.log(`\n${departmentToRemove.name} department removed successfully!\n`);
        } else {
            // Display an error message if the department is not found
            console.error("Error: Department not found.");
        }
    } catch (error) {
        // Log an error message if an error occurs
        console.error("Error removing department: ", error.message);
    }
    // Display the main prompts
    mainPrompts();
}

// Function to remove a department from the database
function removeDepartmentById(departmentId) {
    return new Promise((resolve, reject) => {
        // Delete the department from the department table
        connection.query(
            "DELETE FROM department WHERE id = ?",
            [departmentId],
            // Callback function to handle the query result or error
            (err, result) => {
                if (err) {
                    // Reject the promise if there's an error
                    reject(err);
                } else {
                    // Resolve the promise with the query result
                    resolve(result);
                }
            }
        );
    });
}

// Function to fetch all roles from the database
function fetchAllRoles() {
    return new Promise((resolve, reject) => {
        // Query the database to retrieve role information
        connection.query(`
            SELECT role.*, department.name AS department_name
            FROM role
            JOIN department ON role.department_id = department.id
            ORDER BY role.id ASC
        `, (err, results) => {
            if (err) {
                // Reject the promise if there's an error
                reject(err);
            } else {
                // Resolve the promise with the query results
                resolve(results);
            }
        });
    });
}

// Function to view all roles
async function viewAllRoles() {
    try {
        // Fetch all roles
        const roles = await fetchAllRoles();
        // Format role data for console table display
        const formattedTable = roles.map(role => ({
            "id": role.id,
            "Role": role.title,
            "Department": role.department_name,
            "Salary": role.salary,
        }));
        // Display the role information in a console table
        console.log("\n");
        console.table(formattedTable);
    } catch (error) {
        // Log an error message if an error occurs
        console.error("Error fetching roles: ", error.message);
    }
    // Display the main prompts
    mainPrompts();
}

// Function to add a new role
async function addRole() {
    try {
        // Fetch all departments
        const departmentResults = await fetchAllDepartments();
        // Generate choices for the department selection prompt
        const departmentChoices = departmentResults.map((department) => department.name);
        // Prompt user for new role information
        const roleInfo = await prompt([
            {
                type: "input",
                name: "title",
                message: "What is the new role?",
                validate: input => input.trim() !== ""
            },
            {
                type: "input",
                name: "salary",
                message: "What is the salary of the new role?",
                validate: input => !isNaN(input) && input.trim() !== ""
            },
            {
                type: "list",
                name: "department_name",
                message: "Choose a department for the new role.",
                choices: departmentChoices
            },
        ]);
        // Find the selected department
        const selectedDepartment = departmentResults.find(dep => dep.name === roleInfo.department_name);
        // Check if the department is found
        if (selectedDepartment) {
            // Add department_id to roleInfo and remove department_name
            roleInfo.department_id = selectedDepartment.id;
            delete roleInfo.department_name;
            // Insert the new role into the database
            await insertRole(roleInfo);
            // Display a success message
            console.log(`\n${roleInfo.title} role added successfully!\n`);
        } else {
            // Display an error message if the department is not found
            console.error("Error: Department not found.");
        }
    } catch (error) {
        // Log an error message if an error occurs
        console.error("Error adding role: ", error.message);
    }
    // Display the main prompts
    mainPrompts();
}

// Function to add a new role to the database
function insertRole(role) {
    return new Promise((resolve, reject) => {
        // Insert the new role into the role table
        connection.query(
            "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
            [role.title, role.salary, role.department_id],
            // Callback function to handle the query result or error
            (err, result) => {
                if (err) {
                    // Reject the promise if there's an error
                    reject(err);
                } else {
                    // Query the database to retrieve all roles after the insertion
                    connection.query("SELECT * FROM role ORDER BY id", (err, results) => {
                        if (err) {
                            // Reject the promise if there's an error
                            reject(err);
                        } else {
                            // Resolve the promise with the updated role list
                            resolve(results);
                        }
                    });
                }
            }
        );
    });
}

// Function to remove a role
async function removeRole() {
    try {
        // Fetch all roles
        const roles = await fetchAllRoles();
        // Generate choices for the role selection prompt
        const roleChoices = roles.map((role) => role.title);
        // Prompt user to choose a role to remove
        const selectedRoleTitle = await prompt({
            type: "list",
            name: "roleTitle",
            message: "Choose the role to remove:",
            choices: roleChoices,
        });
        // Find the role to remove
        const roleToRemove = roles.find((role) => role.title === selectedRoleTitle.roleTitle);
        // Check if the role is found
        if (roleToRemove) {
            // Remove the role from the database
            await removeRoleById(roleToRemove.id);
            // Display a success message
            console.log(`\n${roleToRemove.title} role removed successfully!\n`);
        } else {
            // Display an error message if the role is not found
            console.error("Error: Role not found.");
        }
    } catch (error) {
        // Log an error message if an error occurs
        console.error("Error removing role: ", error.message);
    }
    // Display the main prompts
    mainPrompts();
}

// Function to remove a role from the database
function removeRoleById(roleId) {
    return new Promise((resolve, reject) => {
        // Delete the role from the role table
        connection.query(
            "DELETE FROM role WHERE id = ?",
            [roleId],
            // Callback function to handle the query result or error
            (err, result) => {
                if (err) {
                    // Reject the promise if there's an error
                    reject(err);
                } else {
                    // Resolve the promise with the query result
                    resolve(result);
                }
            }
        );
    });
}

// Function to fetch all employees from the database
function fetchAllEmployees() {
    return new Promise((resolve, reject) => {
        // Query the database to retrieve employee information
        connection.query(
            `
            SELECT employee.*, role.title AS job_title, role.salary, department.name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee manager ON employee.manager_id = manager.id
            ORDER BY employee.id ASC
        `,
            // Callback function to handle the query result or error
            (err, results) => {
                if (err) {
                    // Reject the promise if there's an error
                    reject(err);
                } else {
                    // Resolve the promise with the query results
                    resolve(results);
                }
            }
        );
    });
}

// Function to view all employees
async function viewAllEmployees() {
    try {
        // Fetch all employees
        const employees = await fetchAllEmployees();
        // Format employee data for console table display
        const formattedTable = employees.map((employee) => ({
            "id": employee.id,
            "First name": employee.first_name,
            "Last name": employee.last_name,
            "Role": employee.job_title,
            "Department": employee.department,
            "Salary": employee.salary,
            "Manager": employee.manager_name
        }));
        // Display the employee information in a console table
        console.log("\n");
        console.table(formattedTable);
    } catch (error) {
        // Log an error message if an error occurs
        console.error("Error fetching employees: ", error.message);
    }
    // Display the main prompts
    mainPrompts();
}

// Function to add a new employee
async function addEmployee() {
    try {
        // Fetch all roles
        const roleResults = await fetchAllRoles();
        // Generate choices for the role selection prompt
        const roleChoices = roleResults.map((role) => role.title);
        // Prompt user for new employee information
        const employeeInfo = await prompt([
            {
                type: "input",
                name: "first_name",
                message: "What is the first name of the new employee?",
                validate: (input) => input.trim() !== "",
            },
            {
                type: "input",
                name: "last_name",
                message: "What is the last name of the new employee?",
                validate: (input) => input.trim() !== "",
            },
        ]);
        // Prompt user to choose a role for the new employee
        const selectedRole = await prompt([
            {
                type: "list",
                name: "role_title",
                message: "Choose the role for the new employee:",
                choices: roleChoices,
            },
        ]);
        // Find details of the selected role
        const selectedRoleDetails = roleResults.find(
            (role) => role.title === selectedRole.role_title
        );
        // Fetch employees in the same department as the new role
        const departmentEmployees = await fetchEmployeesByDepartment(
            selectedRoleDetails.department_id
        );
        // Generate choices for the manager selection prompt
        const managerChoices = [
            ...departmentEmployees.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
            })),
            { name: "None", value: null }
        ];
        // Prompt user to choose a manager for the new employee
        const selectedManager = await prompt([
            {
                type: "list",
                name: "manager_id",
                message: "Choose the manager for the new employee:",
                choices: managerChoices
            },
        ]);
        // Add role_id and manager_id to employeeInfo
        employeeInfo.role_id = selectedRoleDetails.id;
        employeeInfo.manager_id = selectedManager.manager_id;
        // Insert the new employee into the database
        await insertEmployee(employeeInfo);
        // Display a success message
        console.log(`\n${employeeInfo.first_name} ${employeeInfo.last_name} added successfully!\n`);
    } catch (error) {
        // Log an error message if an error occurs
        console.error("Error adding employee: ", error.message);
    }
    // Display the main prompts
    mainPrompts();
}

// Function to add a new employee to the database
function insertEmployee(employee) {
    return new Promise((resolve, reject) => {
        // Insert the new employee into the employee table
        connection.query(
            "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
            [employee.first_name, employee.last_name, employee.role_id, employee.manager_id],
            // Callback function to handle the query result or error
            (err, result) => {
                if (err) {
                    // Reject the promise if there's an error
                    reject(err);
                } else {
                    // Query the database to retrieve all employees after the insertion
                    connection.query("SELECT * FROM employee ORDER BY id", (err, results) => {
                        if (err) {
                            // Reject the promise if there's an error
                            reject(err);
                        } else {
                            // Resolve the promise with the updated employee list
                            resolve(results);
                        }
                    });
                }
            }
        );
    });
}

// Function to remove an employee
async function removeEmployee() {
    try {
        // Fetch all employees
        const employees = await fetchAllEmployees();
        // Generate choices for the employee selection prompt
        const employeeChoices = employees.map(
            (employee) => `${employee.first_name} ${employee.last_name}`
        );
        // Prompt user to choose an employee to remove
        const selectedEmployeeName = await prompt({
            type: "list",
            name: "employeeName",
            message: "Choose the employee to remove:",
            choices: employeeChoices,
        });
        // Find the employee to remove
        const employeeToRemove = employees.find(
            (employee) =>
                `${employee.first_name} ${employee.last_name}` ===
                selectedEmployeeName.employeeName
        );
        // Check if the employee is found
        if (employeeToRemove) {
            // Remove the employee from the database
            await removeEmployeeById(employeeToRemove.id);
            // Display a success message
            console.log(
                `\n${employeeToRemove.first_name} ${employeeToRemove.last_name} removed successfully!\n`
            );
        } else {
            // Display an error message if the employee is not found
            console.error("Error: Employee not found.");
        }
    } catch (error) {
        // Log an error message if an error occurs
        console.error("Error removing employee: ", error.message);
    }
    // Display the main prompts
    mainPrompts();
}

// Function to remove an employee from the database
function removeEmployeeById(employeeId) {
    return new Promise((resolve, reject) => {
        // Delete the employee from the employee table
        connection.query(
            "DELETE FROM employee WHERE id = ?",
            [employeeId],
            // Callback function to handle the query result or error
            (err, result) => {
                if (err) {
                    // Reject the promise if there's an error
                    reject(err);
                } else {
                    // Resolve the promise with the query result
                    resolve(result);
                }
            }
        );
    });
}

// Function to fetch employees in a specific department
function fetchEmployeesByDepartment(departmentId) {
    return new Promise((resolve, reject) => {
        // Query the database to retrieve employee information based on department ID
        connection.query(
            `
            SELECT employee.id, employee.first_name, employee.last_name, 
                   role.title AS job_title, role.salary,
                   CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN employee manager ON employee.manager_id = manager.id
            WHERE role.department_id = ?
        `,
            [departmentId],
            // Callback function to handle the query result or error
            (err, results) => {
                if (err) {
                    // Reject the promise if there's an error
                    reject(err);
                } else {
                    // Resolve the promise with the query results
                    resolve(results);
                }
            }
        );
    });
}

// Function to view employees in a department
async function viewEmployeesByDepartment() {
    try {
        // Fetch all departments
        const departments = await fetchAllDepartments();
        // Prompt user to choose a department
        const selectedDepartment = await prompt([
            {
                type: "list",
                name: "departmentId",
                message: "Choose a department:",
                choices: departments.map((department) => ({
                    name: department.name,
                    value: department.id,
                })),
            },
        ]);
        // Find the selected department
        const department = departments.find((d) => d.id === selectedDepartment.departmentId);
        // Fetch employees in the selected department
        const employees = await fetchEmployeesByDepartment(selectedDepartment.departmentId);
        console.log(`\nEmployees in ${department.name}:\n`);
        // Format employee data for console table display
        const formattedTable = employees.map((employee) => ({
            id: employee.id,
            "First name": employee.first_name,
            "Last name": employee.last_name,
            "Role": employee.job_title,
            "Salary": employee.salary,
            "Manager": employee.manager_name,
        }));
        console.table(formattedTable);
        // Display the main prompts
        mainPrompts();
    } catch (error) {
        // Log an error message if an error occurs
        console.error("Error fetching employees by department: ", error.message);
        // Display the main prompts
        mainPrompts();
    }
}

// Function to fetch all managers
function fetchAllManagers() {
    return new Promise((resolve, reject) => {
        // Query the database to retrieve managers
        connection.query(
            `
            SELECT id, first_name, last_name
            FROM employee
            WHERE id IN (SELECT DISTINCT manager_id FROM employee WHERE manager_id IS NOT NULL)
        `,
            // Callback function to handle the query result or error
            (err, results) => {
                if (err) {
                    // Reject the promise if there's an error
                    reject(err);
                } else {
                    // Resolve the promise with the query results
                    resolve(results);
                }
            }
        );
    });
}

// Function to fetch employees by manager
function fetchEmployeesByManager(managerId) {
    return new Promise((resolve, reject) => {
        // Query the database to retrieve employee information based on manager id
        connection.query(
            `
            SELECT employee.id, employee.first_name, employee.last_name,
                   role.title AS job_title, department.name AS department_name, role.salary
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN department ON role.department_id = department.id
            WHERE employee.manager_id = ?
        `,
            [managerId],
            // Callback function to handle the query result or error
            (err, results) => {
                if (err) {
                    // Reject the promise if there's an error
                    reject(err);
                } else {
                    // Resolve the promise with the query results
                    resolve(results);
                }
            }
        );
    });
}

// Function to view employees by manager
async function viewEmployeesByManager() {
    try {
        // Fetch all managers
        const managers = await fetchAllManagers();
        // Generate choices for the manager selection prompt
        const managerChoices = managers.map((manager) => ({
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id,
        }));
        // Prompt user to choose a manager to view employees
        const selectedManager = await prompt({
            type: "list",
            name: "managerId",
            message: "Choose the manager to view employees:",
            choices: managerChoices,
        });
        // Find the selected manager
        const manager = managers.find((m) => m.id === selectedManager.managerId);
        // Fetch employees by manager
        const employees = await fetchEmployeesByManager(selectedManager.managerId);
        // Display employee information if there are employees
        if (employees.length > 0) {
            console.log(`\nEmployees reporting to ${manager.first_name} ${manager.last_name}:`);
            // Format employee data for console table display
            const formattedTable = employees.map((employee) => ({
                id: employee.id,
                "First name": employee.first_name,
                "Last name": employee.last_name,
                "Role": employee.job_title,
                "Department": employee.department_name,
                "Salary": employee.salary,
            }));
            console.table(formattedTable);
        } else {
            // Display a message if no employees are found for the selected manager
            console.log("\nNo employees found for the selected manager.");
        }
    } catch (error) {
        // Log an error message if an error occurs
        console.error("Error viewing employees by manager: ", error.message);
    }
    // Continue the program
    mainPrompts();
}

// Function to update an employee's role
async function updateEmployeeRole() {
    try {
        // Fetch all employees
        const employees = await fetchAllEmployees();
        // Generate choices for the employee selection prompt
        const employeeChoices = employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));
        // Prompt user to choose an employee for role update
        const selectedEmployee = await prompt({
            type: "list",
            name: "employeeId",
            message: "Choose the employee to update the role:",
            choices: employeeChoices
        });
        // Fetch all roles
        const roles = await fetchAllRoles();
        // Generate choices for the role selection prompt
        const roleChoices = roles.map(role => ({
            name: role.title,
            value: role.id
        }));
        // Prompt user to choose the new role
        const selectedRole = await prompt({
            type: "list",
            name: "roleId",
            message: "Choose the new role for the selected employee:",
            choices: roleChoices
        });
        // Update the employee's role in the database
        await updateEmployeeRoleById(selectedEmployee.employeeId, selectedRole.roleId);
        console.log("\nEmployee role updated successfully!\n");
    } catch (error) {
        // Log error message if an error occurs
        console.error("Error updating employee role: ", error.message);
    }
    // Continue the program
    mainPrompts();
}

// Function to update an employee's role in the database
function updateEmployeeRoleById(employeeId, roleId) {
    // Return a promise for the database update operation
    return new Promise((resolve, reject) => {
        // Use the connection object to update the employee's role
        connection.query(
            "UPDATE employee SET role_id = ? WHERE id = ?",
            [roleId, employeeId],
            // Callback function to handle the update result or error
            (err, result) => {
                if (err) {
                    // Reject the promise if there's an error
                    reject(err);
                } else {
                    // Resolve the promise with the update result
                    resolve(result);
                }
            }
        );
    });
}

// Function to update an employee's manager
async function updateEmployeeManager() {
    try {
        // Fetch all employees
        const employees = await fetchAllEmployees();
        // Prompt user to choose an employee for manager update
        const selectedEmployee = await prompt({
            type: "list",
            name: "employeeId",
            message: "Choose the employee to update the manager:",
            choices: employees.map(employee => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
                departmentId: employee.department_id
            }))
        });
        // Filter employees in the same department as the selected employee
        const employeesInSameDepartment = employees.filter(
            employee => employee.department_id === selectedEmployee.departmentId
        );
        // Generate choices for the new manager, including an option for "None"
        const managerChoices = [
            ...employeesInSameDepartment.map(manager => ({
                name: `${manager.first_name} ${manager.last_name}`,
                value: manager.id
            })),
            { name: "None", value: null }
        ];
        // Prompt user to choose the new manager
        const selectedManager = await prompt({
            type: "list",
            name: "managerId",
            message: "Choose the new manager for the selected employee:",
            choices: managerChoices
        });
        // Update the employee's manager in the database
        await updateEmployeeManagerById(selectedEmployee.employeeId, selectedManager.managerId);
        console.log("\nEmployee manager updated successfully!\n");
    } catch (error) {
        // Log error message if an error occurs
        console.error("Error updating employee manager: ", error.message);
    }
    // Continue the program
    mainPrompts();
}

// Function to update an employee's manager in the database
async function updateEmployeeManagerById(employeeId, managerId) {
    // Return a promise for the database update operation
    return new Promise((resolve, reject) => {
        // Use the connection object to update the employee's manager
        connection.query(
            "UPDATE employee SET manager_id = ? WHERE id = ?",
            [managerId, employeeId],
            // Callback function to handle the update result or error
            (err, result) => {
                if (err) {
                    // Reject the promise if there's an error
                    reject(err);
                } else {
                    // Resolve the promise with the update result
                    resolve(result);
                }
            }
        );
    });
}

// Define a function to fetch the budget for a department
function fetchDepartmentBudget(departmentId) {
    // Create a promise for asynchronous database queries
    return new Promise((resolve, reject) => {
        // Use the connection object to query the database
        connection.query(
            // SQL query to calculate the total budget for a department based on employee salaries
            "SELECT SUM(r.salary) AS total_budget " +
            "FROM employee e " +
            "JOIN role r ON e.role_id = r.id " +
            "WHERE r.department_id = ?",
            [departmentId],
            // Callback function to handle query results or errors
            (err, result) => {
                if (err) {
                    // Reject the promise if there's an error
                    reject(err);
                } else {
                    // Resolve the promise with the total budget
                    resolve(result[0].total_budget || 0);
                }
            }
        );
    });
}

// Function to display department budget and employee info
async function viewUtilizedBudgetByDepartment() {
    try {
        // Get all departments
        const departments = await fetchAllDepartments();
        // Prompt user to choose a department
        const selectedDepartment = await prompt({
            type: "list",
            name: "departmentId",
            message: "Choose a department to view the budget:",
            choices: departments.map((department) => ({
                name: department.name,
                value: department.id,
            })),
        });
        // Find selected department
        const department = departments.find((d) => d.id === selectedDepartment.departmentId);
        // Get total budget for the department
        const totalBudget = await fetchDepartmentBudget(selectedDepartment.departmentId);
        // Get employees for the department
        const employees = await fetchEmployeesByDepartment(selectedDepartment.departmentId);
        // Display employee info
        console.log(`\nEmployees and salaries in the ${department.name} department:\n`);
        const formattedTable = employees.map((employee) => ({
            "First name": employee.first_name,
            "Last name": employee.last_name,
            "Role": employee.job_title,
            "Salary": employee.salary,
        }));
        console.table(formattedTable);
        // Display total budget
        console.log(`\n Total Budget for the ${department.name} department:\n`);
        const totalBudgetTable = [{ "Total Budget": totalBudget }];
        console.table(totalBudgetTable);
    } catch (error) {
        // Log error message
        console.error("Error fetching budget and employees: ", error.message);
    }
    // Continue the program
    mainPrompts();
}

// Quit
function quit() {
    console.log("Goodbye!")
    connection.end()
    process.exit()
}