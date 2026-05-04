from fastapi import HTTPException
from slugify import slugify
from app.core.pagination import QueryParams
from app.repository.category import CategoryRepository
from app.schema.category import CategoryCreate, CategoryUpdate

class CategoryService:
    def __init__(self, category_repo: CategoryRepository):
        self.category_repo = category_repo

    def get_user_categories(self, user_id: str, params: QueryParams):
        return self.category_repo.get_by_user_paginated(user_id, params)

    def create_category(self, user_id: str, data: CategoryCreate):
        # 1. TẠO SLUG TỪ TÊN
        category_slug = slugify(data.name)

        # 2. SỬ DỤNG REPOSITORY ĐỂ KIỂM TRA TRÙNG LẶP
        existing_cat = self.category_repo.check_duplicate_slug(
            user_id=user_id, 
            slug=category_slug, 
            cat_type=data.type
        )

        if existing_cat:
            raise HTTPException(
                status_code=400, 
                detail=f"Danh mục '{data.name}' đã tồn tại trong hệ thống."
            )

        if self.category_repo.count_by_user(user_id) >= 50:
            raise HTTPException(
                status_code=400, 
                detail="Category limit reached (Maximum 50). Please delete unused categories."
            )
        
        return self.category_repo.create(obj_in=data, user_id=user_id, slug=category_slug)

    def delete_category(self, user_id: str, category_id: str):
        cat = self.category_repo.get(category_id)
        if not cat:
            raise HTTPException(status_code=404, detail="Không tìm thấy danh mục.")
        
        if cat.user_id is None:
            raise HTTPException(status_code=403, detail="Không được phép xóa danh mục mặc định của hệ thống.")
        
        if str(cat.user_id) != str(user_id):
            raise HTTPException(status_code=403, detail="Bạn không có quyền xóa danh mục này.")
        
        if len(cat.transactions) > 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Không thể xóa. Đang có {len(cat.transactions)} giao dịch sử dụng danh mục này. Vui lòng chuyển các giao dịch sang danh mục khác trước khi xóa."
            )

        self.category_repo.delete(category_id)
        return {"detail": "Xóa danh mục thành công."}
    
    def update_category(self, user_id: str, category_id: str, data: CategoryUpdate):
        # 1. Lấy danh mục hiện tại từ DB
        cat = self.category_repo.get(category_id)
        if not cat:
            raise HTTPException(status_code=404, detail="Không tìm thấy danh mục.")
        
        # 2. Phân quyền: Cấm sửa danh mục mặc định của hệ thống
        if cat.user_id is None:
            raise HTTPException(status_code=403, detail="Không được phép sửa danh mục mặc định của hệ thống.")
        
        # 3. Phân quyền: Chỉ chủ sở hữu mới được sửa
        if str(cat.user_id) != str(user_id):
            raise HTTPException(status_code=403, detail="Bạn không có quyền sửa danh mục này.")

        # 4. Xử lý Logic tạo Slug mới (Nếu người dùng có gửi lên tên mới)
        kwargs = {}
        if data.name and data.name != cat.name:
            new_slug = slugify(data.name)
            
            # Kiểm tra xem tên mới có bị trùng với danh mục nào khác không
            existing_cat = self.category_repo.check_duplicate_slug(
                user_id=user_id, 
                slug=new_slug, 
                cat_type=cat.type
            )
            
            # Nếu bị trùng và cái bị trùng KHÔNG PHẢI là chính nó -> Chặn lại
            if existing_cat and str(existing_cat.id) != str(category_id):
                raise HTTPException(status_code=400, detail=f"Danh mục '{data.name}' đã tồn tại trong hệ thống.")
            
            kwargs["slug"] = new_slug # Chuẩn bị truyền slug mới vào DB

        # 5. Dùng BaseRepository để tự động Update những trường được gửi lên
        updated_cat = self.category_repo.update(
            db_obj=cat, 
            obj_in=data, 
            **kwargs  # Tiêm ngầm slug mới (nếu có) vào đây
        )
        
        return updated_cat