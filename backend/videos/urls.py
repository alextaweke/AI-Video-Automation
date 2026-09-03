from django.urls import path

from .views import (
    VideoListView,
    CreateVideoView,
    VideoDetailView,
)

urlpatterns = [
    path("", VideoListView.as_view()),
    path("create/", CreateVideoView.as_view()),
    path("<int:pk>/", VideoDetailView.as_view()),
]
