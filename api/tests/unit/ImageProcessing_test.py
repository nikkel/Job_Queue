import shutil
from unittest import TestCase
from unittest.mock import patch

from util.ImageProcessing import process_image


class ImageProcessingTest(TestCase):
    @classmethod
    def setUpClass(cls):
        with open('tests/unit/test_image.png', 'rb') as f:
            cls.image_bytes = f.read()

    @patch('util.ImageProcessing.time.sleep')
    def test_process_image_returns_error_string_on_bad_bytes(self, mock_sleep):
        text = process_image(b'not a real image')

        assert text.startswith('Error:')
        mock_sleep.assert_called_once()

    @patch('util.ImageProcessing.time.sleep')
    def test_process_image_calls_pytesseract_with_decoded_image(self, mock_sleep):
        with patch('util.ImageProcessing.pytesseract.image_to_string', return_value='mocked text') as mock_ocr:
            text = process_image(self.image_bytes)

        assert text == 'mocked text'
        mock_ocr.assert_called_once()

    def test_process_image_real_ocr(self):
        if shutil.which('tesseract') is None:
            self.skipTest('tesseract binary not available on PATH')

        with patch('util.ImageProcessing.time.sleep'):
            text = process_image(self.image_bytes)

        assert 'What is Optical Character\nRecognition?' in text
