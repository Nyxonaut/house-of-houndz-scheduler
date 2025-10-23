from __future__ import annotations

from django.contrib import admin

from . import models


@admin.register(models.Suite)
class SuiteAdmin(admin.ModelAdmin):
    list_display = ("label", "created_at", "updated_at")
    search_fields = ("label",)


@admin.register(models.Owner)
class OwnerAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "email", "created_at")
    search_fields = ("name", "phone", "email")


@admin.register(models.Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "breed", "weight_kg", "created_at")
    search_fields = ("name", "breed", "owner__name")
    autocomplete_fields = ("owner",)


@admin.register(models.Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "pet",
        "suite",
        "start_date",
        "end_date",
        "status",
        "bathed",
        "created_at",
    )
    list_filter = ("status", "suite")
    search_fields = ("pet__name", "suite__label", "pet__owner__name")
    autocomplete_fields = ("pet", "suite")

