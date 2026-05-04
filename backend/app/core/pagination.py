from fastapi import Query
from typing import Optional

class QueryParams:
    def __init__(
        self,
        page: int = Query(1, ge=1, description="Trang hiện tại (bắt đầu từ 1)"),
        size: int = Query(10, ge=1, le=100, description="Số lượng record mỗi trang (Max 100)"),
        search: Optional[str] = Query(None, description="Từ khóa tìm kiếm chung"),
        sort_by: str = Query("created_at", description="Sắp xếp theo cột nào"),
        sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Thứ tự: asc hoặc desc"),
        filter: Optional[str] = Query(None, description='JSON lọc động. VD: {"type": "EXPENSE", "category_id": "abc"}')
    ):
        self.page = page
        self.size = size
        self.search = search
        self.sort_by = sort_by
        self.sort_order = sort_order
        self.filter = filter