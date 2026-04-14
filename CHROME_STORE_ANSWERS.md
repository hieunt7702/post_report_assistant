# Hướng dẫn Đẩy Tiện ích lên Chrome Web Store (Cập nhật cho v2.3.0)

Tài liệu này tổng hợp các câu trả lời tối ưu nhất cho "Post Report Assistant" để đảm bảo tỉ lệ duyệt nhanh nhất và tránh bị từ chối do vi phạm chính sách hiển thị hoặc quyền riêng tư.

---

## 1. Thông tin sản phẩm (Product Details)

- **Tên tiện ích (Name):** Post Report Assistant
- **Mô tả ngắn (Summary):** Hỗ trợ báo cáo bài viết trên Facebook một cách nhanh chóng. Chạy tĩnh trên tab hiện tại và hỗ trợ đa ngôn ngữ.
- **Mô tả chi tiết (Description):**
  Post Report Assistant là một công cụ hỗ trợ người dùng Facebook thực hiện quy trình báo cáo (report) các bài viết chứa nội dung rác, thông tin sai lệch một cách nhanh chóng.
  
  (Vui lòng cung cấp cả phần dịch tiếng Anh cho đối tượng quốc tế nếu cần thiết vì tiện ích đã có tiếng Anh).

  **Các tính năng nổi bật:**
  - Hỗ trợ đa ngôn ngữ (Tiếng Việt & Tiếng Anh tự động nhận diện theo Chrome).
  - Giao diện nhỏ gọn, sắc nét chuẩn 640x400 không có thanh cuộn ngang/dọc, trải nghiệm mượt mà.
  - Chạy trực tiếp trên tab Facebook hiện tại khi người dùng nhấn nút "Start".
  - Tự động hóa các bước chọn lý do báo cáo (mặc định là "Scam, fraud or false information").
  - Hoàn toàn minh bạch: Không thu thập dữ liệu người dùng, không bao giờ gửi dữ liệu ra máy chủ bên ngoài. Tất cả trạng thái lưu trữ cục bộ (local storage) trên Chrome của bạn.

  **Cách sử dụng:**
  1. Mở trang Facebook chứa bài viết bạn muốn xử lý.
  2. Mở tiện ích và nhấn "Start on this tab" (Bắt đầu trên tab này).
  3. Tiện ích tự tiến hành click các tùy chọn cần thiết trong khi bạn có khả năng nhấn "Stop" ngay lập tức để dừng luồng hoạt động.

- **Danh mục (Category):** Productivity (Hoặc Social & Communication)

---

## 2. Hình ảnh và Thương hiệu (Assets)

- **Icon:** Dùng tệp `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`.
- **Screenshots (Cực kỳ quan trọng):** 
  Do phiên bản v2.3.0 đã tối ưu hóa không còn thanh cuộn và căn đúng kích thước `640x400` cho tiện ích, vui lòng chụp chuẩn không gian của popup từ trên xuống dưới.
  1. Ảnh popup phiên bản cũ đã được gỡ đi, thay bằng ảnh chụp popup phiên bản mới (sạch và hiển thị đẩy đủ).
  2. Một ảnh hiển thị trạng thái "Running" (Đang chạy).
- **Video Demo (Bắt buộc):** Một số Extension tự động bấm chuột dễ bị bot review đánh giá là rủi ro. Hãy đính kèm link YouTube một Video Demo không công khai hiển thị chi tiết tính năng của bạn để qua ải "Manual Review".

---

## 3. Quyền riêng tư và Bảo mật (Privacy & Security) - Mẫu điền Declaration

Để được duyệt phiên bản 2.3.0, hãy điền như sau:

### Mục đích duy nhất (Single Purpose Description)
"This extension assists users in automating the repetitive clicks required to report inappropriate posts strictly on their active Facebook tab. It executes solely upon user request to streamline their personal content moderation."

### Diễn giải quyền (Permissions Justification)
- **Host Permissions (`*://*.facebook.com/*`) & content_scripts:** 
  "Necessary to inject a content script to manipulate DOM elements for the reporting workflow on Facebook. It strictly operates within Facebook URLs and handles UI states effectively when errors occur."
- **activeTab & scripting:** 
  "Used to access the currently focused tab's URL to verify it is Facebook before injecting the script via user interaction in the extension popup."
- **storage:** 
  "Used strictly for local session management (persisting start/stop state and item count locally on user's machine). No data leaves the browser."

### Data Usage (Cực kỳ quan trọng)
- **Do you collect data?** Chọn **NO**.
- **Do you use remote code?** Chọn **NO**. 

### Tuyên bố về quyền riêng tư (Privacy Policy URL)
- Nơi đến của URL có thể trỏ thẳng vào nội dung `PRIVACY_POLICY.md` mà tôi đã cập nhật nội dung cho bạn.

---

## 4. Cam kết lập trình viên

- Check đầy đủ các mục: KHÔNG bán dữ liệu, KHÔNG thao tác vào các thứ không liên quan, KHÔNG dùng vào tín dụng/vay nợ.

Chúc bạn đẩy tiện ích mới thành công và đạt vòng duyệt xét một cách nhanh chóng nhất!
