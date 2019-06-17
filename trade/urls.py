from django.contrib import admin
from django.urls import path
from .views import MainView, upload_file


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', MainView.as_view()),
    path('upload/', upload_file),
]
