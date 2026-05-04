from datetime import datetime
from app.service.statistic import StatisticService
from app.schema.statistic import TimePeriod

class StatisticController:
    def __init__(self, stat_service: StatisticService):
        self.stat_service = stat_service

    def handle_get_dashboard(self, user_id: str, period: TimePeriod, target_date: datetime):
        return self.stat_service.get_dashboard_data(user_id, period, target_date)