from django.urls import path
from .views import PropertyListView,PropertyDetailView,RegisterView,LoginView

urlpatterns=[
    path('properties/',PropertyListView.as_view(),name='property-list'),
    path('properties/<int:pk>/',PropertyDetailView.as_view(),name='property-detail'),
    path('register/',RegisterView.as_view(),name='register'),
    path('login/',LoginView.as_view(),name='login'),
]