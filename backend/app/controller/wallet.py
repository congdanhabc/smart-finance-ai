from app.service.wallet import WalletService
from app.schema.wallet import WalletCreate, WalletDeposit

class WalletController:
    def __init__(self, wallet_service: WalletService):
        self.wallet_service = wallet_service

    def get_my_wallets(self, user_id: str):
        return self.wallet_service.get_user_wallets(user_id)

    def create_wallet(self, user_id: str, data: WalletCreate):
        return self.wallet_service.create_wallet(user_id, data)

    def deposit_to_wallet(self, user_id: str, wallet_id: str, data: WalletDeposit):
        return self.wallet_service.deposit_money(user_id, wallet_id, data)