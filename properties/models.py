from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

# Create your models here.
class Property(models.Model):
    STATUS_CHOICES=[
        ('AVAILABLE','Available'),
        ('RENTED','Rented'),
        ('MAINTENANCE','Maintenance'),
        ('INACTIVE','Inactive')
        ]

    PROPERTY_TYPE_CHOICES = [
        ('APARTMENT', 'Apartment'),
        ('HOUSE', 'House'),
        ('CONDO', 'Condo'),
        ('TOWNHOUSE', 'Townhouse'),
        ('BASEMENT', 'Basement'),
        ('ROOM', 'Room'),
    ]
    owner=models.ForeignKey(User,on_delete=models.CASCADE,related_name='properties',null=True,blank=True)

    title=models.CharField(max_length=100)
    description=models.TextField()
    
    address=models.CharField(max_length=255)
    city=models.CharField(max_length=100)
    province=models.CharField(max_length=100)
    postal_code=models.CharField(max_length=20)

    rent=models.DecimalField(max_digits=10,decimal_places=2,validators=[MinValueValidator(0)])

    bedrooms=models.PositiveIntegerField()
    bathrooms=models.DecimalField(max_digits=3,decimal_places=1,validators=[MinValueValidator(0)])

    property_type=models.CharField(max_length=20,choices=PROPERTY_TYPE_CHOICES)
    status=models.CharField(max_length=20,choices=STATUS_CHOICES,default='AVAILABLE')

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


class RentalApplication(models.Model):

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    tenant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='rental_applications'
    )

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='rental_applications'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )

    message = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.tenant.username} - {self.property.title}"


class Lease(models.Model):

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('ENDED', 'Ended'),
        ('TERMINATED', 'Terminated'),
    ]

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='leases'
    )

    tenant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='leases_as_tenant'
    )

    landlord = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='leases_as_landlord'
    )

    application = models.OneToOneField(
        RentalApplication,
        on_delete=models.CASCADE,
        related_name='lease'
    )

    start_date = models.DateField()
    end_date = models.DateField()

    monthly_rent = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.tenant.username} - {self.property.title}"


class MaintenanceRequest(models.Model):

    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='maintenance_requests'
    )

    tenant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='maintenance_requests'
    )

    title = models.CharField(max_length=200)

    description = models.TextField()

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='MEDIUM'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='OPEN'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.property.title}"


class PropertyImage(models.Model):

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='images'
    )

    image = models.ImageField(
        upload_to='property_images/',
        blank=True,
        null=True
    )

    image_url = models.URLField(blank=True)

    caption = models.CharField(
        max_length=200,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.property.title} - Image"


class Payment(models.Model):

    PAYMENT_METHOD_CHOICES = [
        ('CASH', 'Cash'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('CREDIT_CARD', 'Credit Card'),
        ('DEBIT_CARD', 'Debit Card'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    lease = models.ForeignKey(
        Lease,
        on_delete=models.CASCADE,
        related_name='payments'
    )

    tenant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payments'
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )

    payment_date = models.DateField()

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )

    reference = models.CharField(
        max_length=100,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.tenant.username} - {self.amount}"