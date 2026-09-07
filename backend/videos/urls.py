from django.urls import path

from .views import (
    VideoListView,
    CreateVideoView,
    VideoDetailView,
    VideoScenesView,
    VideoSceneDetailView,
    RegenerateSceneView,
    GenerateVideoView,
    GenerateThumbnailView,
)

urlpatterns = [
    path("", VideoListView.as_view(), name="video-list"),
    path("create/", CreateVideoView.as_view(), name="video-create"),
    path("<int:pk>/scenes/", VideoScenesView.as_view(), name="video-scenes"),
    path("<int:pk>/scenes/<int:scene_number>/", VideoSceneDetailView.as_view(), name="video-scene-detail"),
    path("<int:pk>/scenes/<int:scene_number>/regenerate/", RegenerateSceneView.as_view(), name="video-scene-regenerate"),
    path("<int:pk>/generate/", GenerateVideoView.as_view(), name="video-generate"),
    path("<int:pk>/thumbnail/", GenerateThumbnailView.as_view(), name="video-thumbnail"),
    path("<int:pk>/", VideoDetailView.as_view(), name="video-detail"),
]
