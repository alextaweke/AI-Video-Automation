from django.urls import path

from .views import (
    VideoListView,
    CreateVideoView,
    VideoDetailView,
)

urlpatterns = [
    path("", VideoListView.as_view(), name="video-list"),
    path("create/", CreateVideoView.as_view(), name="video-create"),
    path("<int:pk>/", VideoDetailView.as_view(), name="video-detail"),
]
