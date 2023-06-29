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

import socket
import pygame.mixer
from time import sleep

success_sound_file = "success_sound.wav"
error_sound_file = "error_sound.wav"

def establish_internet_connection():
    while True:
        try:
            # Create a socket and attempt to connect to a remote host
            # in this case, we'll use Google's DNS server
            socket.create_connection(('8.8.8.8', 53))
            print("Internet connection established.")
            pygame.mixer.music.load(success_sound_file)
            pygame.mixer.music.play()
            break
        except socket.error:
            pass
        print("No internet connection. Retrying in 5 seconds...")
        pygame.mixer.music.load(error_sound_file)
        pygame.mixer.music.play()
        sleep(5)


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
