try: 
    from PIL import Image
except ImportError:
    import Image
import pytesseract
import time


def process_image(image):
    try: 
        time.sleep(15)
        return pytesseract.image_to_string(image)
    except: 
        pass 
