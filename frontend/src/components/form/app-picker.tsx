import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const PREDEFINED_COLORS =[
  "#C8EE44", "#34D399", "#3B82F6", "#8B5CF6", "#EC4899", 
  "#F43F5E", "#F97316", "#FBBF24", "#06B6D4", "#64748B"
];

const PREDEFINED_ICONS =[
  "💰", "🍔", "🚗", "🏠", "🛒", "🏥", "📚", "✈️", "🎁", 
  "☕", "🎮", "🐾", "💡", "📱", "🎉", "👗", "🍼", "🔧"
];


// COMPONENT CHỌN MÀU SẮC
interface AppColorPickerProps {
  name: string;
  control: any;
  label: string;
}

export function AppColorPicker({ name, control, label }: AppColorPickerProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="flex flex-col gap-1.5">
          <FormLabel className="text-[14px] font-medium text-[#1B212D]! dark:text-white!">{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 px-4 justify-start text-left font-normal rounded-[10px] border-[#F2F2F2] dark:border-[#2A3143] dark:bg-[#1C1A2E]",
                    fieldState.error ? "border-red-500 focus:ring-red-500" : "hover:bg-[#F8F9FB] dark:hover:bg-[#2A3143]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-5 h-5 rounded-full border border-gray-200 shadow-sm" 
                      style={{ backgroundColor: field.value }} 
                    />
                    <span className="text-[14px] text-[#1B212D] dark:text-white uppercase">
                      {field.value || "Chọn màu"}
                    </span>
                  </div>
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 rounded-3xl border-[#F2F2F2] dark:border-[#2A3143] bg-white dark:bg-[#1C1A2E] shadow-xl">
              <div className="flex flex-wrap gap-2 justify-start">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => field.onChange(color)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-transform hover:scale-110",
                      field.value === color ? "border-[#1B212D] dark:border-white" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {field.value === color && <Check size={16} className="text-white drop-shadow-md" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <FormMessage className="text-[13px] mt-1 min-h-5 text-red-500" />
        </FormItem>
      )}
    />
  );
}

// COMPONENT CHỌN ICON
interface AppIconPickerProps {
  name: string;
  control: any;
  label: string;
}

export function AppIconPicker({ name, control, label }: AppIconPickerProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="flex flex-col gap-1.5">
          <FormLabel className="text-[14px] font-medium text-[#1B212D]! dark:text-white!">{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 px-4 justify-start text-left font-normal rounded-[10px] border-[#F2F2F2] dark:border-[#2A3143] dark:bg-[#1C1A2E]",
                    fieldState.error ? "border-red-500 focus:ring-red-500" : "hover:bg-[#F8F9FB] dark:hover:bg-[#2A3143]"
                  )}
                >
                  <div className="text-xl">{field.value || "❓"}</div>
                  <span className="ml-3 text-[14px] text-[#78778B]">Nhấn để chọn Icon</span>
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 rounded-3xl border-[#F2F2F2] dark:border-[#2A3143] bg-white dark:bg-[#1C1A2E] shadow-xl">
              <div className="flex flex-wrap gap-1 justify-start">
                {PREDEFINED_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => field.onChange(icon)}
                    className={cn(
                      "w-10 h-10 text-2xl rounded-lg flex items-center justify-center transition-colors",
                      field.value === icon 
                        ? "bg-[#C8EE44] shadow-sm" 
                        : "hover:bg-[#F8F9FB] dark:hover:bg-[#2A3143]"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <FormMessage className="text-[13px] mt-1 min-h-5 text-red-500" />
        </FormItem>
      )}
    />
  );
}