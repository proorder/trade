from django.contrib import admin
from django.urls import path
from .views import MainView, upload_file, select


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', MainView.as_view()),
    path('upload/', upload_file),
    path('select/', select),
]
