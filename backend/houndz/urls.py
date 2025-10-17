"""houndz URL Configuration."""

from __future__ import annotations

from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path


def healthcheck_view(_: object) -> HttpResponse:
    return HttpResponse("ok", content_type="text/plain")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", healthcheck_view, name="healthcheck"),
    path("api/", include("api.urls")),
]

