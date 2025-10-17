from __future__ import annotations

from datetime import date, timedelta

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .. import models


class BookingModelTests(TestCase):
    def setUp(self):
        self.suite = models.Suite.objects.create(label="Suite 1")
        self.owner = models.Owner.objects.create(
            name="Jane Doe",
            phone="555-0101",
            email="jane@example.com",
        )
        self.pet = models.Pet.objects.create(
            owner=self.owner,
            name="Buddy",
            breed="Labrador",
            special_needs=["Grain-free diet"],
        )

    def test_prevent_overlapping_bookings(self):
        models.Booking.objects.create(
            pet=self.pet,
            suite=self.suite,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 5),
            status=models.Booking.Status.BOOKED,
        )

        overlapping = models.Booking(
            pet=self.pet,
            suite=self.suite,
            start_date=date(2024, 1, 3),
            end_date=date(2024, 1, 7),
            status=models.Booking.Status.BOOKED,
        )

        with self.assertRaises(ValidationError):
            overlapping.full_clean()

    def test_allows_non_overlapping_bookings(self):
        models.Booking.objects.create(
            pet=self.pet,
            suite=self.suite,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 5),
            status=models.Booking.Status.BOOKED,
        )

        second = models.Booking(
            pet=self.pet,
            suite=self.suite,
            start_date=date(2024, 1, 6),
            end_date=date(2024, 1, 10),
            status=models.Booking.Status.BOOKED,
        )

        # Should not raise ValidationError
        second.full_clean()


class BookingCurrentEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.suite = models.Suite.objects.create(label="Suite 2")
        owner = models.Owner.objects.create(name="John Doe")
        pet = models.Pet.objects.create(owner=owner, name="Rex")

        today = date.today()
        models.Booking.objects.create(
            pet=pet,
            suite=self.suite,
            start_date=today - timedelta(days=1),
            end_date=today + timedelta(days=1),
            status=models.Booking.Status.CHECKED_IN,
        )
        models.Booking.objects.create(
            pet=pet,
            suite=self.suite,
            start_date=today + timedelta(days=2),
            end_date=today + timedelta(days=4),
            status=models.Booking.Status.BOOKED,
        )

    def test_returns_only_current_checked_in_bookings(self):
        url = reverse("booking-current")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["status"], models.Booking.Status.CHECKED_IN)

