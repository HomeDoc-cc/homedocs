from django import forms
from .models import (
    UserProfile,
    Coating,
    Task,
    Location,
    Room,
    RoomPhoto,
    Item,
    Category,
    ItemCategory,
)


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = "__all__"


class CoatingForm(forms.ModelForm):
    class Meta:
        model = Coating
        fields = "__all__"


class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = "__all__"


class LocationForm(forms.ModelForm):
    class Meta:
        model = Location
        fields = "__all__"


class RoomForm(forms.ModelForm):
    class Meta:
        model = Room
        fields = "__all__"


class RoomPhotoForm(forms.ModelForm):
    class Meta:
        model = RoomPhoto
        fields = "__all__"


class ItemForm(forms.ModelForm):
    class Meta:
        model = Item
        fields = "__all__"


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = "__all__"


class ItemCategoryForm(forms.ModelForm):
    class Meta:
        model = ItemCategory
        fields = "__all__"
