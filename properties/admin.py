from django.contrib import admin

# Register your models here.
from .models import Property,Profile

admin.site.register(Property)
admin.site.register(Profile)