from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from app.repository.user import UserRepository
from app.schema.user import UserCreate, UserLogin
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.logger import logger
from app.core.email import generate_otp, send_email
from app.model.otp import OTPCode

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo
        self.db = self.user_repo.db

    def register_user(self, email: str, password: str, full_name: str):
        user = self.user_repo.get_by_email(email)
        hashed_password = get_password_hash(password)

        if user:
            if bool(user.is_active):
                raise HTTPException(status_code=400, detail="Địa chỉ email đã được đăng ký.")
            else:
                setattr(user, "password_hash", hashed_password)
                setattr(user, "full_name", full_name)
                self.db.commit()
        else:
            new_user_data = UserCreate(email=email, password_hash=hashed_password, full_name=full_name)
            self.user_repo.create(obj_in=new_user_data)

        # Xóa OTP cũ
        self.db.query(OTPCode).filter(OTPCode.email == email, OTPCode.otp_type == "REGISTER").delete()

        # Tạo mã OTP mới (sống 10 phút)
        otp = generate_otp()
        expire_time = datetime.now(timezone.utc) + timedelta(minutes=10)
        new_otp = OTPCode(email=email, code=otp, otp_type="REGISTER", expires_at=expire_time)
        self.db.add(new_otp)
        self.db.commit()

        # Gửi Email
        send_email(email, "Xác thực tài khoản SmartFinance", f"Mã xác thực của bạn là: {otp}. Mã có hiệu lực trong 10 phút.")

        return {"detail": "Vui lòng kiểm tra email để lấy mã xác thực."}
    

    def resend_activation_otp(self, email: str):
        user = self.user_repo.get_by_email(email)
        
        # Kiểm tra tài khoản
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản này.")
        if bool(user.is_active):
            raise HTTPException(status_code=400, detail="Tài khoản này đã được xác thực.")

        # Xóa OTP cũ
        self.db.query(OTPCode).filter(OTPCode.email == email, OTPCode.otp_type == "REGISTER").delete()

        # Tạo OTP mới
        otp = generate_otp()
        expire_time = datetime.now(timezone.utc) + timedelta(minutes=10)
        new_otp = OTPCode(email=email, code=otp, otp_type="REGISTER", expires_at=expire_time)
        self.db.add(new_otp)
        self.db.commit()

        # Gửi Email
        send_email(email, "Gửi lại mã xác thực SmartFinance", f"Mã xác thực mới của bạn là: {otp}. Mã có hiệu lực trong 10 phút.")

        return {"detail": "Mã xác thực mới đã được gửi đến email của bạn."}


    def verify_registration(self, email: str, code: str):
        otp_record = self.db.query(OTPCode).filter(
            OTPCode.email == email,
            OTPCode.code == code,
            OTPCode.otp_type == "REGISTER"
        ).first()

        if not otp_record:
            raise HTTPException(status_code=400, detail="Mã OTP không hợp lệ.")
        
        # Thêm timezone.utc để đồng bộ thời gian với lúc tạo OTP
        if otp_record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Mã OTP đã hết hạn.")

        user = self.user_repo.get_by_email(email)
        if user:
            setattr(user, "is_active", True)
        
        self.db.delete(otp_record)
        self.db.commit()

        return {"detail": "Tài khoản đã được kích hoạt thành công."}


    def forgot_password(self, email: str):
        user = self.user_repo.get_by_email(email)
        if not user or not bool(user.is_active):
            return {"detail": "Nếu email tồn tại, mã đặt lại sẽ được gửi."}
        
        self.db.query(OTPCode).filter(OTPCode.email == email, OTPCode.otp_type == "RESET_PASSWORD").delete()

        otp = generate_otp()
        expire_time = datetime.now(timezone.utc) + timedelta(minutes=10)
        self.db.add(OTPCode(email=email, code=otp, otp_type="RESET_PASSWORD", expires_at=expire_time))
        self.db.commit()

        send_email(email, "Đặt lại mật khẩu SmartFinance", f"Mã xác nhận đổi mật khẩu của bạn là: {otp}")
        return {"detail": "Nếu email tồn tại, mã đặt lại sẽ được gửi."}


    def reset_password(self, email: str, code: str, new_password: str):
        otp_record = self.db.query(OTPCode).filter(
            OTPCode.email == email, OTPCode.code == code, OTPCode.otp_type == "RESET_PASSWORD"
        ).first()

        if not otp_record or otp_record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Mã OTP không hợp lệ hoặc đã hết hạn.")

        user = self.user_repo.get_by_email(email)
        if user:
            setattr(user, "password_hash", get_password_hash(new_password))
        
        self.db.delete(otp_record)
        self.db.commit()

        return {"detail": "Mật khẩu đã được đặt lại thành công."}


    def login_user(self, login_data: UserLogin):
        user = self.user_repo.get_by_email(login_data.email)

        if not user or not verify_password(login_data.password, str(user.password_hash)):
            logger.warning(f"Login failed for email: {login_data.email}")
            raise HTTPException(
                status_code=401, 
                detail="Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra email hoặc mật khẩu của bạn."
            )
        
        if not bool(user.is_active):
            raise HTTPException(status_code=403, detail="Vui lòng xác thực email của bạn trước khi đăng nhập.")
        
        access_token = create_access_token(data={"sub": str(user.id)})
        logger.info(f"Người dùng đã đăng nhập thành công: {user.email}")
        
        user_response = {
            "id": str(user.id),
            "full_name": str(user.full_name)
        }
        return {"access_token": access_token, "token_type": "bearer", "user": user_response}