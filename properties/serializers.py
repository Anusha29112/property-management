from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Property,Profile,RentalApplication,Lease,MaintenanceRequest,PropertyImage,Payment

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model=Property
        fields='__all__'
        read_only_fields=['owner']


class UserRegistrationSerializer(serializers.ModelSerializer):
    role=serializers.CharField()
    phone=serializers.CharField()

    class Meta:
        model=User
        fields=['username','email','password','first_name','last_name','role','phone']
        extra_kwargs={
            'password':{'write_only':True}
        }

    def create(self,validated_data):
        role=validated_data.pop('role')
        phone=validated_data.pop('phone')

        user=User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )

        Profile.objects.create(
            user=user,
            role=role,
            phone=phone
        )

        return user

# Create Login Serializer

class LoginSerializer(serializers.Serializer):
    username=serializers.CharField()
    password=serializers.CharField(write_only=True)


class RentalApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentalApplication
        fields = '__all__'
        read_only_fields = ['tenant', 'status']


class LeaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lease
        fields = '__all__'
        read_only_fields = ['tenant', 'landlord','property']


class MaintenanceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRequest
        fields = '__all__'
        read_only_fields = ['tenant', 'status']


class PropertyImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = PropertyImage
        fields = '__all__'
        read_only_fields = ['property','created_at']


class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['tenant', 'status', 'created_at']

