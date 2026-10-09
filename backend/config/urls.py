"""
Root URL Configuration for JaiPriya Academy.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/abacus/', include('abacus.urls')),
    path('api/spoken-english/', include('spoken_english.urls')),
    path('api/admin/students/', include('students.urls')),
    path('api/student/', include('students.student_urls')),
    path('api/admin/abacus/', include('abacus.admin_urls')),
    path('api/admin/spoken-english/', include('spoken_english.admin_urls')),
    path('api/documents/', include('documents.urls')),
    path('api/admin/documents/', include('documents.admin_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

