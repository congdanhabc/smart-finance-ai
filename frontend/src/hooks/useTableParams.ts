import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "./useDebounce";

export interface TableState {
  page: number;
  size: number;
  search: string;
  sort_by: string;
  sort_order: "asc" | "desc";
  filters: Record<string, string | number | boolean>; // Lưu dưới dạng Key-Value (ví dụ: { type: "EXPENSE", status: true })
}

export function useTableParams(initialFilters: Record<string, any> = {}) {
  const [tableState, setTableState] = useState<TableState>({
    page: 1,
    size: 10,
    search: "",
    sort_by: "created_at",
    sort_order: "desc",
    filters: initialFilters, // Khởi tạo với các filter mặc định nếu có
  });

  const debouncedSearch = useDebounce(tableState.search, 500);

  const updateTableState = useCallback((updates: Partial<TableState>) => {
    setTableState((prev) => {
      const newState = { ...prev, ...updates };
      // Nếu thay đổi search hoặc filters, luôn reset trang về 1
      if (updates.search !== undefined || updates.filters !== undefined) {
        newState.page = 1;
      }
      return newState;
    });
  },[]);

  const setFilter = useCallback((key: string, value: string | number | boolean | null) => {
    setTableState((prev) => {
      const newFilters = { ...prev.filters };
      
      if (value === "" || value === null || value === undefined) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }

      return { ...prev, filters: newFilters, page: 1 };
    });
  },[]);

  const resetFilters = useCallback(() => {
    setTableState((prev) => ({ ...prev, search: "", filters: {}, page: 1 }));
  },[]);


  const apiParams = useMemo(() => {
    const payload: Record<string, any> = {
      page: tableState.page,
      size: tableState.size,
      search: debouncedSearch, 
      sort_by: tableState.sort_by,
      sort_order: tableState.sort_order,
    };

    if (Object.keys(tableState.filters).length > 0) {
      payload.filter = JSON.stringify(tableState.filters);
    }

    return payload;
  },[
    tableState.page,
    tableState.size,
    debouncedSearch, 
    tableState.sort_by,
    tableState.sort_order,
    tableState.filters,
  ]);

  return {
    tableState,           // Dùng để hiển thị trạng thái hiện tại lên UI
    updateTableState,     // Hàm gọi khi bấm chuyển trang, sort
    setFilter,            // Hàm gọi khi chọn Dropdown
    resetFilters,         // Hàm gọi khi bấm nút Reset
    apiParams,
  };
}