
from django.urls import path
from .views import (
    AttendanceListView,
    CheckInView,
    CheckOutView,
)

urlpatterns = [
    path("", AttendanceListView.as_view(), name="attendance-list"),
    path("check-in/", CheckInView.as_view(), name="attendance-check-in"),
    path("check-out/", CheckOutView.as_view(), name="attendance-check-out"),
]
