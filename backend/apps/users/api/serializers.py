"""
DebtProof — User API Serializers
Handles validation and representation for all user-related API endpoints.
"""
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from apps.users.models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for new user registration."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value: str) -> str:
        """Ensure the email is not already registered."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_password(self, value: str) -> str:
        """Run Django's built-in password validators."""
        validate_password(value)
        return value

    def validate(self, attrs: dict) -> dict:
        """Ensure both passwords match."""
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data: dict) -> User:
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Read/write serializer for the authenticated user's profile.
    Password is never returned.
    """

    full_name = serializers.ReadOnlyField()
    avatar_url = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone_number",
            "avatar",
            "avatar_url",
            "bio",
            "is_email_verified",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "email", "is_email_verified", "created_at", "updated_at"]

    def update(self, instance: User, validated_data: dict) -> User:
        """Update only provided fields."""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class UserSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for embedding user info in other responses."""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "avatar_url"]
        read_only_fields = fields
