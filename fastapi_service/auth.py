
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


# This tells FastAPI and Swagger that the API uses Bearer tokens.
bearer_scheme = HTTPBearer(auto_error=False)


async def get_access_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
) -> str:
    """
    Read a Bearer access token from the Authorization header.

    The returned token is passed to the existing Django analytics
    client, which should validate it through the protected backend.
    """

    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Missing Authorization header. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization scheme. Use Bearer.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials.strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Access token is empty. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token
