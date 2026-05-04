import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { AppInput } from "@/components/form/app-input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { useUpdateProfile, useChangePassword } from "@/hooks/query/auth";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { UserCircle, Key, Lock, ExternalLink } from "lucide-react";

// --- SCHEMAS ---
const profileSchema = z.object({ full_name: z.string().min(1, "Vui lòng nhập họ và tên") });
const apiKeySchema = z.object({ gemini_api_key: z.string().min(1, "Vui lòng nhập API Key của bạn") });
const passwordSchema = z.object({
  old_password: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
  new_password: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirm_password: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Mật khẩu xác nhận không khớp",
  path:["confirm_password"],
});

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutateAsync: changePassword, isPending: isChangingPassword } = useChangePassword();

  // --- FORMS ---
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user?.full_name || "" },
  });

  const apiKeyForm = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { gemini_api_key: user?.gemini_api_key || "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { old_password: "", new_password: "", confirm_password: "" },
  });

  // --- SUBMIT HANDLERS ---
  const handleUpdateProfile = async (values: any, successMsg: string) => {
    try {
      await updateProfile(values);
      toast.success(successMsg);
    } catch (error) {
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  const handleChangePassword = async (values: z.infer<typeof passwordSchema>) => {
    try {
      await changePassword(values);
      toast.success("Đổi mật khẩu thành công!");
      passwordForm.reset();
    } catch (error: any) {
      toast.error("Lỗi", { description: error.response?.data?.detail || "Không thể đổi mật khẩu" });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1B212D] dark:text-white">Cài đặt hệ thống</h2>
        <p className="text-sm text-[#78778B] mt-1">Quản lý thông tin cá nhân, bảo mật và cấu hình Trợ lý AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* ==========================================
            CỘT TRÁI: THÔNG TIN CÁ NHÂN & CẤU HÌNH AI
            ========================================== */}
        <div className="space-y-6">
          
          {/* CARD 1: THÔNG TIN CÁ NHÂN */}
          <div className="bg-white dark:bg-[#1C1A2E] rounded-[24px] p-6 sm:p-8 shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <UserCircle size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#1B212D] dark:text-white">Thông tin cá nhân</h3>
            </div>

            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit((v) => handleUpdateProfile(v, "Đã cập nhật tên!"))} className="space-y-5">
                <AppInput control={profileForm.control} name="full_name" label="Họ và tên" placeholder="VD: Nguyễn Văn A" />
                <div className="pt-2">
                  <Button type="submit" disabled={isUpdatingProfile} className="bg-[#1B212D] hover:bg-[#2A3143] dark:bg-white dark:text-[#1B212D] dark:hover:bg-slate-200 text-white rounded-[10px] px-6 transition-colors">
                    {isUpdatingProfile ? <Spinner /> : "Lưu thông tin"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* CARD 2: CẤU HÌNH TRỢ LÝ AI */}
          <div className="bg-white dark:bg-[#1C1A2E] rounded-[24px] p-6 sm:p-8 shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#C8EE44]/20 flex items-center justify-center text-[#1B212D] dark:text-[#C8EE44]">
                <Key size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#1B212D] dark:text-white">Kết nối Gemini AI</h3>
            </div>

            <div className="bg-[#F8F9FB] dark:bg-[#2A3143]/50 p-5 rounded-xl border border-[#F2F2F2] dark:border-[#2A3143] mb-6">
              <h4 className="text-[14px] font-bold text-[#1B212D] dark:text-white mb-2">Bắt buộc cấu hình API Key</h4>
              <p className="text-[13.5px] text-[#78778B] leading-relaxed">
                Để sử dụng tính năng Trợ lý Tài chính thông minh, bạn cần kết nối ứng dụng với Google Gemini. Việc này hoàn toàn miễn phí, giúp hệ thống hoạt động ổn định và không bị giới hạn số lần truy vấn.
              </p>
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-[13px] text-emerald-700 dark:text-emerald-400">
                <Lock size={14} className="inline mr-1 mb-0.5" />
                Mã khóa được mã hóa an toàn và chỉ lưu trữ trên tài khoản của bạn. Chúng tôi cam kết không chia sẻ cho bất kỳ bên thứ ba nào.
              </div>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-[#1B212D] dark:text-[#C8EE44] hover:underline transition-all"
              >
                Nhận API Key miễn phí từ Google <ExternalLink size={14} />
              </a>
            </div>

            <Form {...apiKeyForm}>
              <form onSubmit={apiKeyForm.handleSubmit((v) => handleUpdateProfile(v, "Đã lưu API Key!"))} className="space-y-5">
                <AppInput 
                  control={apiKeyForm.control} 
                  name="gemini_api_key" 
                  label="API Key" 
                  type="password" 
                  placeholder="Nhập API Key" 
                />
                <div className="pt-2">
                  <Button type="submit" disabled={isUpdatingProfile} className="bg-[#C8EE44] hover:bg-[#b8de34] text-[#1B212D] font-bold rounded-[10px] px-6 w-full sm:w-auto transition-colors">
                    {isUpdatingProfile ? <Spinner /> : "Lưu cấu hình"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

        </div>

        {/* ==========================================
            CỘT PHẢI: BẢO MẬT TÀI KHOẢN
            ========================================== */}
        <div className="space-y-6">
          
          {/* CARD 3: ĐỔI MẬT KHẨU */}
          <div className="bg-white dark:bg-[#1C1A2E] rounded-[24px] p-6 sm:p-8 shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                <Lock size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#1B212D] dark:text-white">Bảo mật tài khoản</h3>
            </div>

            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-5">
                <AppInput 
                  control={passwordForm.control} 
                  name="old_password" 
                  label="Mật khẩu hiện tại" 
                  type="password" 
                  placeholder="Nhập mật khẩu cũ để xác thực" 
                />
                <div className="h-px bg-[#F2F2F2] dark:bg-[#2A3143] my-2" /> {/* Divider */}
                <AppInput 
                  control={passwordForm.control} 
                  name="new_password" 
                  label="Mật khẩu mới" 
                  type="password" 
                  placeholder="Tối thiểu 6 ký tự" 
                />
                <AppInput 
                  control={passwordForm.control} 
                  name="confirm_password" 
                  label="Xác nhận mật khẩu mới" 
                  type="password" 
                  placeholder="Nhập lại mật khẩu mới" 
                />
                <div className="pt-4">
                  <Button type="submit" disabled={isChangingPassword} className="w-full bg-[#1B212D] hover:bg-[#2A3143] dark:bg-white dark:text-[#1B212D] dark:hover:bg-slate-200 text-white rounded-[10px] px-6 font-bold transition-colors">
                    {isChangingPassword ? <Spinner /> : "Đổi mật khẩu"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

        </div>

      </div>
    </div>
  );
}