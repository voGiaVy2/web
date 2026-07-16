# Kiểm thử — Tổ Ấm

Checklist kiểm thử thủ công tương ứng tiêu chí "Kiểm thử & Fix lỗi" (1.0đ) trong bảng chấm điểm.
Có thể dùng Postman hoặc trực tiếp trên UI đã deploy.

## 1. Test chức năng cơ bản (Manual Testing)

### Authentication
- [ ] Đăng ký với email mới → thành công, nhận JWT.
- [ ] Đăng ký lại với email đã tồn tại → lỗi 409 "Email này đã được đăng ký."
- [ ] Đăng ký với mật khẩu < 8 ký tự hoặc thiếu số/chữ → lỗi 422 với message rõ ràng.
- [ ] Đăng nhập đúng email/mật khẩu → thành công.
- [ ] Đăng nhập sai mật khẩu → lỗi 401 "Email hoặc mật khẩu không đúng." (không tiết lộ email
      có tồn tại hay không).
- [ ] Gọi `/api/auth/me` không kèm token → lỗi 401.
- [ ] Gọi `/api/auth/me` kèm token hợp lệ → trả về thông tin user (không có password).
- [ ] Quên mật khẩu với email không tồn tại → vẫn trả message thành công chung chung.
- [ ] Đặt lại mật khẩu với token hết hạn (>15 phút) → lỗi 400.
- [ ] Đặt lại mật khẩu thành công → đăng nhập lại bằng mật khẩu mới hoạt động, mật khẩu cũ không
      còn dùng được.
- [ ] Xác thực email qua link trong email (hoặc log console ở dev mode) → `isEmailVerified = true`.

### Rooms
- [ ] `GET /api/rooms` trả danh sách có phân trang.
- [ ] Tìm kiếm theo từ khoá (`?search=`) → chỉ trả phòng khớp tiêu đề/địa chỉ/mô tả.
- [ ] Lọc theo danh mục, khoảng giá (`?categoryId=`, `?minPrice=`, `?maxPrice=`) → đúng kết quả.
- [ ] `GET /api/rooms/:id` với ID không tồn tại → lỗi 404.
- [ ] Tạo phòng khi chưa đăng nhập → lỗi 401.
- [ ] Tạo phòng khi đăng nhập bằng role USER (không phải ADMIN) → lỗi 403.
- [ ] Tạo/sửa/xoá phòng bằng tài khoản ADMIN → thành công.

### Bookings
- [ ] Đặt lịch xem phòng khi chưa đăng nhập → chuyển hướng đăng nhập (frontend) / 401 (API).
- [ ] Đặt lịch với `fromDate >= toDate` → lỗi 400.
- [ ] Đặt lịch cho phòng đã hết trống (`isAvailable=false`) → lỗi 400.
- [ ] Xem danh sách đơn của mình (`/bookings/me`) → chỉ thấy đơn của chính user đó.
- [ ] Admin đổi trạng thái đơn (`PENDING → CONFIRMED`) → thành công; user thường gọi route này
      → lỗi 403.

### Admin dashboard
- [ ] Trang `/admin` chỉ truy cập được khi đăng nhập bằng tài khoản role ADMIN.
- [ ] User thường truy cập `/admin` → tự động chuyển hướng về trang chủ.
- [ ] Dashboard hiển thị đúng số liệu tổng người dùng, tổng phòng, đơn đặt.

## 2. Kiểm tra lỗ hổng OWASP Top 10 cơ bản

| # | Lỗ hổng | Cách test | Kết quả mong đợi |
|---|---|---|---|
| 1 | SQL Injection | Nhập `' OR '1'='1` vào ô tìm kiếm/email/password | Không có lỗi SQL, không bypass được auth (Prisma parameterize toàn bộ) |
| 2 | XSS lưu trữ | Tạo phòng với `title = <script>alert(1)</script>` | Script bị strip/escape, không thực thi khi hiển thị (middleware `xss` + React escape) |
| 3 | Broken Auth | Thử truy cập route cần đăng nhập mà không có token | Trả về 401, không lộ dữ liệu |
| 4 | Broken Access Control | User thường gọi trực tiếp API admin (`/api/admin/users`) qua Postman | Trả về 403 |
| 5 | Sensitive Data Exposure | Kiểm tra response JSON của `/auth/login`, `/auth/me` | Không chứa field `password` |
| 6 | Rate limit / Brute force | Gửi liên tục 15 request login sai trong 15 phút | Từ request thứ 11 bị chặn 429 |
| 7 | CORS sai domain | Gọi API từ origin không nằm trong `CLIENT_URL` (VD Postman set Origin header lạ) | Bị chặn bởi CORS policy |
| 8 | Mass assignment | Gửi thêm field `role: "ADMIN"` khi đăng ký | Bị bỏ qua — API chỉ nhận `name/email/password`, role mặc định `USER` |
| 9 | Lỗi lộ thông tin | Trigger lỗi 500 bất kỳ trên production | Không trả về stack trace |
| 10 | HTTPS | Truy cập link Vercel/Render qua `http://` | Tự động redirect sang `https://` |

## 3. Công cụ hỗ trợ
- **Postman**: import các route trong `API.md`, test từng case ở bảng trên bằng cách tạo
  Collection với các request mẫu (đăng ký, đăng nhập, CRUD phòng, booking).
- **Trình duyệt DevTools**: kiểm tra header response (Network tab) để xác nhận Helmet đã set
  `X-Content-Type-Options`, `X-Frame-Options`.
- **curl** nhanh để test rate limit:
  ```bash
  for i in {1..12}; do
    curl -s -o /dev/null -w "%{http_code}\n" -X POST https://your-backend.onrender.com/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"test@test.com","password":"wrong"}'
  done
  ```
