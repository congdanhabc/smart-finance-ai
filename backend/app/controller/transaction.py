from app.service.transaction import TransactionService
from app.schema.transaction import TransactionCreate, TransferCreate

class TransactionController:
    def __init__(self, tx_service: TransactionService):
        self.tx_service = tx_service

    def handle_create_expense(self, user_id: str, data: TransactionCreate):
        return self.tx_service.create_expense(user_id, data)

    def handle_create_income(self, user_id: str, data: TransactionCreate):
        return self.tx_service.create_income(user_id, data)

    def handle_create_transfer(self, user_id: str, data: TransferCreate):
        return self.tx_service.create_transfer(user_id, data)

    def handle_get_all(self, user_id: str):
        return self.tx_service.get_user_transactions(user_id)