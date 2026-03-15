import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import os

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)


async def upload_image(file) -> str:
    """
    Upload a file to Cloudinary and return the secure URL.
    Accepts a FastAPI UploadFile object.
    """
    contents = await file.read()
    result = cloudinary.uploader.upload(
        contents,
        folder="exchange_app/products",
        resource_type="image"
    )
    return result["secure_url"]
