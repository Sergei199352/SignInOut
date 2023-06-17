from time import sleep
import sys
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
import requests
reader = SimpleMFRC522()

try:
    while True:
        print("Hold a tag near the reader")
        id, text = reader.read()
        print("ID: %s\nText: %s" % (id,text))
        nfc = {'id':id,
                'text':text}
        res = requests.post('https://rguappsign.azurewebsites.net/nread', json=nfc)
         
        sleep(5)
except KeyboardInterrupt:
    GPIO.cleanup()
    raise



