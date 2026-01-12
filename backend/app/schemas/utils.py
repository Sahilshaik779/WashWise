import os
import qrcode
from PIL import Image
import json

QR_FOLDER = "qr_codes"

# Create QR codes directory if it doesn't exist
os.makedirs(QR_FOLDER, exist_ok=True)

def generate_qr(data: dict, filename: str) -> str:
    """Generate QR code for given data and save with a specific filename."""
    try:
        qr_data = json.dumps(data) 
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        # Use the provided filename
        qr_path = os.path.join(QR_FOLDER, filename)
        qr_img.save(qr_path)
        
        if os.path.exists(qr_path):
            # CHANGED: Return only the filename for better consistency with main.py
            return filename
        else:
            return None
            
    except Exception as e:
        print(f"Error generating QR code: {str(e)}")
        return None