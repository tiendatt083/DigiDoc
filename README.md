# 📚 DigiDoc - Cửa Hàng Tài Liệu Số

> Nền tảng mua bán và tải về tài liệu số trực tuyến với phân quyền ADMIN/USER, tích hợp thanh toán VietQR, hệ thống điểm thưởng, Flash Sale, Voucher và Blog SEO.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.4-green) ![MySQL](https://img.shields.io/badge/MySQL-8.0-orange) ![Java](https://img.shields.io/badge/Java-17-red)

---

## 🚀 Tính Năng Chính

### 👤 Người Dùng (User)
| Tính năng | Mô tả |
|-----------|-------|
| 🔐 Đăng ký / Đăng nhập | Email + Password, hoặc Google OAuth2 |
| 🔑 Quên mật khẩu | Gửi OTP qua email SMTP |
| 📄 Xem tài liệu | Danh sách, tìm kiếm, lọc theo danh mục |
| 🛒 Giỏ hàng | Thêm/xoá tài liệu khỏi giỏ |
| 💳 Thanh toán | QR VietQR (chuyển khoản ngân hàng) |
| 🎫 Voucher | Áp dụng mã giảm giá khi checkout |
| ⭐ Điểm thưởng | Tích luỹ 1 điểm / 10.000₫, xem lịch sử |
| 📥 Tài liệu đã mua | Tải về + xem preview PDF |
| 📦 Lịch sử đơn hàng | Xem trạng thái đơn hàng |
| ✍️ Blog | Đọc bài viết kiến thức và hướng dẫn |

### 🛡️ Quản Trị (Admin)
| Tính năng | Mô tả |
|-----------|-------|
| 📊 Dashboard | Thống kê doanh thu, đơn hàng, người dùng + biểu đồ |
| 📄 Quản lý tài liệu | CRUD tài liệu, upload file, ảnh thumbnail |
| 📦 Quản lý đơn hàng | Xem tất cả đơn, cập nhật trạng thái |
| 👥 Quản lý người dùng | Xem danh sách, sửa role, khoá tài khoản |
| 🎫 Quản lý Voucher | CRUD voucher giảm giá |
| ⚡ Flash Sale | Tạo chương trình giảm giá có thời gian |
| ✍️ Blog CMS | Viết, sửa, xoá bài blog với SEO fields |

---

## 📁 Cấu Trúc Dự Án

```
digital-document-shop/
├── backend/                    # Spring Boot API
│   └── src/main/java/.../
│       ├── controller/         # REST Controllers (19 files)
│       ├── entity/             # JPA Entities
│       ├── repository/         # Spring Data JPA
│       ├── security/           # JWT, WebSecurityConfig
│       └── service/            # Business Logic
│
└── frontend/                   # React + Vite
    └── src/
        ├── api/                # adminApi.js, axios.js
        ├── context/            # authStore, cartStore (Zustand)
        ├── layouts/            # MainLayout, AdminLayout
        ├── pages/              # Tất cả pages (User + Admin)
        └── utils/              # toast.js
```

---

## ⚙️ Cài Đặt & Chạy

### 1. Tạo Database MySQL

```sql
CREATE DATABASE digital_document_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Cấu hình `backend/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/digital_document_shop?useSSL=false&serverTimezone=UTC
    username: root
    password: YOUR_MYSQL_PASSWORD

  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: YOUR_GMAIL_APP_PASSWORD   # Tạo tại: myaccount.google.com/apppasswords

app:
  jwt:
    secret: YourVeryLongJwtSecretKeyMinimum256Bits
    expiration: 86400000
  google:
    client-id: YOUR_GOOGLE_OAUTH_CLIENT_ID  # Tuỳ chọn
```

### 3. Chạy Backend

```bash
cd backend
mvn spring-boot:run
# Backend: http://localhost:8080
```

### 4. Chạy Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend: http://localhost:5173
```

---

## 🔑 Tài Khoản Demo

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| **Admin** | Nguyendat20041973@gmail.com | admin |
| **User** | Tự đăng ký | — |

---

## 🌐 Các Trang & Routes

### Public
| URL | Mô tả |
|-----|-------|
| `/` | Trang chủ |
| `/documents` | Danh sách tài liệu |
| `/blog` | Danh sách bài viết |
| `/login`, `/register` | Xác thực |

### User (Cần đăng nhập)
| URL | Mô tả |
|-----|-------|
| `/cart` | Giỏ hàng |
| `/checkout` | Thanh toán |
| `/payment/:orderCode` | Trang QR VietQR |
| `/my-orders` | Lịch sử đơn hàng |
| `/my-downloads` | Tài liệu đã mua + tải về |
| `/my-points` | Điểm thưởng |

### Admin (Cần quyền ADMIN)
| URL | Mô tả |
|-----|-------|
| `/admin` | Dashboard |
| `/admin/documents` | Quản lý tài liệu |
| `/admin/orders` | Quản lý đơn hàng |
| `/admin/users` | Quản lý người dùng |
| `/admin/vouchers` | Quản lý voucher |
| `/admin/blogs` | Quản lý blog |

---

## 💳 Thanh Toán Demo (VietQR)

- QR chuyển khoản được sinh tự động từ `img.vietqr.io`
- Trong môi trường DEV: bấm **"⚡ Giả lập thanh toán thành công"** để test
- Sau khi thanh toán: điểm thưởng được cộng tự động, tài liệu mở khoá tải về

---

## 🗺️ Việc Cần Làm Tiếp Theo

- [ ] Tích hợp thanh toán thật (PayOS / VNPay)
- [ ] Tích hợp Google OAuth2 thật
- [ ] Trang Profile người dùng
- [ ] Hệ thống đánh giá & bình luận
- [ ] Trang Flash Sale (frontend)
- [ ] Phân trang cho danh sách
- [ ] Docker Compose để deploy

---

> Made with ❤️ — DigiDoc Digital Document Shop
