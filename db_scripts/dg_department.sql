SET NAMES 'utf8mb4';
USE healthcare;

INSERT INTO department(id, title, created_date) VALUES
(1, 'Tai - Mũi - Họng', '2023-03-16 03:55:30'),
(2, 'Hô hấp', '2023-03-16 02:25:33'),
(3, 'Dị ứng - Miễn dịch', '2023-03-16 23:39:13'),
(4, 'Y học cổ truyền', '2023-03-16 12:15:39'),
(5, 'Vật lý trị liệu - Phục hồi chức năng', '2023-03-16 09:21:20'),
(6, 'Răng - Hàm - Mặt', '2023-03-16 14:50:56'),
(7, 'Cơ Xương Khớp', '2023-03-16 00:09:27'),
(8, 'Dinh dưỡng', '2023-03-16 00:15:15'),
(9, 'Thận - Tiết niệu', '2023-03-16 18:23:23'),
(10, 'Tim mạch', '2023-03-16 07:46:42'),
(11, 'Chấn thương chỉnh hình - Cột sống', '2023-03-16 11:51:05'),
(12, 'Thần kinh', '2023-03-16 00:00:31'),
(13, 'Nhãn khoa', '2023-03-16 16:07:34'),
(14, 'Nội tiết', '2023-03-16 03:52:24'),
(15, 'Ung bướu', '2023-03-16 00:00:14'),
(16, 'Vô sinh - Hiếm muộn', '2023-03-16 22:24:13'),
(17, 'Nhi', '2023-03-16 06:25:43'),
(18, 'Sản phụ khoa', '2023-03-16 06:23:06'),
(19, 'Tiêu hóa - Gan mật', '2023-03-16 00:00:06'),
(20, 'Da liễu - Thẩm mỹ', '2023-03-16 23:53:31'),
(21, 'Đa Khoa', '2023-03-16 23:53:31');

set sql_safe_updates = 0;
update department
set search_text = replace(lower(title),'-','');
set sql_safe_updates = 1;