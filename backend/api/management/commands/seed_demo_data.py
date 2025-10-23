from __future__ import annotations

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from api import models


class Command(BaseCommand):
    help = "Populate the database with demo suites, owners, pets, and bookings."

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Seeding demo data..."))

        suites = []
        for number in range(1, 14):
            suite, created = models.Suite.objects.get_or_create(label=f"Suite {number}")
            suites.append(suite)
            self.stdout.write(
                f"- Suite {suite.label} {'created' if created else 'already exists'}"
            )

        owner, owner_created = models.Owner.objects.get_or_create(
            name="Demo Owner",
            defaults={
                "phone": "555-0100",
                "email": "demo.owner@example.com",
            },
        )
        self.stdout.write(
            f"- Owner {owner.name} {'created' if owner_created else 'already exists'}"
        )

        pet, pet_created = models.Pet.objects.get_or_create(
            name="Bailey",
            owner=owner,
            defaults={
                "breed": "Golden Retriever",
                "weight_kg": 27.0,
                "special_needs": ["Grain-free diet"],
            },
        )
        self.stdout.write(
            f"- Pet {pet.name} {'created' if pet_created else 'already exists'}"
        )

        today = timezone.localdate()
        booking_defaults = {
            "status": models.Booking.Status.CHECKED_IN,
            "bathed": False,
            "notes": "Demo booking generated via seed_demo_data.",
            "start_date": today,
            "end_date": today + timedelta(days=3),
        }

        booking, booking_created = models.Booking.objects.update_or_create(
            pet=pet,
            suite=suites[0],
            defaults=booking_defaults,
        )
        self.stdout.write(
            f"- Booking for {booking.pet.name} in {booking.suite.label} "
            f"{'created' if booking_created else 'updated'}"
        )

        self.stdout.write(self.style.SUCCESS("Demo data ready!"))
