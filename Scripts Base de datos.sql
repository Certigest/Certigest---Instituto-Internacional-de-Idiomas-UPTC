DROP DATABASE instituto_idiomas_db;
CREATE DATABASE instituto_idiomas_db;
USE instituto_idiomas_db;

CREATE TABLE Location (
    id_location INT AUTO_INCREMENT PRIMARY KEY,
    id_location_f INT,
    location_name VARCHAR(100)
);

CREATE TABLE Login (
    id_login INT AUTO_INCREMENT PRIMARY KEY,
    id_person INT NOT NULL,
    user_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE Person (
    person_id INT AUTO_INCREMENT PRIMARY KEY,
    id_location INT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    DOCUMENT_TYPE ENUM('CC', 'TI'),
    document VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20),
    status BOOLEAN,
    birth_date DATE
);

CREATE TABLE Role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    name ENUM('STUDENT', 'TEACHER', 'ADMIN') UNIQUE
);

CREATE TABLE Person_Role (
    person_id INT,
    role_id INT,
    PRIMARY KEY (person_id, role_id),
    FOREIGN KEY (person_id) REFERENCES Person(person_id),
    FOREIGN KEY (role_id) REFERENCES Role(role_id)
);


CREATE TABLE course (
    id_course INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100),
    course_description TEXT,
    COURSE_TYPE ENUM('KIDS', 'DEFAULT', 'SKILLS'),
    language VARCHAR(50),
    creation_date DATE
);

CREATE TABLE Level (
    level_id INT AUTO_INCREMENT PRIMARY KEY,
    id_course INT,
    level_name VARCHAR(100),
    level_description TEXT
);

CREATE TABLE group_inst (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    level_id INT,
    group_teacher INT,
    group_name VARCHAR(100),
    start_date DATE,
    end_date DATE,
    schedule VARCHAR(100)
);

CREATE TABLE Group_Person (
    person_id INT,
    group_id INT,
    calification FLOAT,
    calification_date DATE,
    start_date DATE,
    end_date DATE,
    level_cost INT,
    material_cost INT,
    LEVEL_MODALITY ENUM('In-person', 'virtual'),
    level_duration VARCHAR(50),
    PRIMARY KEY (person_id, group_id)
);

CREATE TABLE Certificate (
    certificate_id INT AUTO_INCREMENT PRIMARY KEY,
    person_id INT,
    CERTIFICATE_TYPE ENUM('BASIC', 'NOTES', 'COSTO'),
    generation_date DATE
);

CREATE TABLE Certificate_Code (
    validation_id INT AUTO_INCREMENT PRIMARY KEY,
    certificate_id INT,
    code VARCHAR(100)
);

CREATE TABLE Certificate_Level (
    certificate_id INT,
    level_id INT,
    PRIMARY KEY (certificate_id, level_id)
);

ALTER TABLE Person
    ADD CONSTRAINT fk_person_location FOREIGN KEY (id_location) REFERENCES Location(id_location);

ALTER TABLE Level
    ADD CONSTRAINT fk_level_course FOREIGN KEY (id_course) REFERENCES Course(id_course);

ALTER TABLE group_inst
    ADD CONSTRAINT fk_group_level FOREIGN KEY (level_id) REFERENCES Level(level_id),
    ADD CONSTRAINT fk_group_teacher FOREIGN KEY (group_teacher) REFERENCES Person(person_id);

ALTER TABLE Group_Person
    ADD CONSTRAINT fk_gp_person FOREIGN KEY (person_id) REFERENCES Person(person_id),
    ADD CONSTRAINT fk_gp_group FOREIGN KEY (group_id) REFERENCES group_inst(group_id);

ALTER TABLE Certificate
    ADD CONSTRAINT fk_certificate_person FOREIGN KEY (person_id) REFERENCES Person(person_id);

ALTER TABLE Certificate_Code
    ADD CONSTRAINT fk_cert_code_certificate FOREIGN KEY (certificate_id) REFERENCES Certificate(certificate_id);

ALTER TABLE Certificate_Level
    ADD CONSTRAINT fk_cert_level_certificate FOREIGN KEY (certificate_id) REFERENCES Certificate(certificate_id),
    ADD CONSTRAINT fk_cert_level_level FOREIGN KEY (level_id) REFERENCES Level(level_id);
ALTER TABLE Location
    ADD CONSTRAINT fk_location_parent FOREIGN KEY (id_location_f) REFERENCES Location(id_location);
ALTER TABLE Login
	ADD CONSTRAINT fk_login_person FOREIGN KEY (id_person) REFERENCES Person(person_id)
ALTER TABLE Group_Person
MODIFY COLUMN LEVEL_MODALITY ENUM('In_person', 'virtual');