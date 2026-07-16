# Tổ Ấm — Website Cho Thuê Phòng Trọ

Website full-stack cho thuê phòng trọ: tìm kiếm/lọc phòng, đăng ký/đăng nhập, quên/đổi mật khẩu,
xác thực email, đặt lịch xem phòng, quản trị (dashboard admin, CRUD phòng, quản lý user), bảo mật
theo OWASP cơ bản, và CI/CD tự động deploy.

## Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS + React Router |
| Backend | Node.js + Express |
| Database | MySQL + Prisma ORM |
| Auth | JWT + bcrypt |
| Deploy | Vercel (frontend) + Render (backend) + Railway (MySQL) |
| CI/CD | GitHub Actions |

## Cấu trúc thư mục

```
frontend/   -> React app (Vercel)
backend/    -> Express API (Render)
.github/workflows/ -> CI/CD
```

---

## 1. Chạy thử ở máy local — chỉ chạy lệnh, KHÔNG cần nhập dữ liệu

Dữ liệu (30 phòng, ảnh, danh mục, tài khoản admin/user) được **tự sinh sẵn** bởi script seed,
bạn không cần tạo phòng thủ công. Chỉ cần Node.js và Docker Desktop đã cài sẵn.

### Bước 0 — Bật MySQL bằng Docker (1 lệnh, không cần cài MySQL thủ công)
Mở terminal tại thư mục gốc project (nơi có file `docker-compose.yml`):
```bash
docker compose up -d
```
Đợi khoảng 10-15 giây để MySQL khởi động xong.

### Bước 1 — Chạy Backend (cửa sổ terminal 1)
```bash
cd backend
cp .env.example .env      # không cần sửa gì, đã khớp sẵn với Docker ở trên
npm install
npm run setup               # tự tạo bảng + tự sinh 30 phòng + tài khoản demo
npm run dev                 # http://localhost:5000
```
Thấy dòng `🚀 Server đang chạy tại http://localhost:5000` là xong, **để terminal này mở**.

Tài khoản demo có sẵn sau khi chạy `npm run setup`:
- Admin: `admin@example.com` / `Admin@123`
- User: `user@example.com` / `User@123`

### Bước 2 — Chạy Frontend (mở terminal MỚI, cửa sổ 2)
```bash
cd frontend
cp .env.example .env       # mặc định đã trỏ về http://localhost:5000/api, không cần sửa
npm install
npm run dev                 # http://localhost:5173
```
Mở trình duyệt vào **http://localhost:5173** là thấy web với đầy đủ 30 phòng có sẵn.

### Muốn tắt/dọn dẹp
```bash
docker compose down          # tắt MySQL (dữ liệu vẫn được giữ lại nhờ volume)
docker compose down -v       # tắt và xoá luôn dữ liệu, lần sau chạy lại từ đầu
```

---

## 2. Deploy PUBLIC (không local) — làm theo đúng thứ tự

Bạn cần tạo 3 tài khoản miễn phí: **GitHub**, **Railway**, **Render**, **Vercel** (dùng đăng nhập
bằng GitHub cho nhanh). Tôi không thể tạo các tài khoản này thay bạn, nhưng các bước dưới đây
chỉ mất khoảng 10-15 phút.

### Bước 1 — Đẩy code lên GitHub
```bash
cd đường-dẫn-tới-project
git init
git add .
git commit -m "Initial commit: Tổ Ấm - Website cho thuê phòng trọ"
git branch -M main
git remote add origin https://github.com/<username>/<ten-repo>.git
git push -u origin main
```

### Bước 2 — Tạo Database MySQL trên Railway
1. Vào https://railway.app → **New Project** → **Provision MySQL**.
2. Vào tab **Variables** của service MySQL, copy giá trị `MYSQL_URL` (hoặc tự ráp theo
   `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`).
   Định dạng: `mysql://user:password@host:port/database`
3. Giữ lại chuỗi này — dùng cho `DATABASE_URL` ở Bước 3.

### Bước 3 — Deploy Backend lên Render
1. Vào https://render.com → **New** → **Web Service** → chọn repo GitHub vừa đẩy lên.
2. Cấu hình:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
3. Tab **Environment** → thêm các biến từ `backend/.env.example`:
   - `DATABASE_URL` = chuỗi kết nối MySQL từ Railway
   - `JWT_SECRET`, `JWT_RESET_SECRET` = chuỗi ngẫu nhiên dài (VD: chạy `openssl rand -hex 32`)
   - `JWT_EXPIRES_IN=7d`, `JWT_RESET_EXPIRES_IN=15m`
   - `NODE_ENV=production`
   - `CLIENT_URL` = để tạm `https://placeholder.vercel.app` (sẽ sửa lại ở Bước 5)
   - (Tuỳ chọn) `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` để email
     xác thực/reset mật khẩu gửi thật. Nếu bỏ trống, hệ thống vẫn hoạt động nhưng email chỉ
     được log ra console thay vì gửi thật (đủ để demo/chấm điểm).
4. Bấm **Create Web Service**. Sau khi deploy xong, chạy seed dữ liệu 1 lần qua tab **Shell**
   của Render: `npm run seed`.
5. Copy URL backend, ví dụ: `https://phong-tro-backend.onrender.com`.

### Bước 4 — Deploy Frontend lên Vercel
1. Vào https://vercel.com → **Add New Project** → chọn repo GitHub.
2. Cấu hình:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (tự nhận diện)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Tab **Environment Variables** → thêm:
   - `VITE_API_URL` = `https://phong-tro-backend.onrender.com/api` (URL backend ở Bước 3)
4. Bấm **Deploy**. Sau khi xong, bạn có link public dạng `https://ten-du-an.vercel.app`.

### Bước 5 — Nối lại CORS
Quay lại Render → Environment → sửa `CLIENT_URL` = URL Vercel thật (Bước 4) → **Save** (Render
tự redeploy). Điều này để backend chỉ chấp nhận request từ đúng domain frontend (chống CSRF/CORS).

### Bước 6 — Bật CI/CD tự động deploy khi push code (GitHub Actions)
Repo đã có sẵn `.github/workflows/ci.yml` (lint + build check) và `deploy.yml` (gọi deploy hook).
Vercel và Render đã tự động redeploy khi bạn push lên `main` (không bắt buộc phải cấu hình thêm).
Nếu muốn Actions gọi deploy tường minh:
1. Trên Render service → **Settings** → **Deploy Hook** → copy URL.
2. Trên Vercel project → **Settings → Git → Deploy Hooks** → tạo hook, copy URL.
3. Trên GitHub repo → **Settings → Secrets and variables → Actions** → thêm:
   - `RENDER_DEPLOY_HOOK_URL`
   - `VERCEL_DEPLOY_HOOK_URL`

Từ giờ mỗi lần `git push` lên `main`, GitHub Actions sẽ tự lint/build, sau đó gọi hook để
Render + Vercel tự động deploy bản mới — đúng yêu cầu CI/CD trong đề bài.

---

## 3. Tài khoản demo & dữ liệu

Sau khi chạy `npm run seed` (local hoặc trên Render Shell):
- **Admin**: `admin@example.com` / `Admin@123` — vào `/admin` để xem dashboard, quản lý phòng/user.
- **User**: `user@example.com` / `User@123`
- 30 phòng trọ được sinh tự động, đủ 4 danh mục, ảnh minh hoạ từ Unsplash.

## 4. Tài liệu liên quan
- `SECURITY.md` — chi tiết các biện pháp bảo mật đã áp dụng, map với bảng điểm.
- `TESTING.md` — checklist kiểm thử chức năng và OWASP Top 10 cơ bản.
- `backend/prisma/schema.prisma` — thiết kế database đầy đủ quan hệ.

## 5. Điểm cần lưu ý khi nộp bài
- Gửi **link Vercel** (frontend) cho giảng viên — đây là link người dùng thật sự truy cập.
- Gửi kèm **link GitHub repo** để giảng viên xem code + lịch sử commit + GitHub Actions.
- Gửi kèm 2 tài khoản demo ở trên để giảng viên test nhanh vai trò User/Admin.
