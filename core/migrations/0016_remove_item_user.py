# Generated by Django 5.0 on 2024-01-08 00:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0015_item_image_alter_location_image_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='item',
            name='user',
        ),
    ]
