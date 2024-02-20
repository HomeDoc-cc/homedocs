from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import Location, Room, Coating, Item, Task
import json


# Create your views here.
@login_required
def home(request):
    locations = Location.objects.filter(user=request.user)
    rooms = Room.objects.filter(
        Q(location__user=request.user)
        or Q(location__owners__in=request.user.groups.all())
    )
    items = Item.objects.filter(
        Q(location__user=request.user)
        or Q(location__owners__in=request.user.groups.all())
    ).order_by("-date_created")
    tasks = Task.objects.filter(owners__in=request.user.groups.all())
    return render(
        request,
        "core/home.html",
        {"locations": locations, "rooms": rooms, "items": items, "tasks": tasks},
    )


@login_required
def location_list(request):
    locations = Location.objects.filter(
        Q(user=request.user) | Q(owners__in=request.user.groups.all())
    ).distinct()
    return render(request, "core/locations.html", {"locations": locations})


@login_required
def location_detail(request, location_id):
    location = get_object_or_404(Location, pk=location_id, user__username=request.user)
    rooms = location.room_set.all()
    coatings = location.coatings.all()
    return render(
        request,
        "core/location_detail.html",
        {"location": location, "rooms": rooms, "coatings": coatings},
    )


@login_required
def room_list(request):
    rooms = get_object_or_404(Room, location__user=request.user)
    return render(
        request,
        "core/room_detail.html",
        {"rooms": rooms},
    )


@login_required
def room_detail(request, room_id):
    room = get_object_or_404(Room, pk=room_id, location__user=request.user)
    coatings = room.coatings.all()
    items = room.item_set.all()
    return render(
        request,
        "core/room_detail.html",
        {"room": room, "coatings": coatings, "items": items},
    )


@login_required
def item_detail(request, item_id):
    item = get_object_or_404(Item, pk=item_id)
    tasks = Task.objects.filter(content_type__model="item", object_id=item_id)
    return render(
        request,
        "core/item_detail.html",
        {"item": item, "tasks": tasks},
    )
