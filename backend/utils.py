import os
import qrcode
from PIL import Image

QR_FOLDER = "qr_codes"

# Create QR codes directory if it doesn't exist
os.makedirs(QR_FOLDER, exist_ok=True)

def generate_qr(customer_id: str) -> str:
    """Generate QR code for customer order"""
    try:
        print(f"Generating QR code for customer ID: {customer_id}")  # Debug log
        
        # Create QR code instance
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        
        # Add data to QR code (just the customer ID)
        qr.add_data(customer_id)
        qr.make(fit=True)
        
        # Create QR code image
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        # Save QR code
        qr_path = os.path.join(QR_FOLDER, f"{customer_id}.png")
        qr_img.save(qr_path)
        
        print(f"QR code saved at: {qr_path}")  # Debug log
        
        # Verify file exists
        if os.path.exists(qr_path):
            print(f"✅ QR code file created successfully: {qr_path}")
            return qr_path
        else:
            print(f"❌ QR code file was not created: {qr_path}")
            return None
            
    except Exception as e:
        print(f"❌ Error generating QR code: {str(e)}")
        return None

# Test function to verify QR generation works
def test_qr_generation():
    """Test QR code generation"""
    test_id = "test-123"
    result = generate_qr(test_id)
    if result:
        print("✅ QR generation test passed")
    else:
        print("❌ QR generation test failed")
    return result