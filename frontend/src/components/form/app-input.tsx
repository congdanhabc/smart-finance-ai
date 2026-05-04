import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AppInputProps {
  name: string;
  control: any;
  label: string;
  placeholder?: string;
  type?: "text" | "password" | "email" | "number";
  disabled?: boolean;
  className?: string;
  onChangeValue?: (value: any) => void;
}

export function AppInput({ name, control, label, placeholder, type = "text", disabled, className, onChangeValue }: AppInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const formatDisplayNumber = (val: any) => {
    if (val === null || val === undefined || val === "") return "";
    const stringVal = String(val).replace(/\D/g, "");
    const noLeadingZeros = stringVal.replace(/^0+(?=\d)/, "");

    return noLeadingZeros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;

        return (
          <FormItem className={cn("flex flex-col gap-1.5", className)}>
            <FormLabel className="text-[14px] font-medium text-[#1B212D]! dark:text-white!">
              {label}
            </FormLabel>
            <FormControl>
              <div className="relative w-full">
                <Input
                  type={type === "number" ? "text" : isPassword ? (showPassword ? "text" : "password") : type}
                  
                  placeholder={placeholder}
                  disabled={disabled}
                  className={cn(
                    "w-full px-4 h-12 rounded-[10px] border-[#F2F2F2] dark:border-[#2A3143] text-[14px] font-medium text-[#1B212D] dark:text-white placeholder-[#929EAE] dark:bg-[#1C1A2E] transition-colors",
                    hasError ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#C8EE44] focus-visible:border-[#C8EE44]",
                    isPassword && "pr-12"
                  )}
                  
                  value={type === "number" ? formatDisplayNumber(field.value) : field.value}

                  onChange={(e) => {
                    if (type === "number") {
                      const rawValue = e.target.value.replace(/\D/g, "");
                      const cleanValue = rawValue.replace(/^0+(?=\d)/, "");

                      const numValue = cleanValue === "" ? undefined : Number(cleanValue);
                      
                      field.onChange(numValue);
                      if (onChangeValue) onChangeValue(numValue);
                    } else {
                      field.onChange(e.target.value);
                      if (onChangeValue) onChangeValue(e.target.value);
                    }
                  }}
                  
                  name={field.name}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
                
                {isPassword && (
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#78778B]">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </FormControl>
            <FormMessage className="text-[13px] mt-1 min-h-5 text-red-500" />
          </FormItem>
        );
      }}
    />
  );
}