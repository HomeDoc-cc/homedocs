# Generated by Django 5.0 on 2023-12-15 18:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_coating_location_coating_room'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='coating',
            name='location',
        ),
        migrations.RemoveField(
            model_name='coating',
            name='room',
        ),
        migrations.AddField(
            model_name='location',
            name='coatings',
            field=models.ManyToManyField(to='core.coating'),
        ),
        migrations.AddField(
            model_name='room',
            name='coatings',
            field=models.ManyToManyField(to='core.coating'),
        ),
    ]
