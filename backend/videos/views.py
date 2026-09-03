from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Video
from .serializers import VideoSerializer
from .tasks import generate_video_pipeline


class CreateVideoView(APIView):

    def post(self, request):

        title = request.data.get("title")
        topic = request.data.get("topic")

        if not title or not topic:

            return Response(
                {"error": "title and topic are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        video = Video.objects.create(title=title, topic=topic)

        task = generate_video_pipeline.delay(video.id)

        return Response(
            {
                "video_id": video.id,
                "celery_task_id": task.id,
                "status": video.status,
            },
            status=status.HTTP_202_ACCEPTED,
        )


class VideoDetailView(APIView):

    def get(self, request, pk):

        try:

            video = Video.objects.get(pk=pk)

        except Video.DoesNotExist:

            return Response(
                {"error": "Video not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = VideoSerializer(video)

        return Response(serializer.data)
