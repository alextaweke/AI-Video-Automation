from django.contrib.auth import authenticate
from datetime import timedelta
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from videos.models import UserProfile, Video
from videos.serializers import UserProfileSerializer

VOICE_OPTIONS = {"Sarah", "Adam", "Rachel", "Michael", "Custom Voice"}


def serialize_user(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }


def serialize_account(user):
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.refresh_usage_period()
    profile.save()
    return UserProfileSerializer(profile).data


class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = (request.data.get("username") or "").strip()
        email = (request.data.get("email") or "").strip()
        password = request.data.get("password") or ""

        if not username:
            return Response({"error": "Username is required"}, status=400)

        if not password:
            return Response({"error": "Password is required"}, status=400)

        if User.objects.filter(username__iexact=username).exists():
            return Response({"error": "Username is already taken"}, status=400)

        if email and User.objects.filter(email__iexact=email).exists():
            return Response({"error": "Email is already in use"}, status=400)

        user = User(username=username, email=email)

        try:
            validate_password(password, user)
        except ValidationError as error:
            return Response({"error": " ".join(error.messages)}, status=400)

        user.set_password(password)
        user.save()
        UserProfile.objects.create(user=user)

        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "user": serialize_user(user),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = (request.data.get("username") or "").strip()
        password = request.data.get("password") or ""

        if not username or not password:
            return Response({"error": "Username and password are required"}, status=400)

        user = authenticate(request, username=username, password=password)

        if not user:
            return Response({"error": "Invalid username or password"}, status=400)

        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "user": serialize_user(user),
            }
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({"status": "signed_out"})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"user": serialize_user(request.user), "account": serialize_account(request.user)})

    def patch(self, request):
        user = request.user
        email = (request.data.get("email") or "").strip()
        first_name = (request.data.get("first_name") or "").strip()
        last_name = (request.data.get("last_name") or "").strip()
        preferred_voice = request.data.get("preferred_voice")
        preferred_voice_settings = request.data.get("preferred_voice_settings")

        if email and User.objects.exclude(pk=user.pk).filter(email__iexact=email).exists():
            return Response({"error": "Email is already in use"}, status=400)
        if preferred_voice is not None and preferred_voice not in VOICE_OPTIONS:
            return Response({"error": "Invalid preferred voice"}, status=400)
        if preferred_voice_settings is not None and not isinstance(preferred_voice_settings, dict):
            return Response({"error": "Invalid preferred voice settings"}, status=400)

        user.email = email
        user.first_name = first_name
        user.last_name = last_name
        user.save(update_fields=["email", "first_name", "last_name"])

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if preferred_voice is not None:
            profile.preferred_voice = preferred_voice
        if preferred_voice_settings is not None:
            profile.preferred_voice_settings = preferred_voice_settings
        profile.save(update_fields=["preferred_voice", "preferred_voice_settings"])

        return Response({"user": serialize_user(user), "account": serialize_account(user)})


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = (request.data.get("email") or "").strip()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
            send_mail(
                "Reset your AI Video Automation password",
                f"Use this link to reset your password:\n\n{reset_url}",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True,
            )
        return Response({"status": "If an account matches that email, a reset link has been sent."})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        uid = request.data.get("uid") or ""
        token = request.data.get("token") or ""
        password = request.data.get("password") or ""
        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(uid)))
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"error": "This reset link is invalid or expired"}, status=400)
        if not default_token_generator.check_token(user, token):
            return Response({"error": "This reset link is invalid or expired"}, status=400)
        try:
            validate_password(password, user)
        except ValidationError as error:
            return Response({"error": " ".join(error.messages)}, status=400)
        user.set_password(password)
        user.save(update_fields=["password"])
        Token.objects.filter(user=user).delete()
        return Response({"status": "password_reset"})


class UsageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.refresh_usage_period()
        profile.save()
        today = timezone.localdate()
        chart = []
        for offset in range(6, -1, -1):
            day = today - timedelta(days=offset)
            chart.append({
                "date": day.isoformat(),
                "count": Video.objects.filter(user=request.user, status="completed", created_at__date=day).count(),
            })
        return Response({
            "account": UserProfileSerializer(profile).data,
            "videos_created": Video.objects.filter(user=request.user).count(),
            "minutes_generated": profile.minutes_generated,
            "credits_remaining": profile.credits_remaining,
            "chart": chart,
        })
