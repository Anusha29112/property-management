from django.urls import path
from .views import PropertyListView,PropertyDetailView

urlpatterns=[
    path('properties/',PropertyListView.as_view(),name='property-list'),
    path('properties/<int:pk>/',PropertyDetailView.as_view(),name='property-detail'),
]