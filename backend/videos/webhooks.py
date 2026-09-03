from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Video


class KieWebhookView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        data = request.data

        print("KIE WEBHOOK:")
        print(data)

        task_id = data.get("data", {}).get("taskId")

        if not task_id:

            return Response({"status": "ignored"})

        try:

            video = Video.objects.get(kie_task_id=task_id)

        except Video.DoesNotExist:

            return Response({"status": "video not found"})

        # The exact response structure depends
        # on the KIE model/API being used.

        video.status = "completed"

        video.save(update_fields=["status"])

        return Response({"status": "received"})
