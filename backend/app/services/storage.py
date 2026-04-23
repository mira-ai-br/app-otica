import boto3
from fastapi import UploadFile
from app.config import settings

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = boto3.client(
            "s3",
            endpoint_url=f"https://{settings.r2_account_id}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.r2_access_key_id,
            aws_secret_access_key=settings.r2_secret_access_key,
            region_name="auto",
        )
    return _client


async def upload_photo(file: UploadFile, key: str) -> str:
    content = await file.read()
    ext = (file.filename or "photo.jpg").rsplit(".", 1)[-1]
    full_key = f"{key}.{ext}"
    _get_client().put_object(
        Bucket=settings.r2_bucket_name,
        Key=full_key,
        Body=content,
        ContentType=file.content_type or "image/jpeg",
    )
    return f"{settings.r2_public_url}/{full_key}"
