from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('Doubt.urls')),
    path('manifest.json', serve, {'document_root': settings.REACT_BUILD_DIR, 'path': 'manifest.json'}),
    path('favicon.ico', serve, {'document_root': settings.REACT_BUILD_DIR, 'path': 'favicon.ico'}),

    # Serve React's index.html for every other path so React Router handles routing
    re_path(r'^(?!api/|admin/|media/).*$', TemplateView.as_view(template_name='index.html')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
