from app.service.auth import AuthService
from app.schema.user import ChangePasswordRequest, ForgotPasswordRequest, RegisterRequest, ResendOTPRequest, ResetPasswordRequest, UserLogin, UserUpdate, VerifyRegistrationRequest


class AuthController:
    def __init__(self, auth_service: AuthService):
        self.auth_service = auth_service

    def handle_register(self, data: RegisterRequest):
        return self.auth_service.register_user(data.email, data.password, data.full_name)
    
    def handle_resend_otp(self, data: ResendOTPRequest):
        return self.auth_service.resend_activation_otp(data.email)
    
    def handle_verify_registration(self, data: VerifyRegistrationRequest):
        return self.auth_service.verify_registration(data.email, data.code)

    def handle_login(self, data: UserLogin):
        return self.auth_service.login_user(data)
    
    def handle_forgot_password(self, data: ForgotPasswordRequest):
        return self.auth_service.forgot_password(data.email)
    
    def handle_reset_password(self, data: ResetPasswordRequest):
        return self.auth_service.reset_password(data.email, data.code, data.new_password)
    
    def handle_update_profile(self, user_id, data: UserUpdate):
        return self.auth_service.update_profile(user_id, data)
    
    def handle_change_password(self, user_id, data: ChangePasswordRequest):
        return self.auth_service.change_password(user_id, data)