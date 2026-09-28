from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Property(models.Model):
    owner=models.ForeignKey(User,on_delete=models.CASCADE,related_name='properties',null=True,blank=True)

    title=models.CharField(max_length=100)
    description=models.TextField()
    
    address=models.CharField(max_length=255)
    city=models.CharField(max_length=100)
    province=models.CharField(max_length=100)
    postal_code=models.CharField(max_length=20)

    rent=models.DecimalField(max_digits=10,decimal_places=2)

    bedrooms=models.PositiveIntegerField()
    bathrooms=models.DecimalField(max_digits=3,decimal_places=1)

    property_type=models.CharField(max_length=50)
    status=models.CharField(max_length=50)

    create_at=models.DateTimeField(auto_now_add=True)
    update_at=models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Profile(models.Model):
    ROLE_CHOICES=[
        ('ADMIN','Admin'),
        ('LANDLORD','Landlord'),
        ('TENANT','Tenant'),
    ]
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    role=models.CharField(max_length=20,choices=ROLE_CHOICES)
    phone=models.CharField(max_length=20)

    def __str__(self):
        return self.user.username


