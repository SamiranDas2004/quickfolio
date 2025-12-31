import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

async def upload_resume(file_content: bytes, filename: str) -> str:
    """Upload resume to Cloudinary and return URL"""
    try:
        public_id = filename.replace('.pdf', '').replace('.PDF', '')
        
        result = cloudinary.uploader.upload(
            file_content,
            folder="quickfolio/resumes",
            resource_type="raw",
            public_id=public_id,
            overwrite=True,
            invalidate=True
        )
        print(f"Cloudinary upload result: {result}")
        return result["secure_url"]
    except Exception as e:
        print(f"Error uploading to Cloudinary: {e}")
        return ""

async def upload_image(file_content: bytes, filename: str, folder: str = "quickfolio/images") -> str:
    """Upload image to Cloudinary and return URL"""
    try:
        result = cloudinary.uploader.upload(
            file_content,
            folder=folder,
            public_id=filename,
            overwrite=True,
            invalidate=True,
            transformation=[
                {'width': 1000, 'height': 1000, 'crop': 'limit'},
                {'quality': 'auto:good'}
            ]
        )
        return result["secure_url"]
    except Exception as e:
        print(f"Error uploading image: {e}")
        return ""
