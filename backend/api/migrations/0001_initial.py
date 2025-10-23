import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Owner",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=128)),
                ("phone", models.CharField(blank=True, default="", max_length=32)),
                ("email", models.EmailField(blank=True, default="", max_length=254)),
            ],
            options={
                "ordering": ("name",),
            },
        ),
        migrations.CreateModel(
            name="Suite",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("label", models.CharField(max_length=32, unique=True)),
                ("notes", models.TextField(blank=True, default="")),
            ],
            options={
                "ordering": ("label",),
            },
        ),
        migrations.CreateModel(
            name="Pet",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=128)),
                ("breed", models.CharField(blank=True, default="", max_length=128)),
                ("weight_kg", models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ("special_needs", models.JSONField(blank=True, default=list)),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="pets", to="api.owner")),
            ],
            options={
                "ordering": ("name",),
            },
        ),
        migrations.CreateModel(
            name="Booking",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                ("status", models.CharField(choices=[("booked", "Booked"), ("checked-in", "Checked In"), ("checked-out", "Checked Out")], default="booked", max_length=12)),
                ("bathed", models.BooleanField(default=False)),
                ("notes", models.TextField(blank=True, default="")),
                ("pet", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="bookings", to="api.pet")),
                ("suite", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="bookings", to="api.suite")),
            ],
            options={
                "ordering": ("start_date", "suite__label"),
            },
        ),
        migrations.AddIndex(
            model_name="booking",
            index=models.Index(fields=["suite", "status"], name="api_bookings_suite_status_idx"),
        ),
        migrations.AddIndex(
            model_name="booking",
            index=models.Index(fields=["start_date", "end_date"], name="api_bookings_date_idx"),
        ),
    ]
