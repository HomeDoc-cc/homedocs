# pages/urls.py

from django.urls import path
from core import views

urlpatterns = [
    path("", views.home, name="home"),
    path("locations/", views.location_list, name="locations"),
    path("locations/<str:location_id>", views.location_detail, name="location_detail"),
    path("locations/<str:location_id>/rooms/add", views.room_add, name="room_add"),
    path("rooms/<str:room_id>", views.room_detail, name="room_detail"),
    path("rooms/<str:room_id>/items/add", views.item_add, name="item_add"),
    path("items/<str:item_id>", views.item_detail, name="item_detail"),
]
