# URL Shortener

Một REST API rút gọn URL được xây dựng bằng Express, Prisma và SQLite.

Dự án này được thực hiện với mục tiêu học cách tổ chức một ứng dụng backend theo từng layer, xây dựng authentication bằng JWT, xử lý lỗi thống nhất và áp dụng unit test, integration test vào một dự án thực tế.

## Chức năng chính

- Đăng ký tài khoản.
- Đăng nhập bằng username và password.
- Xác thực người dùng bằng JWT lưu trong cookie.
- Tạo shortened URL.
- Redirect từ shortened URL về URL gốc.
- Xem danh sách URL đang hoạt động của người dùng.
- Xem danh sách URL đã bị xóa.
- Soft delete URL.
- Chỉ chủ sở hữu mới có quyền xóa URL.
- Shortened URL vẫn là public: bất kỳ ai có code đều có thể truy cập.

## Công nghệ sử dụng

- Node.js
- Express 5
- Prisma ORM 7
- SQLite
- JSON Web Token
- bcryptjs
- Vitest
- Supertest

## Kiến trúc

Ứng dụng được chia thành các layer:

```text
HTTP Request
    ↓
Route
    ↓
Middleware
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
SQLite database
```

### Route

Khai báo endpoint và kết nối middleware với controller.

### Middleware

Xử lý các hành vi xảy ra trước controller, ví dụ:

- Đọc JWT từ cookie.
- Xác thực token.
- Gắn `userId` vào request.

### Controller

Chịu trách nhiệm về HTTP boundary:

- Đọc params, body và cookie.
- Kiểm tra hình dạng input.
- Gọi service.
- Trả response thành công.

### Service

Chứa các quy tắc của ứng dụng:

- Kiểm tra URL có hợp lệ hay không.
- Chỉ chấp nhận protocol `http:` và `https:`.
- Encode và decode Base62.
- Chuyển kết quả `null` hoặc `false` từ repository thành business error phù hợp.

### Repository

Chịu trách nhiệm giao tiếp với database thông qua Prisma:

- Tạo và tìm user.
- Tạo và tìm short URL.
- Lấy danh sách URL theo user.
- Soft delete URL.
- Chuyển lỗi kỹ thuật từ Prisma thành `DataAccessError`.

### Error handler

Tất cả lỗi dự kiến được biểu diễn bằng `AppError` và chuyển thành HTTP response tại error-handling middleware.

Lỗi database không dự kiến được wrap bằng `DataAccessError`, log ở server và trả response `500` mà không làm lộ chi tiết nội bộ.

## Cấu trúc thư mục

```text
src/
├── app.js
├── main.js
├── config/
│   └── db.js
└── app/
    ├── controllers/
    ├── errors/
    ├── middlewares/
    ├── repositories/
    ├── routes/
    └── services/

prisma/
├── migrations/
└── schema.prisma

tests/
├── middlewares/
├── repositories/
├── routes/
├── services/
└── setup.js
```

`src/app.js` tạo và cấu hình Express application.

`src/main.js` import application và mở port. Việc tách hai file cho phép integration test import Express app mà không khởi động server thật.

## Cài đặt

Yêu cầu:

- Node.js
- npm

Cài dependencies:

```bash
npm install
```

## Cấu hình môi trường

Tạo file `.env` tại thư mục gốc:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-your-secret"
```

Không commit JWT secret thật lên repository công khai.

## Khởi tạo database

Generate Prisma Client:

```bash
npx prisma generate
```

Chạy migrations:

```bash
npx prisma migrate dev
```

Database phát triển sử dụng file:

```text
dev.db
```

## Chạy ứng dụng

```bash
node src/main.js
```

Server mặc định chạy tại:

```text
http://127.0.0.1:3000
```

## API endpoints

### User

| Method | Endpoint | Authentication | Chức năng |
|---|---|---:|---|
| `POST` | `/users/create` | Không | Tạo tài khoản |
| `POST` | `/users/login` | Không | Đăng nhập và nhận JWT cookie |
| `GET` | `/users/me` | Có | Lấy thông tin user hiện tại |

### Short URL

| Method | Endpoint | Authentication | Chức năng |
|---|---|---:|---|
| `POST` | `/shortened` | Có | Tạo shortened URL |
| `GET` | `/shortened` | Có | Lấy URL đang hoạt động của user |
| `GET` | `/shortened/deleted` | Có | Lấy URL đã xóa của user |
| `DELETE` | `/shortened/:code` | Có | Soft delete URL do user sở hữu |
| `GET` | `/shortened/:code` | Không | Redirect tới URL gốc |

## Validation

Validation được đặt tại layer hiểu rõ quy tắc tương ứng.

Controller kiểm tra hình dạng request:

- Field bắt buộc có tồn tại không.
- Giá trị có đúng kiểu string không.
- Chuỗi có rỗng hoặc chỉ chứa khoảng trắng không.

Service kiểm tra business rule:

- URL có parse được không.
- Protocol có phải `http:` hoặc `https:` không.

Repository bảo vệ các database constraint:

- Username phải unique.
- User liên kết với short URL phải tồn tại.

## Error contract

Các lỗi dự kiến có response thống nhất:

```json
{
  "error": "MACHINE_READABLE_CODE",
  "message": "Human readable message"
}
```

Ví dụ:

```json
{
  "error": "INVALID_URL",
  "message": "Only HTTP and HTTPS URLs are supported"
}
```

Một số error code chính:

- `URL_REQUIRED`
- `INVALID_URL`
- `INVALID_CREDENTIAL_INPUT`
- `INVALID_CREDENTIALS`
- `MISSING_TOKEN`
- `INVALID_TOKEN`
- `USER_NOT_FOUND`
- `SHORT_URL_NOT_FOUND`
- `USERNAME_ALREADY_EXISTS`
- `INTERNAL_SERVER_ERROR`

HTTP status được sử dụng:

| Status | Ý nghĩa |
|---:|---|
| `400` | Input không hợp lệ |
| `401` | Chưa được xác thực hoặc thông tin đăng nhập không hợp lệ |
| `404` | Resource không tồn tại hoặc không thuộc về user |
| `409` | Dữ liệu bị xung đột |
| `500` | Lỗi server không dự kiến |

Khi user A cố xóa URL của user B, API trả `404` để không tiết lộ resource đó có tồn tại hay thuộc về ai.

## Testing

Chạy toàn bộ test:

```bash
npm test
```

Test suite hiện gồm 37 test thuộc ba nhóm chính.

### Unit test

Dùng cho logic chạy nhanh và không cần dependency bên ngoài:

- Encode Base62.
- Decode Base62.
- Authentication middleware.

Middleware sử dụng implementation thật cho các trường hợp dễ tái tạo và dùng spy cho những lỗi khó tạo, ví dụ một unknown error từ JWT verification.

### Repository integration test

Repository được test với Prisma và SQLite thật vì mục tiêu của repository chính là giao tiếp với database.

Các test kiểm tra:

- Query trả dữ liệu chính xác.
- Database constraint hoạt động.
- Duplicate username.
- Foreign key.
- Soft delete.
- `null` và `false` được trả đúng trong các trường hợp không tìm thấy.

### API integration test

Supertest gửi request trực tiếp vào Express app:

```text
Request
→ Route
→ Middleware
→ Controller
→ Service
→ Repository
→ test.db
```

Các test kiểm tra cả:

- HTTP status.
- Response body.
- Cookie và redirect header.
- Side effect trong database.
- Authentication.
- Authorization giữa hai user.

## Test database

Test không sử dụng `dev.db`.

Vitest tự cấu hình:

```env
NODE_ENV="test"
DATABASE_URL="file:./test.db"
JWT_SECRET="test-secret"
```

`tests/setup.js` kiểm tra lại database URL trước khi test chạy. Nếu cấu hình không trỏ đến `test.db`, test suite sẽ dừng để tránh xóa nhầm dữ liệu phát triển.

Database được làm sạch trước mỗi test để các test không phụ thuộc vào dữ liệu của nhau.

Các test được chạy tuần tự vì tất cả repository và route test dùng chung một file `test.db`. Không nên chạy đồng thời nhiều lệnh `npm test`, vì các process vẫn có thể xóa dữ liệu của nhau.

## Những bài học rút ra

### Unit không nhất thiết là một function

Một unit test nên kiểm tra một đơn vị hành vi. Một hành vi có thể được thực hiện bởi nhiều function hoặc object phối hợp với nhau.

Không cần viết unit test riêng cho mọi wrapper nếu integration test đã bảo vệ được hành vi có giá trị.

### Không phải dependency nào cũng cần mock

Mock phù hợp khi dependency:

- Khó tái tạo hành vi.
- Có kết quả không ổn định.
- Không phải đối tượng thực sự cần kiểm tra.

Database thật được sử dụng trong repository test vì persistence chính là hành vi cần kiểm tra.

### Test pass chưa chắc đã đúng

Trong quá trình xây dựng test suite, một số test từng pass giả do:

- Quên `await`, khiến assertion kiểm tra một Promise thay vì kết quả.
- Dùng `try/catch`, khiến test vẫn pass nếu operation không throw.
- Chỉ kiểm tra mock đã được gọi mà không kiểm tra số lần gọi.
- Assertion quá yếu.
- Dựa vào thứ tự database dù query không có `orderBy`.

Test tốt không chỉ cần chạy xanh mà phải thực sự thất bại khi hành vi cần bảo vệ bị phá vỡ.

### Unit test và integration test có mục tiêu khác nhau

Unit test:

- Chạy nhanh.
- Kiểm tra logic hoặc hành vi nhỏ.
- Không sử dụng shared dependency.

Integration test:

- Kiểm tra sự phối hợp giữa các layer.
- Có thể sử dụng database thật.
- Chậm hơn nhưng bảo vệ các luồng gần với thực tế hơn.

Một test suite tốt không cần biến mọi test thành unit test.

### Shared dependency cần được kiểm soát

`test.db` vẫn là shared dependency dù dữ liệu được xóa trước mỗi test.

Cleanup giúp test có trạng thái khởi đầu ổn định, nhưng các test vẫn có thể ảnh hưởng nhau nếu nhiều process cùng sử dụng database. Vì vậy test được chạy tuần tự.

### Trả giá trị và throw error có ý nghĩa khác nhau

Repository trả:

- Data khi query thành công.
- `null` khi không tìm thấy record.
- `false` khi update không tác động record nào.
- `[]` khi danh sách rỗng.

Service diễn giải các giá trị đó theo nghiệp vụ và throw `AppError` nếu operation không thể hoàn thành.

Lỗi database không dự kiến được wrap bằng `DataAccessError`.

### Validation thuộc về layer hiểu quy tắc đó

- Controller kiểm tra hình dạng HTTP input.
- Service kiểm tra business rule.
- Repository xử lý database constraint.
- Error handler chịu trách nhiệm tạo error response thống nhất.

### Authentication khác authorization

Authentication trả lời:

```text
Người dùng là ai?
```

Authorization trả lời:

```text
Người dùng có quyền thực hiện hành động này không?
```

Shortened URL là public nên user khác vẫn có thể truy cập và redirect.

Tuy nhiên, chỉ owner mới có quyền xóa URL.

## Trạng thái dự án

Dự án hiện đã có:

- Kiến trúc theo layer.
- Authentication bằng JWT.
- Password hashing.
- URL validation.
- Base62 encoding.
- Soft delete.
- Ownership authorization.
- Centralized error handling.
- Unit test.
- Repository integration test.
- API integration test.
- Test database riêng.