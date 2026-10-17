
import httpx

from fastapi import HTTPException

from .config import DJANGO_API_URL


async def get_analytics(access_token: str):
    url = f"{DJANGO_API_URL}/api/analytics/dashboard/"

    headers = {
        "Authorization": f"Bearer {access_token}",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                url,
                headers=headers,
            )

            if response.status_code in (401, 403):
                raise HTTPException(
                    status_code=response.status_code,
                    detail=(
                        "Django rejected your access token. "
                        "Log in again and use a valid access token."
                    ),
                )

            response.raise_for_status()
            return response.json()

    except HTTPException:
        raise

    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail=(
                "Cannot connect to Django at "
                f"{DJANGO_API_URL}. Start the Django server "
                "on port 8000."
            ),
        )

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Django analytics request timed out.",
        )

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "Django analytics returned HTTP "
                f"{exc.response.status_code}."
            ),
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Could not complete the Django analytics request.",
        )

    except ValueError:
        raise HTTPException(
            status_code=502,
            detail="Django returned invalid JSON.",
        )