from app.core.pagination import QueryParams
from app.service.wallet import WalletService
from app.schema.wallet import WalletCreate, WalletDeposit, WalletUpdate

class WalletController:
    def __init__(self, wallet_service: WalletService):
        self.wallet_service = wallet_service

    def get_my_wallets(self, user_id: str, params: QueryParams):
        return self.wallet_service.get_user_wallets(user_id, params)

    def create_wallet(self, user_id: str, data: WalletCreate):
        return self.wallet_service.create_wallet(user_id, data)

    def deposit_to_wallet(self, user_id: str, wallet_id: str, data: WalletDeposit):
        return self.wallet_service.deposit_money(user_id, wallet_id, data)
    
    def handle_delete_wallet(self, user_id: str, wallet_id: str):
        return self.wallet_service.delete_wallet(user_id, wallet_id)
    
    def handle_update_wallet(self, user_id: str, wallet_id: str, data: WalletUpdate):
        return self.wallet_service.update_wallet(user_id, wallet_id, data)