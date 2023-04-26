"""
# receiver.py

Created by:  Matt Kaufman
Date:        April 26, 2023

Code for the receiver (RX480E-4) of the 433MHz RF transmitter/receiver pair.
Continuously checks for an incoming signal from the transmitter (TX118SA-4),
and makes the distinction between channels that the incoming signal was received on.
"""

from states import *
from time import sleep
import RPi.GPIO as GPIO



def Print(string: str) -> None:
    """
    Prints the string with the current time.

    # Parameters
        `string`: The string to be printed
    """
    print(f"[{datetime.now().strftime('%H:%M:%S')}] >> {string}")

    

# Define pins
NORTH_PIN  = 23     # (GPIO 23) [Green]
SOUTH_PIN  = 24     # (GPIO 24) [Blue]
EAST_PIN   = 25     # (GPIO 25) [White]
WEST_PIN   = 12     # (GPIO 12) [Yellow]
COMMON_PIN = 16     # (GPIO 16) [Striped Green]


# Set up the GPIO pins
GPIO.setmode(GPIO.BCM)
GPIO.setup(NORTH_PIN,  GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(SOUTH_PIN,  GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(EAST_PIN,   GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(WEST_PIN,   GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(COMMON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)


# Initialize States object
states = States(0, 0, 0, 0)


def rx_callback(channel: int) -> None:
    """
    Callback function for the North, South, East, and West pins.
    Prints the channel that the signal was received on.

    ## Parameters
        `channel` : The channel that the signal was received on
    """
    pin = {NORTH_PIN: "North", SOUTH_PIN: "South", EAST_PIN: "East", WEST_PIN: "West", COMMON_PIN: "Common"}[channel]
    if pin != "Common":
        Print(f"{pin} HIGH") if GPIO.input(channel) else Print(f"{pin} LOW")
    
    if pin == "North":
        states.north = GPIO.input(channel)
    elif pin == "South":
        states.south = GPIO.input(channel)
    elif pin == "West":
        states.west = GPIO.input(channel)
    elif pin == "East":
        states.east = GPIO.input(channel)
    elif pin == "Common":
        pass

        

        
# Loop and wait for keyboard interrupt
try:
    Print("Starting...")
    for pin in [NORTH_PIN,SOUTH_PIN,EAST_PIN,WEST_PIN,COMMON_PIN]:
        GPIO.add_event_detect(pin, GPIO.BOTH, callback=rx_callback, bouncetime=20)
    while True:
        states.extend_history()
        sleep(0.05)
        
except KeyboardInterrupt:
    Print("Exiting...")
    GPIO.cleanup()      # Clean up the GPIO pins
    
    # Plot the state history
    # states.plot_history()
    states.subplot_history()
    
    exit()
