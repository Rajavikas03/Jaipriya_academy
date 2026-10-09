from rest_framework import permissions

class IsAcademyAdmin(permissions.BasePermission):
    """
    Allows access only to authenticated users with ACADEMY_ADMIN role or superusers.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (getattr(request.user, 'role', None) == 'ACADEMY_ADMIN' or request.user.is_superuser)
        )

