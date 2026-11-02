from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, DepartmentViewSet


router = DefaultRouter()

router.register("employees", EmployeeViewSet)
router.register(
    r"departments",
    DepartmentViewSet,
    basename="department",
)




urlpatterns = router.urls