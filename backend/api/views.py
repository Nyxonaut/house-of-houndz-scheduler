from __future__ import annotations

from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from . import models, serializers


class SuiteViewSet(viewsets.ModelViewSet):
    queryset = models.Suite.objects.all()
    serializer_class = serializers.SuiteSerializer


class OwnerViewSet(viewsets.ModelViewSet):
    queryset = models.Owner.objects.all()
    serializer_class = serializers.OwnerSerializer


class PetViewSet(viewsets.ModelViewSet):
    queryset = models.Pet.objects.select_related("owner").all()
    serializer_class = serializers.PetSerializer


class BookingViewSet(viewsets.ModelViewSet):
    queryset = (
        models.Booking.objects.select_related("pet", "pet__owner", "suite")
        .all()
        .order_by("start_date")
    )
    serializer_class = serializers.BookingSerializer

    @action(detail=False, methods=["get"], url_path="current")
    def current(self, request, *args, **kwargs):
        today = timezone.localdate()
        current_bookings = self.filter_queryset(self.get_queryset()).filter(
            status=models.Booking.Status.CHECKED_IN,
            start_date__lte=today,
            end_date__gte=today,
        )
        serializer = self.get_serializer(current_bookings, many=True)
        return Response(serializer.data)

