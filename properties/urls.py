from django.urls import path
from .views import (
    PropertyListView,
    PropertyDetailView,
    RegisterView,
    LoginView,
    AdminTestView,
    RentalApplicationView,
    LandlordApplicationView,
    LandlordApplicationDecisionView,
    LeaseView,
    MaintenanceRequestView,
    MaintenanceRequestDetailView,
    PropertyImageView,
    PaymentView
)

urlpatterns=[
    path('properties/',PropertyListView.as_view(),name='property-list'),
    path('properties/<int:pk>/',PropertyDetailView.as_view(),name='property-detail'),
    path('register/',RegisterView.as_view(),name='register'),
    path('login/',LoginView.as_view(),name='login'),
    path('admin-test/',AdminTestView.as_view(),name='admin-test'),
    path('rental-application/',RentalApplicationView.as_view(),name='rental-appliation'),
    path('landlord/applications/',LandlordApplicationView.as_view(),name='landlord-applications'),
    path('landlord/applications/<int:pk>/',LandlordApplicationDecisionView.as_view(),name='landlord-application-decision'),
    path('leases/', LeaseView.as_view(), name='leases'),
    path('leases/<int:pk>/', LeaseView.as_view(), name='lease-detail'),
    path('maintenance-requests/',MaintenanceRequestView.as_view(),name='maintenance-requests'),
    path('maintenance-requests/<int:pk>/',MaintenanceRequestDetailView.as_view(),name='maintenance-request-detail'),
    path('properties/<int:property_id>/images/',PropertyImageView.as_view(),name='property-images'),
    path('payments/',PaymentView.as_view(),name='payments'),
]