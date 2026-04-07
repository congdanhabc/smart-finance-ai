from app.service.category import CategoryService
from app.schema.category import CategoryCreate

class CategoryController:
    def __init__(self, category_service: CategoryService):
        self.category_service = category_service

    def handle_get_categories(self, user_id: str):
        return self.category_service.get_user_categories(user_id)

    def handle_create_category(self, user_id: str, data: CategoryCreate):
        return self.category_service.create_category(user_id, data)

    def handle_delete_category(self, user_id: str, category_id: int):
        return self.category_service.delete_category(user_id, category_id)