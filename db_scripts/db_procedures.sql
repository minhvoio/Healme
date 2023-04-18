use healthcare;

delimiter //
drop procedure if exists `sp_login` //
create procedure `sp_login`(in p_username varchar(255), in p_pass varchar(255))
begin
	declare exit handler for sqlexception
    begin
        get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
        select concat_ws(': ', @p1, @p2) as error_message;
        rollback;
	end;
    start transaction;
	if (select 1 = 1 from users where p_username = username and p_pass = pass and account_status = 1) then
		select id, role_id , 'Logged in successfully!' message 
        from users 
        where p_username = username and md5(p_pass) = pass;
	else
		signal sqlstate '45000'
        set message_text = 'Invalid username or password'; 
	end if;
    commit;
end //

drop procedure if exists `sp_all_users` //
create procedure `sp_all_users`()
begin
	declare exit handler for sqlexception
    begin
        get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
        select concat_ws(': ', @p1, @p2) as error_message;
        rollback;
	end;
    start transaction;
		select usr.*, r.title `role` from users usr
			join roles r on usr.role_id = r.id;
    commit;
end //

drop procedure if exists `sp_view_profile` //
create procedure `sp_view_profile`(p_id bigint unsigned)
begin
	declare exit handler for sqlexception
    begin
        get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
        select concat_ws(': ', @p1, @p2) as error_message;
        rollback;
	end;
    start transaction;
		select usr.*, r.title `role` from users usr
			join roles r on usr.role_id = r.id
		where usr.id = p_id;
    commit;
end //


drop procedure if exists `sp_update_profile` //
create procedure `sp_update_profile`(in p_id bigint unsigned, 
	in p_username varchar(255), in p_email varchar(255), in p_phone varchar(255))
begin
	declare exit handler for sqlexception
    begin
        get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
        select concat_ws(': ', @p1, @p2) as error_message;
        rollback;
	end;
    start transaction;
    if p_username is null then set p_username = (select username from users where id = p_id); end if;
    if p_email is null then set p_email = (select email from users where id = p_id); end if;
    if p_phone is null then set p_phone = (select phone from users where id = p_id); end if;
	if (select 1 = 1 from users where p_username = username and id != p_id) then
		signal sqlstate '45001'
        set message_text = 'Username already in use'; 
	elseif (select 1 = 1 from users where p_email is not null and p_email = email and id != p_id) then
		signal sqlstate '45002'
        set message_text = 'Email already in use'; 
	elseif (select 1 = 1 from users where p_phone is not null and p_phone = phone and id != p_id) then
		signal sqlstate '45003'
        set message_text = 'Phone number already in use'; 
	else
		begin
			update users
			set username = p_username, phone = p_phone, email = p_email where id = p_id;
			select 'Profile updated successfully!' message;
        end;
	end if;
    commit;
end //

delimiter //
drop procedure if exists `sp_change_password` //
create procedure `sp_change_password`(in p_id bigint unsigned, in p_pass text)
begin
	declare exit handler for sqlexception
    begin
        get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
        select concat_ws(': ', @p1, @p2) as error_message;
        rollback;
	end;
    start transaction;
    update users
    set pass = p_pass where id = p_id;
    select 'Password changed successfully!' message;
    commit;
end //

delimiter //
drop procedure if exists `sp_register` //
create procedure `sp_register`(
	in p_username varchar(255), in p_pass varchar(255), in p_email varchar(255), in p_phone varchar(255))
begin
	declare exit handler for sqlexception
    begin
        get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
        select concat_ws(': ', @p1, @p2) as error_message;
        rollback;
	end;
    start transaction;
	if (select 1 = 1 from users where p_username = username) then
		signal sqlstate '45001'
        set message_text = 'Username already in use'; 
	elseif (select 1 = 1 from users where p_email is not null and p_email = email) then
		signal sqlstate '45002'
        set message_text = 'Email already in use'; 
	elseif (select 1 = 1 from users where p_phone is not null and p_phone = phone) then
		signal sqlstate '45003'
        set message_text = 'Phone number already in use'; 
	else
		begin
			insert into users values(null, p_username, p_pass, p_phone, p_email, 1, 2, now(), null);
            select 'Registered successfully!' message, last_insert_id() id;
		end;
	end if;
    commit;
end //

delimiter //
drop procedure if exists `sp_create_patient` //
create procedure `sp_create_patient`(in p_user_id bigint unsigned, in p_fullname varchar(255), in p_dob datetime, 
	in p_gender varchar(8), in p_address text, in p_ward_id bigint unsigned)
begin
	declare v_ward varchar(255);
	declare v_district varchar(255);
    declare v_province varchar(255);
    declare v_district_id bigint unsigned;
    declare v_province_id bigint unsigned;
	declare exit handler for sqlexception
    begin
        get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
        select concat_ws(': ', @p1, @p2) as error_message;
        rollback;
	end;
    start transaction;
		if (select 1 = 1 from patient where user_id = p_user_id) then
			signal sqlstate '45012'
			set message_text = 'User already had profile'; 
		end if;
		select title, district_id into v_ward, v_district_id from ward where id = p_ward_id;
		select title, province_id into v_district, v_province_id from district where id = v_district_id;
		select name into v_province from province where id = v_province_id;
		insert into address values(null, concat_ws(', ', p_address, v_ward, v_district, v_province), p_ward_id, now());
		insert into patient values(null, p_user_id, p_fullname, p_dob, p_gender, last_insert_id(), now());
		select 'Profile created successfully' message, last_insert_id() id;
    commit;
end //

delimiter //
drop procedure if exists `sp_get_user_role_id` //
create procedure `sp_get_user_role_id`(in p_user_id bigint unsigned, in p_role_id tinyint unsigned)
begin
	declare exit handler for sqlexception
    begin
        get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
        select concat_ws(': ', @p1, @p2) as error_message;
        rollback;
	end;
    start transaction;
		if (p_role_id = 2) then
			select id user_role_id from patient where user_id = p_user_id;
		elseif (p_role_id = 3) then
			select id user_role_id from business where rep_user_id = p_user_id;
		else select 0 user_role_id;
		end if;
    commit;
end //

delimiter //
drop procedure if exists `sp_deactivate_user` //
create procedure `sp_deactivate_user`(in p_user_id bigint unsigned)
begin
	declare v_status tinyint unsigned;
    declare v_message varchar(64);
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select account_status into v_status from users where id = p_user_id;
        if v_status = 1 then 
			set v_status = 0;
            set v_message = 'Account Deactivated';
        else 
			set v_status = 1;
            set v_message = 'Account Reactivated';
        end if;
		update users
		set account_status = v_status where id = p_user_id;
		select v_message message;
	commit;
end//

drop procedure if exists `sp_search_department` //
create procedure `sp_search_department` (in p_searchtext text)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select id, title from department where title like concat('%', p_searchtext, '%');
    commit;
end //

drop procedure if exists `sp_search_ward` //
create procedure `sp_search_ward` (in p_searchtext text)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select id, title from ward where title like concat('%', p_searchtext, '%');
    commit;
end //

drop procedure if exists `sp_search_district` //
create procedure `sp_search_district` (in p_searchtext text)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select id, title from district where title like concat('%', p_searchtext, '%');
    commit;
end //

drop procedure if exists `sp_search_province` //
create procedure `sp_search_province` (in p_searchtext text)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select id, name from province where title like concat('%', p_searchtext, '%');
    commit;
end //

delimiter //
drop procedure if exists `sp_search_medicine` //
create procedure `sp_search_medicine` (in p_searchtext text)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select * from medicine where title like concat('%', p_searchtext, '%');
    commit;
end //

drop procedure if exists `sp_filter_by_department` //
create procedure `sp_filter_by_department` (in p_dept_id text)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select biz.id, biz.business_name from doctor_department dd
			left join business biz on dd.doc_id = biz.id
            left join department dept on dd.dept_id = dept.id
		where dept.id = p_dept_id or p_dept_id is null;
    commit;
end //

delimiter //
drop procedure if exists `sp_filter_by_area` //
create procedure `sp_filter_by_area` (in p_type_id tinyint unsigned, in p_ward_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select biz.id, biz.business_name, addr.fulladdress from doctor_address da
			left join business biz on da.business_id = biz.id
			left join address addr on da.address_id = addr.id
			left join ward wrd on addr.ward_id = wrd.id
		where biz.type_id = p_type_id and wrd.id = p_ward_id;
    commit;
end //

drop procedure if exists `sp_ward_by_dist` //
create procedure `sp_ward_by_dist` (in p_dist_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select id, title from ward where district_id = p_dist_id;
    commit;
end //

drop procedure if exists `sp_dist_by_province` //
create procedure `sp_dist_by_province` (in p_prvn_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select id, title from district where province_id = p_prvn_id;
    commit;
end //

delimiter //
drop procedure if exists `sp_branch_by_pharmacy` //
create procedure `sp_branch_by_pharmacy` (in p_business_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select biz.id, biz.business_name, addr.fulladdress
        from business biz
			left join address addr on biz.address_id = addr.id
        where biz.branch_of = p_business_id;
    commit;
end //

delimiter //
drop procedure if exists `sp_filter_clinics` //
create procedure `sp_filter_clinics` (in p_dept_id bigint unsigned, 
	in p_ward_id bigint unsigned, in p_district_id bigint unsigned, in p_province_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		if p_dept_id is not null then
			case 
            when p_ward_id is not null then (
				select biz.id, biz.business_name, addr.fulladdress from business biz
					left join doctor_department dd on dd.doc_id = biz.id
					left join address addr on addr.id = biz.address_id
				where biz.type_id = 1 and p_dept_id = dd.dept_id and addr.ward_id = p_ward_id
			);
			when p_ward_id is null and p_district_id is not null then (
				select biz.id, biz.business_name, addr.fulladdress from business biz
					left join doctor_department dd on dd.doc_id = biz.id
					left join address addr on addr.id = biz.address_id
					left join ward wrd on wrd.id = addr.ward_id
				where biz.type_id = 1 and p_dept_id = dd.dept_id and wrd.district_id = p_district_id
                );
			when p_ward_id is null and p_district_id is null and p_province_id is not null then (
				select biz.id, biz.business_name, addr.fulladdress from business biz
					left join doctor_department dd on dd.doc_id = biz.id
					left join address addr on addr.id = biz.address_id
					left join ward wrd on wrd.id = addr.ward_id
					left join district dist on dist.id = wrd.district_id
				where biz.type_id = 1 and p_dept_id = dd.dept_id and dist.province_id = p_province_id
			);
			else (
				select biz.id, biz.business_name, addr.fulladdress from business biz
					left join doctor_department dd on dd.doc_id = biz.id
					left join address addr on addr.id = biz.address_id
				where biz.type_id = 1 and p_dept_id = dd.dept_id
			);
			end case;
		elseif p_dept_id is null then
			case 
            when p_ward_id is not null then (
				select biz.id, biz.business_name, addr.fulladdress from business biz
					left join address addr on addr.id = biz.address_id
				where biz.type_id = 1 and addr.ward_id = p_ward_id
			);
			when p_ward_id is null and p_district_id is not null then (
				select biz.id, biz.business_name, addr.fulladdress from business biz
					left join address addr on addr.id = biz.address_id
					left join ward wrd on wrd.id = addr.ward_id
				where biz.type_id = 1 and wrd.district_id = p_district_id
                );
			when p_ward_id is null and p_district_id is null and p_province_id is not null then (
				select biz.id, biz.business_name, addr.fulladdress from business biz
					left join address addr on addr.id = biz.address_id
					left join ward wrd on wrd.id = addr.ward_id
					left join district dist on dist.id = wrd.district_id
				where biz.type_id = 1 and dist.province_id = p_province_id
			);
			else (
				select biz.id, biz.business_name, addr.fulladdress from business biz
					left join address addr on addr.id = biz.address_id
				where biz.type_id = 1
			);
			end case;
        end if;
    commit;
end //

delimiter //
drop procedure if exists `sp_filter_pharmacies` //
create procedure `sp_filter_pharmacies` (
in p_ward_id bigint unsigned, in p_district_id bigint unsigned, in p_province_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		case 
        when p_ward_id is not null then (
			select biz.id, biz.business_name, addr.fulladdress from business biz
				left join address addr on addr.id = biz.address_id
			where biz.type_id = 2 and addr.ward_id = p_ward_id
		);
		when p_ward_id is null and p_district_id is not null then (
			select biz.id, biz.business_name, addr.fulladdress from business biz
				left join address addr on addr.id = biz.address_id
				left join ward wrd on wrd.id = addr.ward_id
			where biz.type_id = 2 and wrd.district_id = p_district_id
		);
		when p_ward_id is null and p_district_id is null and p_province_id is not null then (
			select biz.id, biz.business_name, addr.fulladdress from business biz
				left join address addr on addr.id = biz.address_id
				left join ward wrd on wrd.id = addr.ward_id
				left join district dist on dist.id = wrd.district_id
			where biz.type_id = 2 and dist.province_id = p_province_id
		);
		else (
			select biz.id, biz.business_name, addr.fulladdress from business biz
				left join address addr on addr.id = biz.address_id
			where biz.type_id = 2
		);
		end case;
    commit;
end //

delimiter //
drop procedure if exists `sp_pharmacy_medicine` //
create procedure `sp_pharmacy_medicine` (in p_pharmacy_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select pm.*, biz.business_name, med.title
        from pharmacy_medicine pm
			left join business biz on pm.pharmacy_id = biz.id
            left join medicine med on pm.medicine_id = med.id
        where pharmacy_id = p_pharmacy_id and status = 1;
	commit;
end //

delimiter //
drop procedure if exists `sp_doctor_schedule` //
create procedure `sp_doctor_schedule` (p_doctor_id bigint unsigned, p_day date, p_time tinyint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		if (select 1 = 1 from work_schedule where doc_id = p_doctor_id and workday = p_day and time_id = p_time and status = 1) then
			signal sqlstate '45021'
			set message_text = 'Schedule already registered'; 
		end if;
		insert into work_schedule values(null, p_doctor_id, p_day, p_time, 1, now());
        select last_insert_id() id, "Created sucessfull" message;
	commit;
end //

delimiter //
drop procedure if exists `sp_doctor_appointment` //
create procedure `sp_doctor_appointment` (p_patient_id bigint unsigned, p_doc_id bigint unsigned, 
	p_sched_id bigint unsigned, p_hour_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		if (select 1 = 1 from doctor_appointment where sched_id = p_sched_id and hour_id = p_hour_id and status = 1) then
			signal sqlstate '45010'
			set message_text = 'Schedule is not free';
		else
			insert into doctor_appointment values(null, p_patient_id, p_doc_id, p_sched_id, p_hour_id, null, now(), 1);
			select last_insert_id() id, 'Appointment made' message;
		end if;
	commit;
end //

drop procedure if exists sp_cancel_appointment //
create procedure sp_cancel_appointment(p_appt_id bigint unsigned)
begin
	declare v_pres_id bigint unsigned;
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		update doctor_appointment
        set status = 0 where id = p_appt_id;
        select pt_id, sched_id from doctor_appointment where id = p_appt_id;
	commit;
end //

drop procedure if exists `sp_business_email` //
create procedure `sp_business_email` (p_biz_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select usr.email from business biz 
			left join users usr on biz.rep_user_id = usr.id
		where biz.id = p_biz_id;
	commit;
end //


delimiter //
drop procedure if exists `sp_patient_email` //
create procedure `sp_patient_email` (p_pt_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select usr.email from patient pt 
			left join users usr on pt.user_id = usr.id
		where pt.id = p_pt_id;
	commit;
end //

delimiter //
drop procedure if exists `sp_appt_info` //
create procedure `sp_appt_info` (p_appt_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select biz.business_name, usr.email, ifnull(sched.workday, curdate()) workday, ifnull(hr.details, 'NaN') appt_hour 
        from doctor_appointment appt 
			left join work_schedule sched on appt.sched_id = sched.id
			left join business biz on appt.doc_id = biz.id
            left join appt_hour hr on hr.id = appt.hour_id
			left join users usr on biz.rep_user_id = usr.id
		where appt.id = p_appt_id;
	commit;
end //

delimiter //
drop procedure if exists sp_prescription_details //
create procedure sp_prescription_details(p_pres_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select pd.id, pd.pres_id, med.title, med.ingredients, med.med_type, med.supplier, pd.note
        from prescription_details pd
			left join medicine med on pd.med_id = med.id
        where pd.pres_id = p_pres_id and pd.status = 1;
	commit;
end //

delimiter //
drop procedure if exists sp_view_prescription //
create procedure sp_view_prescription(pt_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select pres.id pres_id, biz.business_name, pres.created_date
        from patient pt
        left join prescription pres on pres.pt_id = pt.id
            left join business biz on pres.doc_id = biz.id
        where pt.id = pt_id;
	commit;
end //

delimiter //
drop procedure if exists sp_prescribe //
create procedure sp_prescribe(p_pt_id bigint unsigned, p_doc_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		insert into prescription values(null, p_doc_id, p_pt_id, now(), 1);
        select "Success" as message, last_insert_id() id; 
	commit;
end //

delimiter //
drop procedure if exists sp_add_prescription_details //
create procedure sp_add_prescription_details(p_pres_id bigint unsigned, p_med_id bigint unsigned, p_note text)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		if (select 1 = 1 from prescription_details 
        where pres_id = p_pres_id and med_id = p_med_id and status = 1)
        then 
			signal sqlstate '45011'
			set message_text = 'Medicine already prescribed'; 
		end if;
		insert into prescription_details values(null, p_pres_id, p_med_id, p_note, now(), 1);
        select "Success" as message, last_insert_id() id; 
	commit;
end //

delimiter //
drop procedure if exists sp_delete_prescription_details //
create procedure sp_delete_prescription_details(p_pd_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		update prescription_details 
        set status = 0 where id = p_pd_id;
        select "Success" as message; 
	commit;
end //

delimiter //
drop procedure if exists sp_update_prescription_details //
create procedure sp_update_prescription_details(p_pd_id bigint unsigned, p_med_id bigint unsigned, p_note text)
begin
	declare v_pres_id bigint unsigned;
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		if p_med_id is not null then
			select pres_id into v_pres_id from prescription_details where id = p_pd_id;
			if (select 1 = 1 from prescription_details 
				where pres_id = v_pres_id and med_id = p_med_id 
					and id != p_pd_id and status = 1)
			then signal sqlstate '45011'
				set message_text = 'Medicine already prescribed'; 
            else
				update prescription_details 
				set med_id = p_med_id where id = p_pd_id;
			end if;
		end if;
        
		if p_note is not null then
			update prescription_details 
			set note = p_note where id = p_pd_id;
		end if;
        
        if p_med_id is null and p_note is null then
			select "No information was updated" as message;
		else select "Success" as message;
        end if;
	commit;
end //

delimiter //
drop procedure if exists sp_create_user//
CREATE DEFINER=`healme`@`%` PROCEDURE `sp_create_user`(p_username varchar(255), p_pass text, p_name varchar(255),
	p_role_id tinyint unsigned, p_email varchar(255), p_phone varchar(255))
begin
	declare v_biz_type bigint unsigned;
    declare v_user_id bigint unsigned;
    declare v_user_role_id bigint unsigned;
    
    declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
	if (select 1 = 1 from users where p_username = username) then
		signal sqlstate '45001'
        set message_text = 'Username already in use'; 
	elseif (select 1 = 1 from users where p_email is not null and p_email = email) then
		signal sqlstate '45002'
        set message_text = 'Email already in use'; 
	elseif (select 1 = 1 from users where p_phone is not null and p_phone = phone) then
		signal sqlstate '45003'
        set message_text = 'Phone number already in use'; 
	else
		begin
			insert into users values(null, p_username, p_pass, p_phone, p_email, 1, p_role_id, now(), null);
            set v_user_id = last_insert_id();
            
            if (p_role_id > 2) then
				if (p_role_id = 3) then 
					set v_biz_type = 1;
				elseif (p_role_id = 4) then 
					set v_biz_type = 2;
                    set p_role_id = 3;
				end if;
				insert into business(business_name, rep_user_id, type_id, created_date) values(p_name, v_user_id, v_biz_type, now());
			else insert into patient(user_id, fullname, created_date) values(v_user_id, p_name, now());
			end if;
            set v_user_role_id = last_insert_id();
            
            select 'User created!' message, v_user_id user_id, p_role_id role_id, v_user_role_id user_role_id, v_biz_type;
		end;
	end if;
    commit;
end //

delimiter //
drop procedure if exists sp_add_address //
create procedure sp_add_address(p_user_id bigint unsigned, p_address text, p_ward_id bigint unsigned)
begin
	declare v_role_id tinyint unsigned;
    declare v_user_role_id bigint unsigned;
	
	declare v_ward varchar(255);
	declare v_district varchar(255);
    declare v_province varchar(255);
    declare v_district_id bigint unsigned;
    declare v_province_id bigint unsigned;
    declare v_address_id bigint unsigned;
    
	declare exit handler for sqlexception
    begin
        get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
        select concat_ws(': ', @p1, @p2) as error_message;
        rollback;
	end;
    start transaction;
		select title, district_id into v_ward, v_district_id from ward where id = p_ward_id;
		select title, province_id into v_district, v_province_id from district where id = v_district_id;
		select name into v_province from province where id = v_province_id;
		insert into address values(null, concat_ws(', ', p_address, v_ward, v_district, v_province), p_ward_id, now());
        set v_address_id = last_insert_id();
        
        select role_id into v_role_id from users where id = p_user_id;
        if (v_role_id = 2) then
			select pt.id into v_user_role_id from patient pt join users usr on pt.user_id = usr.id
            where usr.id = p_user_id;
			update patient set address_id = v_address_id where id = v_user_role_id;
		elseif (v_role_id = 3) then
			select biz.id into v_user_role_id from business biz join users usr on doc.rep_user_id = usr.id
            where usr.id = p_user_id;
            update business set address_id = v_address_id where id = v_user_role_id;
		end if;
		select 'Address added' message, v_user_role_id id, v_address_id address_id;
    commit;
end //

delimiter //
drop procedure if exists sp_patient_profile //
create procedure sp_patient_profile(p_pt_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select fullname, date_of_birth, gender, addr.fulladdress
        from patient pt left join address addr on pt.address_id = addr.id
        where pt.id = p_pt_id;
	commit;
end //

delimiter //
drop procedure if exists sp_pt_update_profile //
create procedure sp_pt_update_profile(p_pt_id bigint unsigned, p_name varchar(255), p_dob datetime, p_gender varchar(8))
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		if (p_name is not null) then
			update patient
			set fullname = p_name where id = p_pt_id;
		end if;
        
        if (p_dob is not null) then
			update patient
			set date_of_birth = p_dob where id = p_pt_id;
		end if;
        
        if (p_gender is not null) then
			update patient
			set gender = p_gender where id = p_pt_id;
		end if;
        
        select 'Success' message;
	commit;
end //

delimiter //
drop procedure if exists sp_get_clinic //
create procedure sp_get_clinic(p_biz_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select biz.id, biz.business_name, addr.fulladdress, usr.email, usr.phone from business biz
            left join address addr on biz.address_id = addr.id
            left join users usr on biz.rep_user_id = usr.id
		where biz.id = p_biz_id;
	commit;
end //

delimiter //
drop procedure if exists sp_diagnose //
create procedure sp_diagnose(p_appt_id bigint unsigned, p_diagnosis text, p_pres_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		insert into patient_history values(null, p_appt_id, p_diagnosis, p_pres_id, now());
        select 'Success' message, last_insert_id() id;
	commit;
end //

delimiter //
drop procedure if exists sp_schedule_details //
create procedure sp_schedule_details(p_sched_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select * from work_schedule
		where id = p_sched_id and status = 1;
	commit;
end //

delimiter //
drop procedure if exists sp_get_schedule //
create procedure sp_get_schedule(p_doc_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select * from work_schedule
		where doc_id = p_doc_id and status = 1
        order by workday desc;
	commit;
end //

delimiter //
drop procedure if exists sp_update_schedule //
create procedure sp_update_schedule(p_sched_id bigint unsigned, p_time_id tinyint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		if (select 1 = 1 from work_schedule where id = p_sched_id and time_id = p_time_id and status = 1) then
			signal sqlstate '45022'
            set message_text = 'Schedule already registered';
		end if;
		update work_schedule set time_id = p_time_id where id = p_sched_id;
        select 'Success' message;
	commit;
end //

delimiter //
drop procedure if exists sp_delete_schedule //
create procedure sp_delete_schedule(p_sched_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		if (select 1 = 1 from doctor_appointment where sched_id = p_sched_id and status = 1) then
			signal sqlstate '45022'
            set message_text = 'An appointment is made on that day';
		end if;
		update work_schedule set status = 0 where id = p_sched_id;
        select 'Success' message;
	commit;
end //

delimiter //
drop procedure if exists `sp_pharmacy_add_medicine` //
create procedure `sp_pharmacy_add_medicine` (in p_pharmacy_id bigint unsigned, p_medicine_id bigint unsigned, 
	p_stock int, p_price bigint)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		if (select 1 = 1 from pharmacy_medicine where pharmacy_id = p_pharmacy_id and medicine_id = p_medicine_id and status = 1) then
			signal sqlstate '45023'
            set message_text = 'Medicine already added';
		end if;
        
        insert into pharmacy_medicine values (null, p_pharmacy_id, p_medicine_id, p_stock, p_price, now(), 1);
        select last_insert_id() id, 'Added successfully' message;
	commit;
end //

delimiter //
drop procedure if exists `sp_pharmacy_update_medicine` //
create procedure `sp_pharmacy_update_medicine` (in p_id bigint unsigned, p_stock int, p_price bigint)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		if (p_stock is not null) then 
			update pharmacy_medicine set stock = p_stock where id = p_id;
		end if;
        
        if (p_price is not null) then 
			update pharmacy_medicine set price = p_price where id = p_id;
		end if;
        
        select 'Updated successfully' message;
	commit;
end //

delimiter //
drop procedure if exists `sp_pharmacy_delete_medicine` //
create procedure `sp_pharmacy_delete_medicine` (in p_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		update pharmacy_medicine set status = 0 where id = p_id;
        select 'Success' message;
	commit;
end //

delimiter //
drop procedure if exists `sp_patient_appt` //
create procedure `sp_patient_appt` (in p_pt_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select appt.id, biz.business_name, sched.workday, ah.details, appt.meeting_url 
        from doctor_appointment appt
			left join appt_hour ah on appt.hour_id = ah.id
            left join work_schedule sched on sched.id = appt.sched_id
            left join business biz on appt.doc_id = biz.id
        where appt.pt_id = p_pt_id;
	commit;
end //

delimiter //
drop procedure if exists `sp_schedule_appt` //
create procedure `sp_schedule_appt` (in p_sched_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		SELECT sched.id, sched.doc_id, sched.workday, sched.time_id, ah.details, appt.id appt_id, appt.pt_id
		from work_schedule sched
			left join appt_hour ah on sched.time_id = ah.time_id
			left join doctor_appointment appt on appt.sched_id = sched.id and appt.hour_id = ah.id and appt.status = 1
		where sched.id = p_sched_id and sched.status = 1
		order by workday desc, ah.id asc;
	commit;
end //

delimiter //
drop procedure if exists `sp_get_appt` //
create procedure `sp_get_appt` (in p_appt_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		SELECT appt.id, appt.pt_id, pt.fullname patient, appt.doc_id, biz.business_name, 
			sched.workday, ah.details, appt.meeting_url
		from doctor_appointment appt
			left join patient pt on pt.id = appt.pt_id
            left join business biz on biz.id = appt.doc_id
			left join work_schedule sched on appt.sched_id = sched.id
			left join appt_hour ah on appt.hour_id = ah.id 
		where appt.id = p_appt_id and appt.status = 1;
	commit;
end //

delimiter //
drop procedure if exists `sp_prescription_by_appt` //
create procedure `sp_prescription_by_appt` (in p_appt_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select pres.id pres_id, biz.business_name, hist.diagnosis, pres.created_date
        from patient_history hist
			left join prescription pres on pres.id = hist.pres_id
            left join business biz on pres.doc_id = biz.id
        where hist.appt_id = p_appt_id;
	commit;
end //

delimiter //
drop procedure if exists `sp_clear_prescription` //
create procedure `sp_clear_prescription` (in p_pres_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		update prescription_details set status = 0 where pres_id = p_pres_id;
	commit;
end //

delimiter //
drop procedure if exists `sp_update_diagnosis` //
create procedure `sp_update_diagnosis` (in p_pres_id bigint unsigned, p_diagnosis text)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		update patient_history set diagnosis = p_diagnosis where pres_id = p_pres_id;
        select 'Success' message, id history_id, appt_id from patient_history where pres_id = p_pres_id;
	commit;
end //

delimiter //
drop procedure if exists `sp_update_business` //
create procedure `sp_update_business` (in p_biz_id bigint unsigned, p_business_name varchar(255), p_descr text, p_branch_of bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		if p_business_name is not null then
			update business set business_name = p_business_name where id = p_biz_id;
			select 'Success' message;
		end if;
        
		if p_descr is not null then
			update business set descr = p_descr where id = p_biz_id;
			select 'Success' message;
		end if;
        
        if p_branch_of is not null then
			update business set branch_od = p_branch_of where id = p_biz_id;
			select 'Success' message;
		end if;
	commit;
end //

delimiter //
drop procedure if exists `sp_get_pharmacy` //
create procedure `sp_get_pharmacy` (in p_biz_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select biz.id, biz.business_name, biz.type_id, biz.descr, biz.address_id, addr.fulladdress, usr.email, usr.phone
        from business biz
			left join address addr on biz.address_id = addr.id
            left join users usr on biz.rep_user_id = usr.id
        where biz.id = p_biz_id and type_id = 2;
	commit;
end //

delimiter //
drop procedure if exists `sp_create_business_profile` //
create procedure `sp_create_business_profile` (in p_user_id bigint unsigned, in p_business_name varchar(255), in p_type_id tinyint unsigned,
	p_descr text, p_address text, p_ward_id bigint unsigned, p_branch_of_id bigint unsigned)
begin
	declare v_ward varchar(255);
	declare v_district varchar(255);
    declare v_province varchar(255);
    declare v_district_id bigint unsigned;
    declare v_province_id bigint unsigned;
	declare exit handler for sqlexception
    begin
        get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
        select concat_ws(': ', @p1, @p2) as error_message;
        rollback;
	end;
    start transaction;
		if (select 1 = 1 from business where rep_user_id = p_user_id) then
			signal sqlstate '45012'
			set message_text = 'User already had profile'; 
		end if;
		select title, district_id into v_ward, v_district_id from ward where id = p_ward_id;
		select title, province_id into v_district, v_province_id from district where id = v_district_id;
		select name into v_province from province where id = v_province_id;
		insert into address values(null, concat_ws(', ', p_address, v_ward, v_district, v_province), p_ward_id, now());
		insert into business values(null, p_business_name, p_user_id, p_type_id, p_descr, last_insert_id(), p_branch_of_id, now());
		select 'Profile created successfully' message, last_insert_id() biz_id;
    commit;
end //

delimiter ;