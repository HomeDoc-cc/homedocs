# pages/urls.py

from django.urls import path
from core import views

urlpatterns = [
    path("", views.home, name="home"),
    path("locations/", views.location_list, name="locations"),
    path("locations/<str:location_id>", views.location_detail, name="location_detail"),
    path("rooms/<str:room_id>", views.room_detail, name="room_detail"),
    path("items/<str:item_id>", views.item_detail, name="item_detail"),
]
