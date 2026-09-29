from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Property,RentalApplication,Lease,MaintenanceRequest,PropertyImage,Payment
from .serializers import (PropertySerializer,
    UserRegistrationSerializer,LoginSerializer,RentalApplicationSerializer,LeaseSerializer,MaintenanceRequestSerializer,PropertyImageSerializer,PaymentSerializer)
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdmin,IsOwnerOrAdmin,IsAdminOrLandlord
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination

# Create your views here.
class PropertyPagination(PageNumberPagination):
    page_size=10

class PropertyListView(APIView):

    permission_classes=[IsAuthenticated]

    def get(self, request):
        search=request.query_params.get('search')
        property_type = request.query_params.get('property_type')
        city = request.query_params.get('city')
        status = request.query_params.get('status')
        sort=request.query_params.get('sort')

        properties = Property.objects.all()

        if search:
            properties = properties.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search) |
            Q(city__icontains=search) |
            Q(property_type__icontains=search)
        )

        if property_type:
            properties = properties.filter(property_type=property_type)

        if city:
            properties = properties.filter(city__icontains=city)

        if status:
            properties = properties.filter(status=status)

        if sort:
            properties = properties.order_by(sort)

        paginator=PropertyPagination()
        page=paginator.paginate_queryset(properties,request)

        serializer=PropertySerializer(page,many=True)
        return paginator.get_paginated_response(serializer.data)

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

class RentalApplicationView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = RentalApplication.objects.filter(
            tenant=request.user
        )

        serializer = RentalApplicationSerializer(
            applications,
            many=True
        )

        return Response(serializer.data)


    def post(self, request):

        if not hasattr(request.user, 'profile') or request.user.profile.role != 'TENANT':
            return Response(
                {"error": "Only tenants can apply for properties."},
                status=403
            )
        
        property_id = request.data.get('property')

        if RentalApplication.objects.filter(
            tenant=request.user,
            property_id=property_id
        ).exists():
            return Response(
                {"error": "You have already applied for this property."},
                status=400
            )

        serializer = RentalApplicationSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(tenant=request.user)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)


class LandlordApplicationView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        applications = RentalApplication.objects.filter(
            property__owner=request.user
        )

        serializer = RentalApplicationSerializer(
            applications,
            many=True
        )

        return Response(serializer.data)


class LandlordApplicationDecisionView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        try:
            application = RentalApplication.objects.get(
                pk=pk,
                property__owner=request.user
            )
        except RentalApplication.DoesNotExist:
            return Response(
                {"error": "Application not found"},
                status=404
            )
        
        if application.status != 'PENDING':
            return Response(
                {"error": "This application has already been decided."},
                status=400
        )

        status_value = request.data.get('status')

        if status_value not in ['APPROVED', 'REJECTED']:
            return Response(
                {"error": "Status must be APPROVED or REJECTED"},
                status=400
            )

        application.status = status_value
        application.save()

        serializer = RentalApplicationSerializer(application)

        return Response(serializer.data)


class LeaseView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not hasattr(request.user, 'profile'):
            return Response(
                {"error": "User profile not found."},
                status=403
            )

        if request.user.profile.role == 'TENANT':

            leases = Lease.objects.filter(
                tenant=request.user
            )

        elif request.user.profile.role == 'LANDLORD':

            leases = Lease.objects.filter(
                landlord=request.user
            )

        else:
            return Response(
                {"error": "You do not have permission to view leases."},
                status=403
            )

        serializer = LeaseSerializer(
            leases,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        if not hasattr(request.user, 'profile') or request.user.profile.role != 'LANDLORD':
            return Response(
                {"error": "Only landlords can create leases."},
                status=403
            )

        application_id = request.data.get('application')

        try:
            application = RentalApplication.objects.get(
                id=application_id,
                property__owner=request.user
            )
        except RentalApplication.DoesNotExist:
            return Response(
                {"error": "Application not found or you do not own this property."},
                status=404
            )

        if application.status != 'APPROVED':
            return Response(
                {"error": "A lease can only be created from an approved application."},
                status=400
            )

        if hasattr(application, 'lease'):
            return Response(
                {"error": "A lease already exists for this application."},
                status=400
            )

        serializer = LeaseSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(
                landlord=request.user,
                tenant=application.tenant,
                property=application.property,
                application=application
            )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )

    def patch(self, request, pk):

        try:
            lease = Lease.objects.get(
                id=pk,
                landlord=request.user
            )
        except Lease.DoesNotExist:
            return Response(
                {"error": "Lease not found or you do not own this lease."},
                status=404
            )

        if lease.status != 'ACTIVE':
            return Response(
                {"error": "Only active leases can be changed."},
                status=400
            )

        status_value = request.data.get('status')

        if status_value not in ['ENDED', 'TERMINATED']:
            return Response(
                {"error": "Status must be ENDED or TERMINATED."},
                status=400
            )

        lease.status = status_value
        lease.save()

        serializer = LeaseSerializer(lease)

        return Response(serializer.data)


class MaintenanceRequestView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not hasattr(request.user, 'profile'):
            return Response(
                {"error": "User profile not found."},
                status=403
            )

        if request.user.profile.role == 'TENANT':

            requests = MaintenanceRequest.objects.filter(
                tenant=request.user
            )

        elif request.user.profile.role == 'LANDLORD':

            requests = MaintenanceRequest.objects.filter(
                property__owner=request.user
            )

        else:

            return Response(
                {"error": "You do not have permission to view maintenance requests."},
                status=403
            )

        serializer = MaintenanceRequestSerializer(
            requests,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        if not hasattr(request.user, 'profile') or request.user.profile.role != 'TENANT':
            return Response(
                {"error": "Only tenants can create maintenance requests."},
                status=403
            )

        property_id = request.data.get('property')

        if not property_id:
            return Response(
                {"error": "Property is required."},
                status=400
            )

        # Check that the tenant currently rents this property
        active_lease = Lease.objects.filter(
            property_id=property_id,
            tenant=request.user,
            status='ACTIVE'
        ).exists()

        if not active_lease:
            return Response(
                {
                    "error": "You can only create maintenance requests for a property you currently rent."
                },
                status=403
            )

        serializer = MaintenanceRequestSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                tenant=request.user
            )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )


class MaintenanceRequestDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        try:
            maintenance_request = MaintenanceRequest.objects.get(
                id=pk
            )
        except MaintenanceRequest.DoesNotExist:
            return Response(
                {"error": "Maintenance request not found."},
                status=404
            )

        # LANDLORD
        if (
            hasattr(request.user, 'profile')
            and request.user.profile.role == 'LANDLORD'
            and maintenance_request.property.owner == request.user
        ):

            allowed_fields = ['status', 'priority']

            for field in allowed_fields:
                if field in request.data:
                    setattr(
                        maintenance_request,
                        field,
                        request.data[field]
                    )

            maintenance_request.save()

            serializer = MaintenanceRequestSerializer(
                maintenance_request
            )

            return Response(serializer.data)

        # TENANT
        if maintenance_request.tenant == request.user:

            if maintenance_request.status != 'OPEN':
                return Response(
                    {
                        "error": "Only open requests can be cancelled."
                    },
                    status=400
                )

            if request.data.get('status') != 'CANCELLED':
                return Response(
                    {
                        "error": "You can only cancel the request."
                    },
                    status=400
                )

            maintenance_request.status = 'CANCELLED'
            maintenance_request.save()

            serializer = MaintenanceRequestSerializer(
                maintenance_request
            )

            return Response(serializer.data)

        return Response(
            {"error": "You do not have permission to update this request."},
            status=403
        )


class PropertyImageView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, property_id):

        images = PropertyImage.objects.filter(
            property_id=property_id
        )

        serializer = PropertyImageSerializer(
            images,
            many=True
        )

        return Response(serializer.data)

    def post(self, request, property_id):

        if not hasattr(request.user, 'profile'):
            return Response(
                {"error": "User profile not found."},
                status=403
            )

        # Only the property owner can add images
        try:
            property = Property.objects.get(
                id=property_id,
                owner=request.user
            )
        except Property.DoesNotExist:
            return Response(
                {"error": "Property not found or you do not own it."},
                status=404
            )

        serializer = PropertyImageSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                property=property
            )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )

class PaymentView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not hasattr(request.user, 'profile'):
            return Response(
                {"error": "User profile not found."},
                status=403
            )

        if request.user.profile.role == 'TENANT':

            payments = Payment.objects.filter(
                tenant=request.user
            )

        elif request.user.profile.role == 'LANDLORD':

            payments = Payment.objects.filter(
                lease__landlord=request.user
            )

        else:

            return Response(
                {"error": "You do not have permission to view payments."},
                status=403
            )

        serializer = PaymentSerializer(
            payments,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        if not hasattr(request.user, 'profile') or request.user.profile.role != 'TENANT':
            return Response(
                {"error": "Only tenants can create payments."},
                status=403
            )

        lease_id = request.data.get('lease')

        try:
            lease = Lease.objects.get(
                id=lease_id,
                tenant=request.user,
                status='ACTIVE'
            )
        except Lease.DoesNotExist:
            return Response(
                {"error": "Active lease not found."},
                status=404
            )

        serializer = PaymentSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                tenant=request.user,
                status='PENDING'
            )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )


