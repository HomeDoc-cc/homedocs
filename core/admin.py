from django.contrib import admin
from .models import (
    Location,
    Room,
    RoomPhoto,
    Item,
    Coating,
    ItemCategory,
    Category,
    Task,
    UserProfile,
)

# Register your models here.
admin.site.register(Location)
admin.site.register(Room)
admin.site.register(RoomPhoto)
admin.site.register(Item)
admin.site.register(Coating)
admin.site.register(ItemCategory)
admin.site.register(Category)
admin.site.register(Task)
admin.site.register(UserProfile)
