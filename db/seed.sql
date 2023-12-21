use employees;

INSERT INTO department
    (name)
VALUES
    ('Marketing'),
    ('IT'),
    ('Finance'),
    ('Human Resources');

INSERT INTO role
    (title, salary, department_id)
VALUES
    ('Marketing Manager', 120000, 1),
    ('Content Specialist', 80000, 1),
    ('IT Manager', 130000, 2),
    ('Systems Analyst', 100000, 2),
    ('Chief Financial Officer', 180000, 3),
    ('Financial Analyst', 120000, 3),
    ('HR Manager', 115000, 4),
    ('HR Coordinator', 85000, 4);

INSERT INTO employee
    (first_name, last_name, role_id, manager_id)
VALUES
    ('Emily', 'Johnson', 1, NULL),
    ('Olivia', 'Benett', 2, 1),
    ('Brian', 'Roberts', 3, NULL),
    ('Jennifer', 'Lee', 4, 3),
    ('Christopher', 'Miller', 5, NULL),
    ('Rachel', 'Turner', 6, 5),
    ('Matthew', 'Baker', 7, NULL),
    ('Amanda', 'Wong', 8, 7);