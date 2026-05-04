from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import get_current_user
from app.model.user import User

from app.schema.statistic import DashboardResponse, TimePeriod
from app.service.statistic import StatisticService
from app.controller.statistic import StatisticController

router = APIRouter()

def get_statistic_controller(db: Session = Depends(get_db)) -> StatisticController:
    service = StatisticService(db)
    return StatisticController(service)

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard_stats(
    period: TimePeriod = Query(TimePeriod.MONTH, description="WEEK, MONTH, hoặc YEAR"),
    date_str: str = Query(None, description="Ngày muốn xem (YYYY-MM-DD). Mặc định là hôm nay"),
    current_user: User = Depends(get_current_user),
    controller: StatisticController = Depends(get_statistic_controller)
):
    # Parse ngày tháng, nếu Frontend không truyền thì lấy ngày hôm nay (UTC)
    target_date = datetime.now(timezone.utc)
    if date_str:
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except ValueError:
            pass # Nếu người dùng truyền sai format, lấy mặc định

    return controller.handle_get_dashboard(current_user.id, period, target_date)