from django.db import models

# Create your models here.
class Property(models.Model):
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