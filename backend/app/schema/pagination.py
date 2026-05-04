from typing import Generic, TypeVar, List
from pydantic import BaseModel, Field

# Khai báo T là một kiểu dữ liệu bất kỳ (sẽ được truyền vào sau)
T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T] = Field(description="Danh sách dữ liệu")
    total: int = Field(description="Tổng số lượng bản ghi (phục vụ tính tổng số trang)")
    page: int = Field(description="Trang hiện tại")
    size: int = Field(description="Số lượng bản ghi trên mỗi trang")
    total_pages: int = Field(description="Tổng số trang")