import { Link, useNavigate } from "react-router-dom";
import { MoveLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Minh họa 404 */}
        <div className="relative">
          <h1 className="text-[150px] font-black text-[#C8EE44] dark:text-slate-900 leading-none select-none">
            404
          </h1>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-[#1B212D] dark:text-white">
            Không tìm thấy trang
          </h2>
          <p className="text-[#78778B] dark:text-slate-400 text-lg">
            Rất tiếc, đường dẫn bạn đang truy cập không tồn tại hoặc đã được chuyển đi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            asChild 
            className="w-full h-12 bg-[#C8EE44] hover:bg-[#b8de34] text-[#1B212D] font-bold rounded-[10px] transition-all"
          >
            <Link to="/">
              <Home className="mr-2 h-5 w-5" /> Về trang chủ
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="w-full h-12 border-[#F2F2F2] dark:border-slate-800 text-[#78778B] hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[10px]"
          >
            <MoveLeft className="mr-2 h-5 w-5" /> Quay lại trang trước
          </Button>
        </div>

      </div>
    </div>
  );
}