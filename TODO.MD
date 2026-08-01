1. Route DELETE không có authenticate — ai cũng xoá được, kể cả chưa đăng nhập


router.delete("/:urlId", urlShortener.deleteShortUrl);
So với route create có authenticate, route delete thiếu hẳn middleware này. Nghĩa là bất kỳ ai, không cần đăng nhập, chỉ cần biết (hoặc đoán) một urlId là xoá được ngay — đây là lỗ hổng bảo mật nghiêm trọng nhất trong 3 cái.

2. Dù có thêm authenticate, vẫn thiếu kiểm tra quyền sở hữu (lỗi IDOR)

deleteShortUrl hiện tại chỉ lấy urlId từ URL rồi xoá thẳng, không hề kiểm tra URL đó có phải của req.userId (người đang đăng nhập) hay không:


export const deleteShortUrl = async (req, res) => {
  const urlId = Number(req.params.urlId);
  const deletedUrl = await softDeleteUrl(urlId);   // xoá bất kỳ ai cũng được, miễn đăng nhập
  ...
Đây là lỗi kinh điển gọi là IDOR (Insecure Direct Object Reference): user A đăng nhập bình thường, nhưng vẫn xoá được URL của user B chỉ bằng cách đổi số urlId trên URL. Bảng shortUrl đã có sẵn userId — chính là để dùng cho việc so sánh "URL này có thuộc về người đang gọi request không" trước khi cho xoá, nhưng hiện chưa được tận dụng ở đây.

3. Quan trọng nhất về mặt chức năng: cờ is_deleted chưa hề được dùng khi resolve URL

Nhìn vào getOriginalUrlByCode (service) → gọi findShortUrlById (repository) → prisma.shortUrl.findUnique({ where: { id: urlId } }) — không có điều kiện lọc is_deleted: false nào cả. Nghĩa là: dù bạn gọi deleteShortUrl xong, cột is_deleted trong DB đã thành true, nhưng redirectToOriginalUrl vẫn redirect bình thường như chưa từng xoá gì — chính là lỗi tôi cảnh báo trước ở lượt trước ("quên filter ở đâu đó là dính ngay"), và nó đã xảy ra thật ở đúng chỗ đầu tiên.

Một điểm nhỏ hơn, về thiết kế: route delete dùng :urlId (số nguyên id thật trong DB), trong khi route get dùng :code (chuỗi base62). Nhưng response của createShortUrl chỉ trả về shortUrl (chứa code base62), không trả urlId — vậy client lấy đâu ra urlId để gọi API xoá? Đáng để cân nhắc cho delete cũng nhận :code giống get, decode ra id y hệt cách redirectToOriginalUrl đang làm, cho nhất quán.

Bạn muốn xử lý theo thứ tự nào trước — bảo mật (1+2) hay chức năng lọc is_deleted (3)?