"""
Project middleware — login protection and cache control for auth pages.
"""
from django.conf import settings
from django.contrib.auth.views import redirect_to_login


def _prevent_browser_cache(response):
    """Stop back/forward cache from showing stale logged-in HTML after logout."""
    response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    response['Vary'] = 'Cookie'
    return response


class LoginRequiredMiddleware:
    """
    Redirect anonymous users to login before dashboard, predictions, or emergency apps.
    Public: home, users (login/register/logout), admin, static, media, accounts.
    """

    PUBLIC_PREFIXES = (
        '/users/login',
        '/users/register',
        '/users/logout',
        '/accounts/',
        '/contact/',
        '/admin/',
        '/static/',
        '/media/',
    )

    PROTECTED_PREFIXES = (
        '/dashboard/',
        '/predictions/',
        '/emergency/',
        '/users/profile',
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path

        if path == '/' or any(path.startswith(p) for p in self.PUBLIC_PREFIXES):
            response = self.get_response(request)
            if request.user.is_authenticated:
                _prevent_browser_cache(response)
            return response

        if not request.user.is_authenticated:
            if any(path.startswith(p) for p in self.PROTECTED_PREFIXES):
                return redirect_to_login(
                    request.get_full_path(),
                    login_url=settings.LOGIN_URL,
                )
            return self.get_response(request)

        response = self.get_response(request)
        return _prevent_browser_cache(response)
