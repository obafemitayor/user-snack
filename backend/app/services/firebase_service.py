import os
import uuid
from typing import Optional
from fastapi import UploadFile
import tempfile

try:
    import firebase_admin
    from firebase_admin import credentials, storage
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False

class FirebaseService:
    def __init__(self):
        self.bucket = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        if not FIREBASE_AVAILABLE:
            return
            
        try:
            firebase_admin.get_app()
        except ValueError:
            firebase_config_path = os.getenv("FIREBASE_CONFIG_PATH")
            if firebase_config_path and os.path.exists(firebase_config_path):
                cred = credentials.Certificate(firebase_config_path)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': os.getenv("FIREBASE_STORAGE_BUCKET")
                })
            else:
                firebase_admin.initialize_app(options={
                    'storageBucket': os.getenv("FIREBASE_STORAGE_BUCKET")
                })
        
        self.bucket = storage.bucket()
    
    async def upload_image(self, file: UploadFile) -> Optional[str]:
        """Upload image to Firebase Storage and return public URL"""
        if not file:
            return None
            
        if not FIREBASE_AVAILABLE:
            # Return mock URL when Firebase is not available (e.g., in tests)
            return f"https://mock-firebase-url.com/{uuid.uuid4()}.jpg"
            
        try:
            # Generate unique filename
            file_extension = file.filename.split('.')[-1].lower()
            unique_filename = f"pizzas/{uuid.uuid4()}.{file_extension}"
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                content = await file.read()
                temp_file.write(content)
                temp_file_path = temp_file.name
            
            try:
                # Upload to Firebase Storage
                blob = self.bucket.blob(unique_filename)
                blob.upload_from_filename(temp_file_path, content_type=file.content_type)
                blob.make_public()
                return blob.public_url
                
            finally:
                os.unlink(temp_file_path)
                
        except Exception as e:
            print(f"Error uploading image: {str(e)}")
            return None
