from django.urls import path

from .views import (
    CreateVideoView,
    VideoDetailView,
)

urlpatterns = [
    path("create/", CreateVideoView.as_view()),
    path("<int:pk>/", VideoDetailView.as_view()),
]
