import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface AppDatePickerProps {
  name: string;
  control: any;
  label: string;
  className?: string;
}

export function AppDatePicker({ name, control, label, className }: AppDatePickerProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn("flex flex-col gap-1.5", className)}>
          <FormLabel className="text-[14px] font-medium text-[#1B212D]! dark:text-white!">
            {label}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full px-4 h-12 rounded-[10px] border-[#F2F2F2] dark:border-[#2A3143] text-[14px] font-medium justify-start text-left bg-white dark:bg-[#1C1A2E]",
                    fieldState.error ? "border-red-500 focus:ring-red-500" : "hover:bg-[#F8F9FB] dark:hover:bg-[#2A3143]",
                    !field.value && "text-[#929EAE]"
                  )}
                >
                  <CalendarIcon className="mr-3 h-4 w-4 opacity-50" />
                  {field.value ? (
                    format(new Date(field.value), "dd MMMM, yyyy", { locale: vi })
                  ) : (
                    <span>Chọn ngày giao dịch</span>
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0 rounded-2xl border-[#F2F2F2] dark:border-[#2A3143] shadow-lg" 
              align="start"
              sideOffset={4} 
            >
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                autoFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage className="text-[13px] mt-1 min-h-5 text-red-500" />
        </FormItem>
      )}
    />
  );
}