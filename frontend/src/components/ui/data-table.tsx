import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { FilterConfig } from "@/type/table.type";
import { DataTableToolbar } from "./data-table-toolbar";


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;

  pageIndex: number;
  pageSize: number;
  totalPage: number;
  totalItem: number;
  onPageChange: (page: number) => void;
  className?: string;
 
  searchKey?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterConfigs?: FilterConfig[];
  filterValues?: Record<string, any>;
  onFilterChange?: (key: string, value: any) => void;
  onResetFilters?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Không tìm thấy dữ liệu",
  pageIndex,
  pageSize,
  totalPage,
  totalItem,
  onPageChange,
  className,
  searchKey,
  searchPlaceholder,
  searchValue = "",
  onSearchChange,
  filterConfigs,
  filterValues = {},
  onFilterChange,
  onResetFilters,
}: DataTableProps<TData, TValue>) {
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPage,
  });

  const showToolbar = searchKey || (filterConfigs && filterConfigs.length > 0);

  return (
    <div className={`w-full flex flex-col space-y-4 ${className || ""}`}>

      <div className="h-px w-full bg-[#F2F2F2] dark:bg-[#2A3143] mb-2" />

        {showToolbar && (
          <DataTableToolbar
            searchKey={searchKey}
            searchPlaceholder={searchPlaceholder}
            searchValue={searchValue}
            onSearchChange={onSearchChange!}
            filterConfigs={filterConfigs}
            filterValues={filterValues}
            onFilterChange={onFilterChange!}
            onResetFilters={onResetFilters!}
          />
        )}


      <div className="relative w-full overflow-auto">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id} 

                      className="h-10 text-xs font-semibold text-[#929EAE] dark:text-[#78778B] uppercase tracking-wide px-4 align-middle"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-[#78778B]">
                    <Loader2 className="h-8 w-8 animate-spin mb-2 text-[#C8EE44]" />
                    <span>Đang tải dữ liệu...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-[#F2F2F2] dark:border-[#2A3143] hover:bg-slate-50 dark:hover:bg-[#2A3143]/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="text-[#78778B] text-base">{emptyMessage}</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalItem > 0 && (
        <div className="flex items-center justify-between px-2 pt-4">
          <div className="text-sm text-[#78778B]">
            Hiển thị <span className="font-medium text-[#1B212D] dark:text-white">{(pageIndex - 1) * pageSize + 1}</span> đến{" "}
            <span className="font-medium text-[#1B212D] dark:text-white">
              {Math.min(pageIndex * pageSize, totalItem)}
            </span>{" "}
            trong tổng số <span className="font-medium text-[#1B212D] dark:text-white">{totalItem}</span> bản ghi
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageIndex - 1)}
              disabled={pageIndex <= 1 || isLoading}
              className="border-[#F2F2F2] dark:border-[#2A3143] text-[#1B212D] dark:text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Trước
            </Button>
            
            <div className="text-sm font-medium text-[#1B212D] dark:text-white px-4">
              Trang {pageIndex} / {totalPage}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageIndex + 1)}
              disabled={pageIndex >= totalPage || isLoading}
              className="border-[#F2F2F2] dark:border-[#2A3143] text-[#1B212D] dark:text-white"
            >
              Sau <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}