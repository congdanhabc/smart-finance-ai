import { useState } from "react"; // TỰ QUẢN LÝ STATE BÊN TRONG
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface ConfirmModalProps {
  trigger?: React.ReactNode;
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  trigger,
  title,
  description,
  onConfirm,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
}: ConfirmModalProps) {
  // 1. TỰ QUẢN LÝ ĐÓNG/MỞ BÊN TRONG COMPONENT NÀY
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      
      {trigger && (
        <AlertDialogTrigger asChild>
          {trigger}
        </AlertDialogTrigger>
      )}

      <AlertDialogContent className="bg-white dark:bg-[#1C1A2E] border-[#F2F2F2] dark:border-[#2A3143] rounded-[24px] max-w-100">
        <AlertDialogHeader className="flex flex-col items-center text-center">
          
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 mb-2">
            <Trash2 size={24} />
          </div>
          
          <AlertDialogTitle className="text-xl font-bold text-[#1B212D] dark:text-white">
            {title}
          </AlertDialogTitle>
          
          <AlertDialogDescription className="text-[#78778B]">
            {description}
          </AlertDialogDescription>
          
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-center gap-3 mt-4">
          <AlertDialogCancel 
            disabled={isLoading}
            className="w-full sm:w-auto h-11 rounded-[10px] border-[#F2F2F2] dark:border-[#2A3143] text-[#78778B] font-semibold"
          >
            {cancelText}
          </AlertDialogCancel>
          
          <Button 
            onClick={handleConfirm} 
            disabled={isLoading}
            className="w-full sm:w-auto h-11 rounded-[10px] bg-red-500 hover:bg-red-600 text-white font-bold"
          >
            {isLoading ? (
               <div className="flex items-center gap-2">
                 <Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...
               </div>
            ) : confirmText}
          </Button>
        </AlertDialogFooter>
        
      </AlertDialogContent>
    </AlertDialog>
  );
}