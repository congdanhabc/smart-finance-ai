from app.core.pagination import QueryParams
from app.service.category import CategoryService
from app.schema.category import CategoryCreate, CategoryUpdate

class CategoryController:
    def __init__(self, category_service: CategoryService):
        self.category_service = category_service

    def handle_get_categories(self, user_id: str, params: QueryParams):
        return self.category_service.get_user_categories(user_id, params)

    def handle_create_category(self, user_id: str, data: CategoryCreate):
        return self.category_service.create_category(user_id, data)

    def handle_delete_category(self, user_id: str, category_id: str):
        return self.category_service.delete_category(user_id, category_id)
    
    def handle_update_category(self, user_id: str, category_id: str, data: CategoryUpdate):
        return self.category_service.update_category(user_id, category_id, data)