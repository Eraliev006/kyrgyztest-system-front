import httpx

from config import settings


def get_admin_token_sync() -> str:
    response = httpx.post(
        f'{settings.base_url}/api/auth/login',
        json={'login': settings.admin_login, 'password': settings.admin_password},
    )
    response.raise_for_status()
    return response.json()['accessToken']
