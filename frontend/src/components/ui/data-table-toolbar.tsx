import { CalendarIcon, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { type FilterConfig } from "@/type/table.type";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface DataTableToolbarProps {
    searchKey?: string;
    searchPlaceholder?: string;
    searchValue: string;
    onSearchChange: (value: string) => void;

    filterConfigs?: FilterConfig[];
    filterValues: Record<string, any>;
    onFilterChange: (key: string, value: any) => void;

    onResetFilters: () => void;
}

export function DataTableToolbar({
    searchKey,
    searchPlaceholder = "Tìm kiếm...",
    searchValue,
    onSearchChange,
    filterConfigs = [],
    filterValues,
    onFilterChange,
    onResetFilters,
}: DataTableToolbarProps) {

    const [localSearch, setLocalSearch] = useState(searchValue);
    const debouncedSearch = useDebounce(localSearch, 500);

    const onSearchChangeRef = useRef(onSearchChange);
    useEffect(() => {
        onSearchChangeRef.current = onSearchChange;
    }, [onSearchChange]);

    useEffect(() => {
        if (debouncedSearch !== searchValue) {
            onSearchChangeRef.current(debouncedSearch);
        }
    }, [debouncedSearch, searchValue]);

    const hasActiveFilters = localSearch !== "" || Object.keys(filterValues).length > 0;


    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-1 items-center space-x-2">

                {searchKey && (
                    <div className="relative w-full max-w-75">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#929EAE]" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="h-10 pl-9 rounded-[10px] border-[#F2F2F2] dark:border-[#2A3143] dark:bg-[#1C1A2E] text-[14px] focus-visible:ring-[#C8EE44]"
                        />
                    </div>
                )}

                {filterConfigs.map((config) => {
                    const rawValue = filterValues[config.key];
                    const currentValue = (rawValue === undefined || rawValue === null || rawValue === "") ? "all" : String(rawValue);

                    if (config.type === "select" && config.options) {
                        return (
                            <Select
                                key={config.key}
                                value={currentValue}
                                onValueChange={(val) => {
                                    onFilterChange(config.key, val === "all" ? "" : val);
                                }}
                            >
                                <SelectTrigger className={`h-10 px-3 rounded-[10px] border-[#F2F2F2] dark:border-[#2A3143] dark:bg-[#1C1A2E] text-sm focus:ring-[#C8EE44] ${config.className || "w-40"}`}>
                                    <SelectValue placeholder={config.label} />
                                </SelectTrigger>
                                <SelectContent className="rounded-[10px] border-[#F2F2F2] dark:border-[#2A3143] dark:bg-[#1C1A2E]">
                                    <SelectItem value="all" className="cursor-pointer focus:bg-[#C8EE44] focus:text-[#1B212D]">
                                        {config.label}
                                    </SelectItem>
                                    {config.options.map((opt) => (
                                        <SelectItem key={opt.value} value={String(opt.value)} className="cursor-pointer focus:bg-[#C8EE44] focus:text-[#1B212D]">
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        );
                    }

                    if (config.type === "date-range") {
                        const dateValue = filterValues[config.key] as DateRange | undefined;

                        return (
                            <Popover key={config.key}>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                            "h-10 px-3 justify-start text-left font-normal rounded-[10px] border-[#F2F2F2] dark:border-[#2A3143] dark:bg-[#1C1A2E] text-sm focus:ring-[#C8EE44]",
                                            !dateValue && "text-muted-foreground",
                                            config.className || "w-60"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateValue?.from ? (
                                            dateValue.to ? (
                                                <>
                                                    {format(dateValue.from, "dd/MM", { locale: vi })} -{" "}
                                                    {format(dateValue.to, "dd/MM", { locale: vi })}
                                                </>
                                            ) : (
                                                format(dateValue.from, "dd/MM/yyyy", { locale: vi })
                                            )
                                        ) : (
                                            <span>{config.label}</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-2xl shadow-lg" align="start" sideOffset={4}>
                                    <Calendar
                                        autoFocus
                                        mode="range"
                                        defaultMonth={dateValue?.from}
                                        selected={dateValue}
                                        onSelect={(range) => {
                                            onFilterChange(config.key, range);
                                        }}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        );
                    }

                    return null;
                })}

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setLocalSearch("");
                            onResetFilters();
                        }}
                        className="h-10 px-3 text-[#78778B] hover:text-[#1B212D] dark:hover:text-white"
                    >
                        Reset <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}