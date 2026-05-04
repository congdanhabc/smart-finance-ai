import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useScanReceipt } from "@/hooks/query/ai";
import type { TransactionDraft } from "@/type/ai.type";
import { toast } from "sonner";
import { UploadCloud, ImageIcon, Loader2, X } from "lucide-react";

interface ScanReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (draft: TransactionDraft) => void;
}

export function ScanReceiptDialog({ isOpen, onClose, onScanSuccess }: ScanReceiptDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const[preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { mutateAsync: scanReceipt, isPending } = useScanReceipt();

  // 1. Lắng nghe sự kiện Paste (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen) return; // Chỉ bắt paste khi Modal đang mở
      
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const pastedFile = items[i].getAsFile();
            if (pastedFile) handleFileSelect(pastedFile);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen]);

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type & size (VD: max 5MB)
    if (!selectedFile.type.startsWith("image/")) {
      return toast.error("Vui lòng chọn file hình ảnh (JPG, PNG).");
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      return toast.error("Dung lượng ảnh tối đa là 5MB.");
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
  };

  // 2. Xử lý Gửi cho AI
  const handleScan = async () => {
    if (!file) return;
    try {
      const res = await scanReceipt(file);
      toast.success(res.detail || "Đã bóc tách dữ liệu thành công!");
      
      // Xóa form và chuyển cục Draft về cho trang cha (TransactionPage)
      handleReset();
      onScanSuccess(res.transaction_draft);
      
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Không thể phân tích hóa đơn này.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleReset();
      onClose();
    }}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#1C1A2E] rounded-[24px] border-[#F2F2F2] dark:border-[#2A3143]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Quét hóa đơn bằng AI</DialogTitle>
          <DialogDescription>
            Tải lên hoặc dán (Ctrl+V) ảnh hóa đơn/biên lai để AI tự động trích xuất thông tin giao dịch.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#E2E8F0] dark:border-[#2A3143] rounded-3xl bg-[#F8F9FB] dark:bg-[#1B212D] transition-colors relative mt-4">
          
          {preview ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden flex items-center justify-center">
              <img src={preview} alt="Receipt preview" className="max-h-full max-w-full object-contain" />
              <button 
                onClick={handleReset}
                disabled={isPending}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div 
              className="text-center cursor-pointer py-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 bg-white dark:bg-[#2A3143] rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                <UploadCloud className="text-[#929EAE]" size={24} />
              </div>
              <p className="text-[14px] font-semibold text-[#1B212D] dark:text-white">Bấm để tải ảnh lên</p>
              <p className="text-[13px] text-[#78778B] mt-1">hoặc Ctrl+V để dán ảnh vào đây</p>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/png, image/jpeg, image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isPending} className="border-none">
            Hủy
          </Button>
          <Button 
            onClick={handleScan} 
            disabled={!file || isPending}
            className="bg-[#C8EE44] hover:bg-[#b8de34] text-[#1B212D] font-bold"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang quét...</>
            ) : (
              <><ImageIcon className="w-4 h-4 mr-2" /> Trích xuất dữ liệu</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}