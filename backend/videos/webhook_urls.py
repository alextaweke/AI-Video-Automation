from django.urls import path

from .webhooks import KieWebhookView

urlpatterns = [
    path("kie/", KieWebhookView.as_view()),
]
