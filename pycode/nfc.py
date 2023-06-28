from time import sleep
import sys
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
import requests
import pygame
import pygame.time

# Initialize pygame
pygame.mixer.init()

# Load default sounds
connected_sound = pygame.mixer.Sound(pygame.mixer.get_busy())
response_sound = pygame.mixer.Sound(pygame.mixer.stop())
error_sound = pygame.mixer.Sound(pygame.mixer.pause())

reader = SimpleMFRC522()

def establish_internet_connection():
    while True:
        try:
            response = requests.get('https://www.google.com')
            if response.status_code == 200:
                print("Internet connection established.")
                connected_sound.play()
                pygame.time.wait(1000)  # Wait for 1 second
                connected_sound.stop()
                break
        except requests.ConnectionError:
            pass
        print("No internet connection. Retrying in 5 seconds...")
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
#somehow doesnt work
        if res.ok:
            response_sound.play()
            pygame.time.wait(1000)  # Wait for 1 second
            response_sound.stop()
        else:
            error_sound.play()
            pygame.time.wait(1000)  # Wait for 1 second
            error_sound.stop()

        sleep(1)

try:
    establish_internet_connection()
    read_nfc_data()

except KeyboardInterrupt:
    GPIO.cleanup()
    raise
