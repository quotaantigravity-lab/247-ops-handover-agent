# 247 Operations Shift Handover Agent (Trợ lý Trực ca & Bàn giao ca 247)

Dự án AI Agent chạy trên nền tảng Web được thiết kế dành riêng cho nhân viên trực ca Vận hành (Operations/247) nhằm tự động hóa quy trình quản lý sự cố (Incident), lịch bảo trì (Maintenance) và tạo báo cáo bàn giao ca (Shift Handover Report) một cách chuyên nghiệp và nhanh chóng.

Dự án sử dụng hạ tầng **GreenNode AgentBase** và dịch vụ **Model-as-a-Service (MaaS)** tích hợp mô hình **`minimax/minimax-m2.5`** để xử lý các nghiệp vụ thông minh.

---

## 1. Bài toán & Giá trị thực tế (Use Case Description)

*   **Đối tượng người dùng:** Đội ngũ kỹ sư trực vận hành hệ thống (247 / Operations / IT Helpdesk) tại các đơn vị ví điện tử, ngân hàng hoặc hệ thống cloud (như ZaloPay, VNG Cloud).
*   **Vấn đề gặp phải:**
    *   Sự cố phát sinh liên tục trong ca trực đòi hỏi kỹ sư trực ca phải ghi chép lại liên tục để bàn giao cho ca sau, quy trình này hiện tại làm thủ công nên dễ sai sót, bỏ quên sự vụ.
    *   Khi có sự cố (Ví dụ: cổng thanh toán BIDV, VietQR lỗi), kỹ sư mất nhiều thời gian soạn thảo email cảnh báo sự cố (Incident Email) theo đúng biểu mẫu gửi cho CS và các bên liên quan.
    *   Việc tra cứu quy trình vận hành tiêu chuẩn (SOP) đối với từng lỗi của hàng chục đối tác ngân hàng/nhà mạng diễn ra chậm chạp khi phải tìm kiếm thủ công trong tài liệu Confluence hoặc các file rời rạc.
*   **Giải pháp của Agent:**
    *   **Dashboard quản lý Log ca trực:** Cho phép thêm, sửa, xóa các log sự vụ, bảo trì và ghi chú ca trực với giao diện trực quan, phân loại mức độ nghiêm trọng và trạng thái xử lý.
    *   **AI Chatbot hỗ trợ ca trực (Minimax m2.5):** Tích hợp công nghệ RAG (Retrieval-Augmented Generation), cho phép kỹ sư tải lên các file quy trình định dạng **Word (.docx), Excel (.xlsx), PDF (.pdf), Text (.txt)**. AI sẽ tự động đọc, hiểu tài liệu để phản hồi hướng xử lý chuẩn cho từng lỗi.
    *   **Tự động soạn Email Sự cố:** AI tự động bóc tách thông tin sự cố hiện tại từ log (tên đối tác, thời gian lỗi, ảnh hưởng) để sinh email cảnh báo sự cố chuẩn mẫu của đơn vị chỉ với 1-click.
    *   **Xuất Báo cáo bàn giao ca tự động:** Tự động tổng hợp toàn bộ nhật ký ca trực thành báo cáo bàn giao ca định dạng Markdown chuyên nghiệp để gửi qua Microsoft Teams hoặc Outlook. Tích hợp lưu trữ tên kỹ sư bàn giao qua trình duyệt (`localStorage`).
    *   **Tự động đồng bộ Cảnh báo Nagios từ Email (IMAP Integration):** Đồng bộ trực tiếp email alert từ hộp thư công ty (Gmail, Outlook/O365) theo bộ lọc tìm kiếm IMAP tùy chỉnh. Hỗ trợ các gợi ý nhập liệu điền nhanh và các đường link hỗ trợ lấy App Password (Gmail / Outlook) tiện lợi.
    *   **Ghi nhận nhanh sự cố (Quick Log Import):** Hỗ trợ nút click tự động điền trước (pre-fill) nội dung email cảnh báo Nagios vào biểu mẫu Log ca trực, giảm thiểu sai sót do nhập tay.
    *   **Phát hiện Leo thang Sự cố (Check Alert Spike):** Phím tắt giúp gửi lệnh yêu cầu AI phân tích tiến trình thời gian và cảnh báo sớm các thiết bị/dịch vụ đang có dấu hiệu leo thang lỗi (độ trễ replication replica, tràn bộ nhớ, quá tải CPU) dựa trên kịch bản giả lập 14 alerts của 9 node.
    *   **Hỗ trợ chế độ Sáng/Tối (Dark & Light Theme):** Chuyển đổi theme linh hoạt qua nút bấm trên Header, tự động đổi màu sắc tương phản cao cho chữ cột Thiết bị/Host, lưu trạng thái bằng `localStorage`.

---

## 2. Công nghệ Sử dụng (Technical Stack)

*   **Backend:** Python 3.11, FastAPI (tốc độ cao, gọn nhẹ), Uvicorn.
*   **Frontend:** HTML5, CSS3 (Thiết kế hiện đại Glassmorphism Dark Mode), JavaScript (Vanilla).
*   **AI Model:** GreenNode MaaS API - Model `minimax/minimax-m2.5`.
*   **Thư viện trích xuất tài liệu (RAG):**
    *   `pypdf` (dành cho file PDF)
    *   `python-docx` (dành cho file Word)
    *   `openpyxl` (dành cho file Excel)

---

## 3. Hướng dẫn chạy thử nghiệm tại Local

1.  **Cài đặt các thư viện cần thiết:**
    Mở terminal tại thư mục `247-ops-handover-agent` và chạy lệnh:
    ```bash
    pip install -r requirements.txt
    ```
2.  **Khởi động Server:**
    ```bash
    python app.py
    ```
3.  **Truy cập vào ứng dụng:**
    Mở trình duyệt web và truy cập địa chỉ: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**
4.  **Cấu hình API Key:**
    *   Bấm vào biểu tượng **bánh răng** ở góc trên bên phải màn hình.
    *   Nhập mã **GreenNode API Key** của bạn và nhấn **Lưu cấu hình** để kích hoạt tính năng chat với AI.

---

## 4. Hướng dẫn đóng gói và triển khai lên GreenNode AgentBase

Dự án đã được cấu hình sẵn tệp tin `Dockerfile` để đóng gói thành container:

1.  **Build Docker Image:**
    ```bash
    docker build -t greennode-247-ops-agent:latest .
    ```
2.  **Chạy thử Container local:**
    ```bash
    docker run -d -p 8000:8000 --name ops-agent-container greennode-247-ops-agent:latest
    ```
3.  **Triển khai lên Portal bằng AgentBase Skills:**
    *   Clone bộ skill của GreenNode vào cùng thư mục:
        ```bash
        git clone https://github.com/vngcloud/greennode-agentbase-skills.git
        ```
    *   Sử dụng lệnh `/agentbase-wizard` hoặc `/agentbase-deploy` trên terminal của các công cụ AI coding để tự động đóng gói, đẩy (push) image lên registry và khởi chạy Runtime của Agent trên portal.
