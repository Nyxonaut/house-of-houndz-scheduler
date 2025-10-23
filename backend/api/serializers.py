from __future__ import annotations

from django.db import transaction
from rest_framework import serializers

from . import models


class SuiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Suite
        fields = ["id", "label", "notes", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Owner
        fields = ["id", "name", "phone", "email", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class PetSerializer(serializers.ModelSerializer):
    owner = OwnerSerializer(read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Owner.objects.all(),
        write_only=True,
        source="owner",
    )

    class Meta:
        model = models.Pet
        fields = [
            "id",
            "name",
            "breed",
            "weight_kg",
            "special_needs",
            "owner",
            "owner_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "owner"]


class BookingSerializer(serializers.ModelSerializer):
    pet = PetSerializer(read_only=True)
    pet_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Pet.objects.select_related("owner"),
        write_only=True,
        source="pet",
    )
    suite = SuiteSerializer(read_only=True)
    suite_id = serializers.PrimaryKeyRelatedField(
        queryset=models.Suite.objects.all(),
        write_only=True,
        source="suite",
    )

    class Meta:
        model = models.Booking
        fields = [
            "id",
            "pet",
            "pet_id",
            "suite",
            "suite_id",
            "start_date",
            "end_date",
            "status",
            "bathed",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "pet", "suite", "created_at", "updated_at"]

    def validate(self, attrs):
        instance = models.Booking(
            pet=attrs.get("pet", getattr(self.instance, "pet", None)),
            suite=attrs.get("suite", getattr(self.instance, "suite", None)),
            start_date=attrs.get("start_date", getattr(self.instance, "start_date", None)),
            end_date=attrs.get("end_date", getattr(self.instance, "end_date", None)),
            status=attrs.get("status", getattr(self.instance, "status", models.Booking.Status.BOOKED)),
            bathed=attrs.get("bathed", getattr(self.instance, "bathed", False)),
        )
        if self.instance:
            instance.id = self.instance.id
        instance.full_clean()
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        booking = models.Booking.objects.create(**validated_data)
        return booking

    @transaction.atomic
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

