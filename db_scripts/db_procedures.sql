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
	if (select 1 = 1 from users where p_username = username and md5(p_pass) = pass and account_status = 1) then
		select id, role_id , 'Logged in successfully!' message 
        from users 
        where p_username = username and md5(p_pass) = pass;
	else
		signal sqlstate '45000'
        set message_text = 'Invalid username or password'; 
	end if;
    commit;
end //

drop procedure if exists `sp_view_profile` //
create procedure `sp_view_profile`(in p_user_id bigint unsigned)
begin
	declare exit handler for sqlexception
    begin
        get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
        select concat_ws(': ', @p1, @p2) as error_message;
        rollback;
	end;
    start transaction;
    select username, email, phone from users where id = p_user_id;
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
    if (md5(p_pass) != (select pass from users where id = p_id)) then
		update users
		set pass = md5(p_pass) where id = p_id;
		select 'Password changed successfully!' message;
	else 
		signal sqlstate '45004'
        set message_text = 'You are already using this password'; 
	end if;
    commit;
end //

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
			insert into users values(null, p_username, md5(p_pass), p_phone, p_email, 1, 2, now());
            select 'Registered successfully!' message, last_insert_id() id;
		end;
	end if;
    commit;
end //

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
    select title, district_id into v_ward, v_district_id from ward where id = p_ward_id;
    select title, province_id into v_district, v_province_id from district where id = v_district_id;
    select name into v_province from province where id = v_province_id;
    insert into address values(null, concat_ws(', ', p_address, v_ward, v_district, v_province), p_ward_id, now());
    insert into patient values(null, p_user_id, p_fullname, p_dob, p_gender, last_insert_id(), now());
    select 'Profile created successfully' message, last_insert_id() id;
    commit;
end //

drop procedure if exists `sp_deactivate_user` //
create procedure `sp_deactivate_user`(in p_user_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		update users
		set account_status = 0 where id = p_user_id;
		select 'Account Deactivated' message;
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
		if (p_type_id = 1) then 
        (
			select biz.id, biz.business_name, addr.fulladdress from doctor_address da
				left join business biz on da.business_id = biz.id
				left join address addr on da.address_id = addr.id
                left join ward wrd on addr.ward_id = wrd.id
			where biz.type_id = p_type_id and wrd.id = p_ward_id
        );
        else
        (
			select biz.id, concat(biz.business_name,': ', br.branch_name ) business_name, addr.fulladdress 
            from pharmacy_branch br
				left join business biz on br.business_id = biz.id
				left join address addr on br.address_id = addr.id
                left join ward wrd on addr.ward_id = wrd.id
			where biz.type_id = p_type_id and wrd.id = p_ward_id
        );
        end if;
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
		select pb.id, br.branch_name, addr.fulladdress
        from pharmacy_branch pb
			left join address addr on pb.address_id = addr.id
        where pb.business_id = p_business_id;
    commit;
end //

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
					left join doctor_address da on biz.id = da.business_id
					left join address addr on addr.id = da.address_id
				where biz.type_id = 1 and p_dept_id = dd.dept_id and addr.ward_id = p_ward_id
			);
			when p_ward_id is null and p_district_id is not null then (
				select biz.id, biz.business_name, addr.fulladdress from business biz
					left join doctor_department dd on dd.doc_id = biz.id
					left join doctor_address da on biz.id = da.business_id
					left join address addr on addr.id = da.address_id
					left join ward wrd on wrd.id = addr.ward_id
				where biz.type_id = 1 and p_dept_id = dd.dept_id and wrd.district_id = p_district_id
                );
			when p_ward_id is null and p_district_id is null and p_province_id is not null then (
				select biz.id, biz.business_name, addr.fulladdress from business biz
					left join doctor_department dd on dd.doc_id = biz.id
					left join doctor_address da on biz.id = da.business_id
					left join address addr on addr.id = da.address_id
					left join ward wrd on wrd.id = addr.ward_id
					left join district dist on dist.id = wrd.district_id
				where biz.type_id = 1 and p_dept_id = dd.dept_id and dist.province_id = p_province_id
			);
			else (
				select biz.id, biz.business_name, addr.fulladdress from business biz
					left join doctor_department dd on dd.doc_id = biz.id
					left join doctor_address da on biz.id = da.business_id
					left join address addr on addr.id = da.address_id
				where biz.type_id = 1 and p_dept_id = dd.dept_id
			);
			end case;
		elseif p_dept_id is null then
			case 
            when p_ward_id is not null then (
				select biz.id, biz.business_name, addr.fulladdress from business biz
					left join doctor_address da on biz.id = da.business_id
					left join address addr on addr.id = da.address_id
				where biz.type_id = 1 and addr.ward_id = p_ward_id
			);
			when p_ward_id is null and p_district_id is not null then (
				select biz.id, biz.business_name, addr.fulladdress from business biz
					left join doctor_address da on biz.id = da.business_id
					left join address addr on addr.id = da.address_id
					left join ward wrd on wrd.id = addr.ward_id
				where biz.type_id = 1 and wrd.district_id = p_district_id
                );
			when p_ward_id is null and p_district_id is null and p_province_id is not null then (
				select biz.id, biz.business_name, addr.fulladdress from business biz
					left join doctor_address da on biz.id = da.business_id
					left join address addr on addr.id = da.address_id
					left join ward wrd on wrd.id = addr.ward_id
					left join district dist on dist.id = wrd.district_id
				where biz.type_id = 1 and dist.province_id = p_province_id
			);
			else (
				select biz.id, biz.business_name, addr.fulladdress from business biz
					left join doctor_address da on biz.id = da.business_id
					left join address addr on addr.id = da.address_id
				where biz.type_id = 1
			);
			end case;
        end if;
    commit;
end //

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
			select biz.id, concat(biz.business_name,': ', br.branch_name ) business_name, addr.fulladdress from business biz
				left join pharmacy_branch br on biz.id = br.business_id
				left join address addr on addr.id = br.address_id
			where biz.type_id = 2 and addr.ward_id = p_ward_id
		);
		when p_ward_id is null and p_district_id is not null then (
			select biz.id, concat(biz.business_name,': ', br.branch_name ) business_name, addr.fulladdress from business biz
				left join pharmacy_branch br on biz.id = br.business_id
				left join address addr on addr.id = br.address_id
				left join ward wrd on wrd.id = addr.ward_id
			where biz.type_id = 2 and wrd.district_id = p_district_id
		);
		when p_ward_id is null and p_district_id is null and p_province_id is not null then (
			select biz.id, concat(biz.business_name,': ', br.branch_name ) business_name, addr.fulladdress from business biz
				left join pharmacy_branch br on biz.id = br.business_id
				left join address addr on addr.id = br.address_id
				left join ward wrd on wrd.id = addr.ward_id
				left join district dist on dist.id = wrd.district_id
			where biz.type_id = 2 and dist.province_id = p_province_id
		);
		else (
			select biz.id, concat(biz.business_name,': ', br.branch_name ) business_name, addr.fulladdress from business biz
				left join pharmacy_branch br on biz.id = br.business_id
				left join address addr on addr.id = br.address_id
			where biz.type_id = 2
		);
		end case;
    commit;
end //

drop procedure if exists `sp_branch_details` //
create procedure `sp_branch_details` (in p_pharmacy_id bigint unsigned, in p_branch_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		select br.id, br.branch_name, addr.fulladdress 
        from pharmacy_branch br
			left join address addr on addr.id = br.address_id
        where business_id = p_pharmacy_id and br.id = p_branch_id;
	commit;
end //

drop procedure if exists `sp_doctor_schedule` //
create procedure `sp_doctor_schedule` (p_doctor_id bigint unsigned, 
	p_day date, p_time bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		insert into work_schedule values(null, p_doctor_id, p_day, p_time, now());
        select last_insert_id(), "Update sucessfull" message;
	commit;
end //

drop procedure if exists `sp_doctor_appointment` //
create procedure `sp_doctor_appointment` (p_patient_id bigint unsigned, p_sched_id bigint unsigned)
begin
	declare exit handler for sqlexception
		begin
			get diagnostics condition 1 @p1 = returned_sqlstate, @p2 = message_text;
			select concat_ws(': ', @p1, @p2) as error_message;
			rollback;
		end;
	start transaction;
		if (select 1 = 1 from doctor_appoinment where sched_id = p_sched_id) then
			signal sqlstate '45010'
			set message_text = 'Schedule is not free';
		else
			insert into doctor_appointment values(null, p_patient_id, p_sched_id, now());
			select last_insert_id() id, 'Appointment made' message;
		end if;
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

delimiter ;