from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Property,Profile

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model=Property
        fields='__all__'


class UserRegistrationSerializer(serializers.ModelSerializer):
    role=serializers.CharField()
    phone=serializers.CharField()

    class Meta:
        model=User
        fields=['username','email','password','role','phone']
        extra_kwargs={
            'password':{'write_only':True}
        }

    def create(self,validated_data):
        role=validated_data.pop('role')
        phone=validated_data.pop('phone')

        user=User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
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