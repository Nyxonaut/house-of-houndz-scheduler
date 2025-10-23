from __future__ import annotations

from datetime import date

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Suite(TimeStampedModel):
    label = models.CharField(max_length=32, unique=True)
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ("label",)

    def __str__(self) -> str:
        return self.label


class Owner(TimeStampedModel):
    name = models.CharField(max_length=128)
    phone = models.CharField(max_length=32, blank=True, default="")
    email = models.EmailField(blank=True, default="")

    class Meta:
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name


class Pet(TimeStampedModel):
    owner = models.ForeignKey(
        Owner,
        on_delete=models.CASCADE,
        related_name="pets",
    )
    name = models.CharField(max_length=128)
    breed = models.CharField(max_length=128, blank=True, default="")
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    special_needs = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ("name",)

    def __str__(self) -> str:
        return f"{self.name} ({self.owner.name})"


class BookingQuerySet(models.QuerySet):
    def active(self) -> "BookingQuerySet":
        return self.exclude(status=Booking.Status.CHECKED_OUT)

    def overlapping(self, suite: Suite, start: date, end: date, exclude_id: int | None = None) -> "BookingQuerySet":
        qs = self.filter(
            suite=suite,
            status__in=[Booking.Status.BOOKED, Booking.Status.CHECKED_IN],
        ).filter(
            Q(start_date__lte=end) & Q(end_date__gte=start)
        )
        if exclude_id:
            qs = qs.exclude(id=exclude_id)
        return qs


class Booking(TimeStampedModel):
    class Status(models.TextChoices):
        BOOKED = "booked", "Booked"
        CHECKED_IN = "checked-in", "Checked In"
        CHECKED_OUT = "checked-out", "Checked Out"

    pet = models.ForeignKey(
        Pet,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    suite = models.ForeignKey(
        Suite,
        on_delete=models.PROTECT,
        related_name="bookings",
    )
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.BOOKED,
    )
    bathed = models.BooleanField(default=False)
    notes = models.TextField(blank=True, default="")

    objects = BookingQuerySet.as_manager()

    class Meta:
        ordering = ("start_date", "suite__label")
        indexes = [
            models.Index(fields=("suite", "status")),
            models.Index(fields=("start_date", "end_date")),
        ]

    def __str__(self) -> str:
        return f"{self.pet.name} in {self.suite.label} [{self.start_date}→{self.end_date}]"

    def clean(self) -> None:
        super().clean()

        if self.start_date > self.end_date:
            raise ValidationError({"end_date": "End date must be on or after start date."})

        if not self.suite_id:
            return

        overlapping = Booking.objects.overlapping(
            suite=self.suite,
            start=self.start_date,
            end=self.end_date,
            exclude_id=self.id,
        )
        if overlapping.exists():
            raise ValidationError(
                {"suite": "Suite already has a booking during the requested dates."}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

