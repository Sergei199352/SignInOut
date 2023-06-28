from time import sleep
import sys
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
import requests
import pygame
import os

# Initialize pygame
pygame.mixer.init()

# Get the current directory path
current_dir = os.path.dirname(os.path.abspath(__file__))

# Set the path to the sound files
success_sound_file = os.path.join(current_dir, "5faca65f277a553.mp3")
error_sound_file = os.path.join(current_dir, "wide-design-z_uk-oshibki-windows.mp3")
noconnection_sound_file = os.path.join(current_dir, "wide-design-z_uk-oshibki-windows.mp3")

reader = SimpleMFRC522()

def establish_internet_connection():
    while True:
        try:
            response = requests.get('https://www.google.com')
            if response.status_code == 200:
                print("Internet connection established.")
                pygame.mixer.music.load(success_sound_file)
                pygame.mixer.music.play()
                break
        except requests.ConnectionError:
            pass
        print("No internet connection. Retrying in 5 seconds...")
        pygame.mixer.music.load(error_sound_file)
        pygame.mixer.music.play()
        sleep(2)

def read_nfc_data():
    while True:
        print("Hold a tag near the reader")
        id, text = reader.read()

        strId = str(id)

        print("ID: %s\nText: %s" % (id, text))
        nfc = {'id': strId, 'text': text}
        res = requests.post('https://rguappsign.azurewebsites.net/read', json=nfc)
        print(res)

        if res.ok:
            pygame.mixer.music.load(success_sound_file)
            pygame.mixer.music.play()
        else:
            pygame.mixer.music.load(error_sound_file)
            pygame.mixer.music.play()

        sleep(1)

try:
    establish_internet_connection()
    read_nfc_data()

except KeyboardInterrupt:
    GPIO.cleanup()
    raise
