# Generated by Django 5.0.6 on 2024-06-17 15:12

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trainingpoint', '0009_hocky_namhoc_active_hocky_namhoc_created_date_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lop',
            name='khoa',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='trainingpoint.khoa'),
        ),
    ]
