import logging
import os
from logging.handlers import RotatingFileHandler

# Tạo thư mục log nếu chưa có
LOG_DIR = "log"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

LOG_FILE = os.path.join(LOG_DIR, "app.log")

# Cấu hình định dạng log: Thời gian - Tên Level - Thông điệp
log_formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

# 1. Handler ghi ra File (Xoay vòng sau mỗi 5MB, giữ lại tối đa 5 file cũ)
file_handler = RotatingFileHandler(LOG_FILE, maxBytes=5*1024*1024, backupCount=5, encoding="utf-8")
file_handler.setFormatter(log_formatter)
file_handler.setLevel(logging.INFO)

# 2. Handler đẩy ra Terminal
console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)
console_handler.setLevel(logging.INFO)

# Khởi tạo logger chính
logger = logging.getLogger("smart_finance")
logger.setLevel(logging.INFO)
logger.addHandler(file_handler)
logger.addHandler(console_handler)