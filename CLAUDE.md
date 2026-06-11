# CLAUDE.md - Project Guide & Agent Rules

Tệp tin này cung cấp hướng dẫn chạy/xây dựng dự án và định nghĩa các nguyên tắc hoạt động cho AI coding assistant khi thao tác trên repository này.

---

## 🚀 Lệnh Xây dựng & Khởi chạy (Build/Run Commands)

### Khởi chạy môi trường Local
*   Cài đặt thư viện: `pip install -r requirements.txt`
*   Khởi chạy server FastAPI: `python app.py` (chạy trên cổng `8000`)
*   Địa chỉ truy cập giao diện: `http://127.0.0.1:8000`

### Đóng gói Docker
*   Build image: `docker build -t greennode-247-ops-agent:latest .`
*   Chạy container: `docker run -d -p 8000:8000 --name ops-agent-container greennode-247-ops-agent:latest`

---

## 🧪 Lệnh Kiểm thử & Xác minh (Test Commands)

*   Chạy thử nghiệm API logs/reports: `python scratch/verify_api.py`
*   Chạy thử nghiệm tải file tài liệu (SOP): `python scratch/test_uploads.py`

---

## 📂 Nguyên tắc Code & Cấu trúc Dự án (Code Guidelines)

*   **Backend:** Sử dụng FastAPI trong `app.py`. Định nghĩa các API endpoints cho log, sops, configuration, và IMAP mail checker.
*   **Frontend:** Sử dụng HTML/CSS/JS thuần (Vanilla) nằm trong thư mục `frontend/`. 
    *   Giữ thiết kế Glassmorphism Dark Mode thống nhất.
    *   Hỗ trợ Light/Dark Theme sử dụng biến CSS.
*   **Bảo mật:** Không commit khóa API vào Git. Sử dụng `data/config.json` (được gitignore) hoặc biến môi trường `MAAS_API_KEY`. Che giấu API key khi trả về client (`vn-WF8••••••••••••`).

---

## 🧠 Nguyên tắc Prompt & Hành vi của Agent (Agent Prompt Rules)

Khi tích hợp hoặc cấu hình prompt cho chatbot AI (Minimax m2.5) trong hệ thống:
1.  **Ngôn ngữ:** Luôn phản hồi bằng tiếng Việt chuyên nghiệp, ngắn gọn và lịch sự dành cho kỹ sư trực ca.
2.  **RAG Lookup (SOPs):** Khi được hỏi cách xử lý sự cố, ưu tiên tra cứu dữ liệu từ tri thức SOP được tải lên. Nếu không có thông tin, hướng dẫn kỹ sư tải thêm tài liệu.
3.  **Tự động soạn Email:** Trích xuất chi tiết sự cố (đối tác, thời gian lỗi, mức độ) từ log ca trực để điền vào biểu mẫu Email Incident mẫu.
4.  **Phân tích Cảnh báo (Alert Spike):** Đọc danh sách cảnh báo Nagios từ email, phát hiện các host có lỗi lặp lại tăng dần mức độ nghiêm trọng theo thời gian để đưa ra cảnh báo khẩn cấp kịp thời.
