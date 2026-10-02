from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Profile


class AdminDashboardViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username='admin', password='password')
        Profile.objects.create(user=self.admin, role='ADMIN', phone='')

    def test_admin_dashboard_returns_platform_metrics(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get('/api/admin/dashboard/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['users']['total'], 1)
        self.assertEqual(response.data['users']['admins'], 1)
        self.assertEqual(response.data['properties']['total'], 0)
        self.assertEqual(response.data['applications']['pending'], 0)
        self.assertEqual(response.data['payments']['completed_amount'], '0')

    def test_non_admin_cannot_access_admin_dashboard(self):
        landlord = User.objects.create_user(username='landlord', password='password')
        Profile.objects.create(user=landlord, role='LANDLORD', phone='')
        self.client.force_authenticate(user=landlord)

        response = self.client.get('/api/admin/dashboard/')

        self.assertEqual(response.status_code, 403)
