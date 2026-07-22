"""
DebtProof — Custom Token Obtain Pair Serializer
Supports both 'email' and 'username' keys in request body for seamless JWT authentication.
"""
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Accepts either 'email' or 'username' in request payload."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Ensure email or username field is accepted
        if "email" in self.fields:
            self.fields["email"].required = False
        if "username" in self.fields:
            self.fields["username"].required = False

    def validate(self, attrs):
        # Normalize email/username payload
        email = attrs.get("email") or attrs.get("username")
        if email:
            attrs[self.username_field] = email.lower().strip()
        return super().validate(attrs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
