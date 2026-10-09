from django.contrib import admin
from django.urls import path, include

from employees.views import home

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [

    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "",
        home
    ),

    # JWT LOGIN
    path(
        "api/auth/login/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),

    # JWT REFRESH
    path(
        "api/auth/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    # EMPLOYEES
    path(
        "api/",
        include("employees.urls")
    ),

    # ACCOUNTS
    path(
        "api/accounts/",
        include("accounts.urls")
    ),

    # ANALYTICS
    path(
        "api/analytics/",
        include("analytics.urls")
    ),
]