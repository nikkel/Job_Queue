try:
    from PIL import Image
except ImportError:
    import Image
import pytesseract
import time
import io


def process_image(image_bytes):
    try:
        time.sleep(15)
        image = Image.open(io.BytesIO(image_bytes))
        return pytesseract.image_to_string(image)
    except Exception as e:
        return f'Error: {str(e)}'
