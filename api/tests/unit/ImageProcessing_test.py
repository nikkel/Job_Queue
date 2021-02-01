from unittest import TestCase
from util.ImageProcessing import process_image
from PIL import Image


class ImageProcessingTest(TestCase):
    def test_image_to_text(self):
        image = Image.open('tests/unit/test_image.png')
        text = process_image(image)

        assert 'What is Optical Character\nRecognition?\n\x0c' in text
