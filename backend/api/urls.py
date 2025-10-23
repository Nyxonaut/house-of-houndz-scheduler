"""API URL configuration placeholder."""

from __future__ import annotations

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("suites", views.SuiteViewSet, basename="suite")
router.register("owners", views.OwnerViewSet, basename="owner")
router.register("pets", views.PetViewSet, basename="pet")
router.register("bookings", views.BookingViewSet, basename="booking")

urlpatterns = [
    path("", include(router.urls)),
]
