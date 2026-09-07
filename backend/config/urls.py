from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static

from .auth_views import ForgotPasswordView, LoginView, LogoutView, MeView, RegisterView, ResetPasswordView, UsageView
from videos.views import kie_webhook

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", RegisterView.as_view(), name="auth-register"),
    path("api/auth/login/", LoginView.as_view(), name="auth-login"),
    path("api/auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("api/auth/me/", MeView.as_view(), name="auth-me"),
    path("api/auth/forgot-password/", ForgotPasswordView.as_view(), name="auth-forgot-password"),
    path("api/auth/reset-password/", ResetPasswordView.as_view(), name="auth-reset-password"),
    path("api/account/usage/", UsageView.as_view(), name="account-usage"),
    path("api/videos/", include("videos.urls")),
    path("api/webhooks/kie/", kie_webhook, name="kie-webhook"),
]


if settings.DEBUG:

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
