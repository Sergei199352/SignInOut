from time import sleep
import sys
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
import requests

reader = SimpleMFRC522()

def establish_internet_connection():
    while True:
        try:
            response = requests.get('https://www.google.com')
            if response.status_code == 200:
                print("Internet connection established.")
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

        sleep(1)

try:
    establish_internet_connection()
    read_nfc_data()

except KeyboardInterrupt:
    GPIO.cleanup()
    raise
