# Hướng dẫn Đẩy Tiện ích lên Chrome Web Store

Tài liệu này tổng hợp các câu trả lời tối ưu nhất cho "Post Report Assistant" để đảm bảo tỉ lệ duyệt nhanh và tránh bị từ chối do vi phạm chính sách về quyền riêng tư hoặc mô tả gây nhầm lẫn.

---

## 1. Thông tin sản phẩm (Product Details)

- **Tên tiện ích (Name):** Post Report Assistant
- **Mô tả ngắn (Summary):** Hỗ trợ báo cáo bài viết trên Facebook một cách nhanh chóng. Chạy trên tab hiện tại theo yêu cầu của người dùng.
- **Mô tả chi tiết (Description):**
  Post Report Assistant là một công cụ hỗ trợ người dùng Facebook thực hiện quy trình báo cáo (report) các bài viết vi phạm chính sách (như lừa đảo, thông tin giả mạo) một cách nhanh chóng và có hệ thống.

  **Các tính năng chính:**
  - Chạy trực tiếp trên tab Facebook hiện tại khi người dùng nhấn nút "Start".
  - Tự động hóa các bước chọn lý do báo cáo (mặc định là "Scam, fraud or false information").
  - Thống kê số lượng bài viết đã xử lý trong phiên làm việc.
  - Hoàn toàn minh bạch: Không thu thập dữ liệu người dùng, không gửi dữ liệu ra máy chủ bên ngoài. Tất cả trạng thái được lưu trữ cục bộ (local storage) trên trình duyệt của bạn.

  **Cách sử dụng:**
  1. Mở trang Facebook chứa các bài viết bạn muốn báo cáo.
  2. Click vào biểu tượng tiện ích và nhấn "Start".
  3. Tiện ích sẽ tự động thực hiện các thao tác trên tab đó. Bạn có thể nhấn "Stop" bất cứ lúc nào.

- **Danh mục (Category):** Productivity (Năng suất)

---

## 2. Hình ảnh và Thương hiệu (Assets)

- **Icon:** Sử dụng các file `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png` có sẵn trong thư mục gốc.
- **Screenshots:** Bạn cần chụp ít nhất 2 ảnh:
  1. Ảnh giao diện Popup khi đang ở trạng thái "Ready".
  2. Ảnh giao diện Popup khi đang chạy ("Running") kèm theo log bên dưới (nếu có).
- **Promotional Tiles:** Tạo một ảnh 440x280 (Small Tile) với logo và tên tiện ích trên nền màu xanh Facebook (#1877f2) để trông chuyên nghiệp hơn.

---

## 3. Quyền riêng tư và Bảo mật (Privacy & Security)

Đây là phần quan trọng nhất để được duyệt nhanh. Hãy trả lời chính xác như sau:

### Mục đích sử dụng dữ liệu (Single Purpose)
- **Câu hỏi:** Giải thích mục đích duy nhất của tiện ích.
- **Trả lời:** Hỗ trợ người dùng tự động hóa quy trình báo cáo các bài viết vi phạm trên Facebook tại tab đang hoạt động để tiết kiệm thời gian và tăng hiệu quả quản lý nội dung.

### Quyền (Permissions Rationale)
Google sẽ hỏi tại sao bạn cần các quyền này:
- **Host Permissions (`*://*.facebook.com/*`) & content_scripts:** Cần thiết để tự động chèn tập lệnh (content script) vào các trang Facebook nhằm duy trì quá trình báo cáo hoạt động liên tục (tự động tiếp tục sau khi tải lại trang khi gặp lỗi mạng/UI). Tiện ích giới hạn chỉ hoạt động trên tên miền của Facebook thay vì toàn bộ trang web.
- **activeTab & scripting:** Dự phòng để tương tác thủ công đối với popup ở lần đầu tiên khởi chạy.
- **storage:** Dùng để lưu trữ tạm thời trạng thái phiên làm việc (đang chạy hay dừng) và số lượng bài viết đã báo cáo, giúp tiếp tục đúng tiến độ.

### Sử dụng dữ liệu (Data Usage)
- **Dữ liệu có được thu thập không?** Chọn **NO**.
- **Tiện ích có sử dụng mã từ xa (Remote Code) không?** Chọn **NO** (Tất cả logic nằm trong `content.js` và `popup.js` đi kèm).

### Tuyên bố về quyền riêng tư (Privacy Policy)
- Bạn cần cung cấp URL đến file `PRIVACY_POLICY.md` (khuyến khích đưa lên GitHub Pages hoặc một trang web cá nhân).

---

## 4. Cam kết của Lập trình viên (Developer Certifications)

Khi được hỏi về cam kết, hãy tích chọn các mục xác nhận rằng:
1. Bạn không bán dữ liệu người dùng cho bên thứ ba.
2. Bạn không sử dụng dữ liệu cho các mục đích không liên quan đến tính năng chính của tiện ích.
3. Bạn không thu thập dữ liệu để đánh giá tín dụng hoặc cho vay.

---

## 5. Lưu ý quan trọng để tránh bị từ chối

1. **Không sử dụng từ "Auto" quá nhiều ở tiêu đề:** Google đôi khi khắt khe với các tiện ích "Automation". Sử dụng từ "Assistant" (Trợ lý) sẽ an toàn hơn và dễ được duyệt hơn.
2. **Video demo:** Nếu có thể, hãy quay một video ngắn (dưới 30s) quay cảnh tiện ích hoạt động trên Facebook và tải lên phần "Screencast" trong Dashboard. Điều này giúp kiểm duyệt viên hiểu rõ cơ chế hoạt động của tiện ích và duyệt nhanh hơn cực kỳ nhiều.
3. **Phản hồi kiểm duyệt:** Nếu bị từ chối với lý do "Use of Permissions", hãy nhắc lại rằng tiện ích chỉ chạy khi người dùng chủ động nhấn nút và chỉ giới hạn trong tab hiện tại (`activeTab`).
