from django.contrib import admin

# Register your models here.
from .models import Property,Profile,RentalApplication,Lease,MaintenanceRequest,PropertyImage,Payment

admin.site.register(Property)
admin.site.register(Profile)
admin.site.register(RentalApplication)
admin.site.register(Lease)
admin.site.register(MaintenanceRequest)
admin.site.register(PropertyImage)
admin.site.register(Payment)