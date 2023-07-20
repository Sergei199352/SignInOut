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
#
success_sound_file = os.path.join(current_dir, "5faca65f277a553.mp3")
# sound that informs the user of an error
error_sound_file = os.path.join(current_dir, "wide-design-z_uk-oshibki-windows.mp3")
# sound that informs the user that the connection is ongoing
waiting = os.path.join(current_dir, "vagner-polet-valkirijj.mp3")
# indicates successful connection to the internet
waitingShort = os.path.join(current_dir, "19f925ab5a5e735.mp3")

# create a reader instance
reader = SimpleMFRC522()
# internet connection loop
def establish_internet_connection():
   
    while True:
        # checks if the devicem is connected to the internet
        try:
            pygame.mixer.music.load(waiting)
            pygame.mixer.music.play()
            response = requests.get('https://www.google.com')
            # once the responce recieved then breaks the loop 
            if response.status_code == 200:
                pygame.mixer.music.stop()
                print("Internet connection established.")
                pygame.mixer.music.load(waitingShort)
                pygame.mixer.music.play()
                break
            #if the connection is not established then it will retry
        except requests.ConnectionError:
            pass
        print("No internet connection. Retrying in 5 seconds...")
        pygame.mixer.music.load(error_sound_file)
        pygame.mixer.music.play()
        sleep(2)
 # the main loop that will run until the user break it with a keyboard command
def read_nfc_data():
    while True:
        print("Hold a tag near the reader")
        id, text = reader.read()

        strId = str(id)
        #prints the id in the console
        print("ID: %s\nText: %s" % (id, text))
        #gets the data from the tag
        nfc = {'id': strId, 'text': text}
        # sends the request to the server that runs the web app
        res = requests.post('https://rguappsign.azurewebsites.net/read', json=nfc)
        print(res)
        # checks if the responce is successful
        if res.ok:
            pygame.mixer.music.load(success_sound_file)
            pygame.mixer.music.play()
        else:
            pygame.mixer.music.load(error_sound_file)
            pygame.mixer.music.play()

        sleep(5)

try:
    # calling the functions
    establish_internet_connection()
    read_nfc_data()

except KeyboardInterrupt:
    GPIO.cleanup()
    raise
