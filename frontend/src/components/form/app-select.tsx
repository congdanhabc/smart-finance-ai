import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string | number;
}

interface AppSelectProps {
  name: string;
  control: any;
  label: string;
  placeholder?: string;
  options: Option[];
  disabled?: boolean;
  className?: string;
  onChangeValue?: (value: any) => void;
}

export function AppSelect({ name, control, label, placeholder, options, disabled, className, onChangeValue }: AppSelectProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col gap-1.5", className)}>
          <FormLabel className="text-[14px] font-medium text-[#1B212D] dark:text-white">
            {label}
          </FormLabel>
          <Select 
            disabled={disabled} 
            onValueChange={(val) => {
              field.onChange(val);
              if (onChangeValue) onChangeValue(val);
            }} 
            defaultValue={String(field.value || "")}
          >
            <FormControl>
              <SelectTrigger className="w-full px-4 h-12 rounded-[10px] border-[#F2F2F2] dark:border-[#2A3143] text-[14px] font-medium text-[#1B212D] dark:text-white dark:bg-[#1C1A2E] focus:ring-1 focus:ring-[#C8EE44]">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent position="popper" sideOffset={4} className="rounded-[10px] border-[#F2F2F2] dark:border-[#2A3143] dark:bg-[#1C1A2E]">
              {options.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)} className="cursor-pointer focus:bg-[#C8EE44] focus:text-[#1B212D]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage className="text-[13px] mt-1 min-h-5" />
        </FormItem>
      )}
    />
  );
}