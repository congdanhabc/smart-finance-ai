import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface FormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: FormSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className={`fixed! top-[50%] bottom-auto -translate-y-1/2 right-4 sm:right-6! h-[85vh] w-[calc(100%-32px)] sm:max-w-125 bg-white dark:bg-[#1C1A2E] border border-[#F2F2F2] dark:border-[#2A3143] rounded-[24px] shadow-2xl flex flex-col p-0 overflow-hidden ${className || ""}`}
      >

        <SheetHeader className="shrink-0 p-6 sm:px-8 pt-8 border-b border-[#F2F2F2] dark:border-[#2A3143]">
          <SheetTitle className="text-[22px] font-bold text-[#1B212D] dark:text-white">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-[15px] text-[#78778B] mt-1.5">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>


        <div className="flex-1 overflow-y-auto p-6 sm:px-8 custom-scrollbar">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}