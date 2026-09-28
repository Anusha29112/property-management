from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self,request,view):
        return (

            request.user.is_authenticated
            and hasattr(request.user,'profile')
            and request.user.profile.role=='ADMIN'
        )

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self,request,view,obj):
        return (request.user.is_superuser or obj.owner == request.user)

class IsAdminOrLandlord(BasePermission):
    def has_permission(self,request,view):
        return (request.user.is_authenticated and hasattr(request.user,'profile') and request.user.profile.role in['ADMIN','LANDLORD'])
