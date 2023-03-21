create database healthcare
character set utf8mb4
collate utf8mb4_unicode_ci;

use healthcare;

create table roles
(
	id tinyint unsigned primary key auto_increment,
    title varchar(255)
);

create table users
(
	id bigint unsigned primary key auto_increment,
    username varchar(255) unique not null,
    pass text not null,
    phone varchar(255),
    email varchar(255),
    account_status tinyint unsigned,
    role_id tinyint unsigned,
    created_date datetime,
    constraint fk_users_roles foreign key(role_id) references roles(id)
);


create table province
(
	id bigint unsigned primary key auto_increment,
    name varchar(255),
    search_text text,
    created_date datetime
);

create table district
(
	id bigint unsigned primary key auto_increment,
    title varchar(255),
    province_id bigint unsigned,
    search_text text,
    created_date datetime,
    constraint fk_district_province foreign key(province_id) references province(id)
);

create table ward
(
	id bigint unsigned primary key auto_increment,
    title varchar(255),
    district_id bigint unsigned,
    search_text text,
    created_date datetime,
    constraint fk_ward_district foreign key(district_id) references district(id)
);


create table address
(
	id bigint unsigned primary key auto_increment,
    fulladdress text,
    ward_id bigint unsigned,
    created_date datetime,
    constraint fk_address_ward foreign key(ward_id) references ward(id)
);

create table patient
(
	id bigint unsigned primary key auto_increment,
    user_id bigint unsigned,
    fullname varchar(255),
    date_of_birth datetime,
    gender enum('Male', 'Female'),
    address_id bigint unsigned,
    created_date datetime,
    constraint fk_patient_users foreign key(user_id) references users(id),
    constraint fk_patient_addr foreign key(address_id) references address(id)
);

create table business_type
(
	id tinyint unsigned primary key auto_increment,
    title varchar(255),
    created_date datetime
);

create table business
(
	id bigint unsigned primary key auto_increment,
    business_name text,
    rep_user_id bigint unsigned,
    type_id tinyint unsigned,
    created_date datetime,
    constraint fk_business_users foreign key(rep_user_id) references users(id),
    constraint fk_business_type foreign key(type_id) references business_type(id)
);

create table doctor_address
(
	id bigint unsigned primary key auto_increment,
    business_id bigint unsigned,
    address_id bigint unsigned,
    created_date datetime,
    constraint fk_doctor_address foreign key(business_id) references business(id),
    constraint fk_address_doctor foreign key(address_id) references address(id)
);

create table medicine
(
	id bigint unsigned primary key auto_increment,
    title text,
    created_date datetime
);

create table ingredient
(
	id bigint unsigned primary key auto_increment,
    title text,
    created_date datetime
);

create table medicine_ingredient
(
	id bigint unsigned primary key auto_increment,
    medicine_id bigint unsigned,
    ingredient_id bigint unsigned,
    amount float,
    created_date datetime,
    constraint fk_med_ingredient foreign key(ingredient_id) references ingredient(id),
    constraint fk_ingredient_med foreign key(medicine_id) references medicine(id)
);

create table symptom
(
	id bigint unsigned primary key auto_increment,
    descr text,
    created_date datetime
);

create table department
(
	id bigint unsigned primary key auto_increment,
    title varchar(255),
    created_date datetime
);

create table symptom_department
(
	id bigint unsigned primary key auto_increment,
    symp_id bigint unsigned,
    dept_id bigint unsigned,
    created_date datetime,
    constraint fk_dept_symp foreign key(symp_id) references symptom(id),
    constraint fk_symp_dept foreign key(dept_id) references department(id)
);

create table doctor_department
(
	id bigint unsigned primary key auto_increment,
    doc_id bigint unsigned,
    dept_id bigint unsigned,
    created_date datetime,
    constraint fk_dept_doc foreign key(doc_id) references business(id),
    constraint fk_doc_dept foreign key(dept_id) references department(id)
);

create table prescription
(
	id bigint unsigned primary key auto_increment,
    doc_id bigint unsigned,
    pt_id bigint unsigned,
    created_date datetime,
    constraint fk_pres_doc foreign key(doc_id) references business(id),
    constraint fk_pres_pt foreign key(pt_id) references patient(id)
);

create table prescription_details
(
	id bigint unsigned primary key auto_increment,
    pres_id bigint unsigned,
    med_id bigint unsigned,
    dosage int unsigned,
    duration int unsigned,
    note text,
    created_date datetime,
    constraint fk_pd_pres foreign key(pres_id) references prescription(id),
    constraint fk_pd_med foreign key(med_id) references medicine(id)
);

create table patient_history
(
	id bigint unsigned primary key auto_increment,
    pt_id bigint unsigned,
    symp_id bigint unsigned,
    pt_status tinyint unsigned,
    created_date datetime,
    constraint fk_hist_pt foreign key(pt_id) references patient(id),
	constraint fk_hist_symp foreign key(symp_id) references symptom(id)
);

create table work_schedule
(
	id bigint unsigned primary key auto_increment,
    doc_id bigint unsigned,
    workday date,
    workhour enum('8:00 - 9:30', '9:30 - 11:00', '12:00 - 13:30', '13:30 - 15:00', '15:00 - 16:30', '16:30 - 18:00'),
    created_date datetime,
    constraint fk_doc_schedule foreign key(doc_id) references business(id)
);

create table doctor_appointment
(
	id bigint unsigned primary key auto_increment,
    pt_id bigint unsigned,
    sched_id bigint unsigned,
    created_date datetime,
    constraint fk_appt_pt foreign key(pt_id) references patient(id),
    constraint fk_appt_sched foreign key(sched_id) references work_schedule(id)
);

create table pharmacy_branch
(
	id bigint unsigned primary key auto_increment,
    business_id bigint unsigned,
    user_id bigint unsigned,
    address_id bigint unsigned,
    constraint fk_branch_business foreign key(business_id) references business(id),
    constraint fk_branch_users foreign key(user_id) references users(id),
    constraint fk_branch_addr foreign key(address_id) references address(id)
);

create table branch_medicine
(
	id bigint unsigned primary key auto_increment,
    branch_id bigint unsigned,
    medicine_id bigint unsigned,
    stock int,
    price int,
    constraint fk_medicine_branch foreign key(branch_id) references pharmacy_branch(id),
    constraint fk_branch_medicine foreign key(medicine_id) references medicine(id)
);