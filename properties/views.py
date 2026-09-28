from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Property
from .serializers import PropertySerializer,UserRegistrationSerializer,LoginSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdmin,IsOwnerOrAdmin,IsAdminOrLandlord

# Create your views here.

class PropertyListView(APIView):

    permission_classes=[IsAuthenticated]

    def get(self, request):
        properties = Property.objects.all()
        serializer=PropertySerializer(properties,many=True)

        return Response(serializer.data)

    def post(self,request):
        permission=IsAdminOrLandlord()

        if not permission.has_permission(request,self):
            return Response({"detail":"Only admins and landlords can create properties."},status=403)
        
        serializer=PropertySerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data)
        return Response(serializer.errors,status=400)

# pk-primary key
class PropertyDetailView(APIView):
    
    permission_classes=[IsAuthenticated,IsOwnerOrAdmin]

    def get_property(self,pk):
        try:
            return Property.objects.get(pk=pk)
        except Property.DoesNotExist:
            return None

    def get(self,request,pk):
        property=self.get_property(pk)

        if property is None:
            return Response({"error": "Property not found"},status=404)
        
        self.check_object_permissions(request,property)

        serializer=PropertySerializer(property)
        return Response(serializer.data)

    def put(self,request,pk):
        property=self.get_property(pk)

        if property is None:
            return Response({"error": "Property not found"},status=404)
        
        self.check_object_permissions(request,property)
        serializer=PropertySerializer(property,data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=400) 


    def delete(self,request,pk):
        property=self.get_property(pk)

        if property is None:
            return Response({"error": "Property not found"},status=404)

        self.check_object_permissions(request,property)
        property.delete()
        return Response({"message": "Property deleted successfully"},status=204)


class RegisterView(APIView):
    def post(self,request):
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message":"User registered successfully"}, status=201)
        return Response(serializer.errors,status=400)

# Create the Login View
class LoginView(APIView):
    def post(self,request):
        serializer=LoginSerializer(data=request.data)

        if serializer.is_valid():
            username=serializer.validated_data['username']
            password=serializer.validated_data['password']

            user=authenticate(
                username=username,
                password=password
            )

            if user is not None:
                refresh=RefreshToken.for_user(user)
                return Response({"message":"Login successful","refresh":str(refresh),"access":str(refresh.access_token)})
            return Response({"error":"Invalid username or password"},status=401)
        return Response(serializer.errors,status=400)


class AdminTestView(APIView):
    permission_classes=[IsAdmin]

    def get(self,request):
        return Response({"mesage":"You are an admin. Access Granted!"})