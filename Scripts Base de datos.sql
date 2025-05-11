#CREATE DATABASE instituto_idiomas_db;

DROP TABLE IF EXISTS certificate_level;
DROP TABLE IF EXISTS certificate_code;
DROP TABLE IF EXISTS certificate;
DROP TABLE IF EXISTS group_person;
DROP TABLE IF EXISTS group_inst;
DROP TABLE IF EXISTS level;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS person_role;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS login;
DROP TABLE IF EXISTS person;
DROP TABLE IF EXISTS location;

COMMIT;

USE instituto_idiomas_db;

CREATE TABLE location (
    id_location INT AUTO_INCREMENT PRIMARY KEY,
    id_location_f INT,
    location_name VARCHAR(100)
);

CREATE TABLE login (
    id_login INT AUTO_INCREMENT PRIMARY KEY,
    id_person INT NOT NULL,
    user_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE person (
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

CREATE TABLE role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    name ENUM('STUDENT', 'TEACHER', 'ADMIN') UNIQUE
);

CREATE TABLE person_role (
    person_id INT,
    role_id INT,
    PRIMARY KEY (person_id, role_id),
    FOREIGN KEY (person_id) REFERENCES person(person_id),
    FOREIGN KEY (role_id) REFERENCES role(role_id)
);


CREATE TABLE course (
    id_course INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100),
    course_description TEXT,
    COURSE_TYPE ENUM('KIDS', 'DEFAULT', 'SKILLS'),
    language VARCHAR(50),
    state BOOLEAN,
    creation_date DATE

);

CREATE TABLE level (
    level_id INT AUTO_INCREMENT PRIMARY KEY,
    id_course INT,
    level_name VARCHAR(100),
    state BOOLEAN,
    level_cost INT,
    material_cost INT,
    LEVEL_MODALITY ENUM('In_person', 'virtual'),
    level_description TEXT
);

CREATE TABLE group_inst (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    level_id INT,
    group_teacher INT,
    group_name VARCHAR(100),
    start_date DATE,
    end_date DATE,
    state BOOLEAN,
    schedule VARCHAR(100)
);

CREATE TABLE group_person (
    person_id INT,
    group_id INT,
    calification FLOAT,
    calification_date DATE,
    start_date DATE,
    end_date DATE,
    level_cost INT,
    material_cost INT,
    LEVEL_MODALITY ENUM('In_person', 'virtual'),
    level_duration VARCHAR(50),
    PRIMARY KEY (person_id, group_id)
);

CREATE TABLE certificate (
    certificate_id INT AUTO_INCREMENT PRIMARY KEY,
    person_id INT,
    CERTIFICATE_TYPE ENUM('BASIC', 'NOTES', 'ALL_LEVEL'),
    generation_date DATE
);

CREATE TABLE certificate_code (
    validation_id INT AUTO_INCREMENT PRIMARY KEY,
    certificate_id INT,
    code VARCHAR(100)
);

CREATE TABLE certificate_level (
    certificate_id INT,
    level_id INT,
    PRIMARY KEY (certificate_id, level_id)
);

COMMIT;

ALTER TABLE person
    ADD CONSTRAINT fk_person_location FOREIGN KEY (id_location) REFERENCES location(id_location);

ALTER TABLE level
    ADD CONSTRAINT fk_level_course FOREIGN KEY (id_course) REFERENCES course(id_course);

ALTER TABLE group_inst
    ADD CONSTRAINT fk_group_level FOREIGN KEY (level_id) REFERENCES level(level_id),
    ADD CONSTRAINT fk_group_teacher FOREIGN KEY (group_teacher) REFERENCES person(person_id);

ALTER TABLE group_person
    ADD CONSTRAINT fk_gp_person FOREIGN KEY (person_id) REFERENCES person(person_id),
    ADD CONSTRAINT fk_gp_group FOREIGN KEY (group_id) REFERENCES group_inst(group_id);

ALTER TABLE certificate
    ADD CONSTRAINT fk_certificate_person FOREIGN KEY (person_id) REFERENCES person(person_id);

ALTER TABLE certificate_code
    ADD CONSTRAINT fk_cert_code_certificate FOREIGN KEY (certificate_id) REFERENCES certificate(certificate_id);

ALTER TABLE certificate_level
    ADD CONSTRAINT fk_cert_level_certificate FOREIGN KEY (certificate_id) REFERENCES certificate(certificate_id),
    ADD CONSTRAINT fk_cert_level_level FOREIGN KEY (level_id) REFERENCES level(level_id);
ALTER TABLE location
    ADD CONSTRAINT fk_location_parent FOREIGN KEY (id_location_f) REFERENCES location(id_location);
ALTER TABLE login
	ADD CONSTRAINT fk_login_person FOREIGN KEY (id_person) REFERENCES person(person_id);
INSERT INTO role (name) VALUES
('STUDENT'),
('TEACHER'),
('ADMIN');

INSERT INTO location (id_location, id_location_f, location_name) VALUES
(1,NULL,'Boyaca'),
(2,1,'Paipa');

COMMIT;