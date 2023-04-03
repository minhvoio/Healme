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
			insert into users values(null, p_username, md5(p_pass), p_phone, p_email, 1, 1, now());
            select 'Registered successfully!' message;
		end;
	end if;
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
    update users
    set pass = md5(p_pass) where id = p_id;
    select 'Password changed successfully!' message;
    commit;
end //

drop procedure if exists `sp_create_patient_profile` //
create procedure `sp_create_patient_profile`(in p_user_id bigint unsigned, in p_fullname varchar(255), in p_dob datetime, 
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
    select title into v_province from province where id = v_province_id;
    insert into address values(null, concat_ws(', ', p_address, v_ward, v_district, v_province), p_ward, now());
    insert into patient values(null, p_user_id, p_fullname, p_dob, p_gender, last_insert_id(), now());
    select 'Profile created successfully' message;
    commit;
end //

delimiter ;