from fastapi import HTTPException
from app.repository.category import CategoryRepository
from app.schema.category import CategoryCreate

class CategoryService:
    def __init__(self, category_repo: CategoryRepository):
        self.category_repo = category_repo

    def get_user_categories(self, user_id: str):
        return self.category_repo.get_by_user(user_id)

    def create_category(self, user_id: str, data: CategoryCreate):
        # Kiểm tra giới hạn: Ví dụ 1 user chỉ được tạo tối đa 20 danh mục custom
        current_cats = self.category_repo.get_by_user(user_id)
        if len(current_cats) >= 50:
            raise HTTPException(status_code=400, detail="Bạn đã đạt giới hạn tạo danh mục.")

        # Thêm user_id vào data để biết ai là chủ danh mục này
        create_data = data.model_dump()
        create_data["user_id"] = user_id
        
        return self.category_repo.create(obj_in=create_data)

    def delete_category(self, user_id: str, category_id: str):
        cat = self.category_repo.get(category_id)
        if not cat:
            raise HTTPException(status_code=404, detail="Không tìm thấy danh mục.")
        
        # LOGIC QUAN TRỌNG: Không cho phép xóa danh mục hệ thống
        if cat.user_id is None:
            raise HTTPException(status_code=403, detail="Không được phép xóa danh mục mặc định của hệ thống.")
        
        if cat.user_id != user_id:
            raise HTTPException(status_code=403, detail="Bạn không có quyền xóa danh mục này.")

        return self.category_repo.delete(category_id)