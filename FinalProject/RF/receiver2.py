"""
# receiver.py

Created by:  Matt Kaufman
Date:        April 21, 2023

Code for the receiver (RX480E-4) of the 433MHz RF transmitter/receiver pair.
Continuously checks for an incoming signal from the transmitter (TX118SA-4),
and makes the distinction between channels that the incoming signal was received on.
"""

import RPi.GPIO as GPIO
from datetime import datetime
import matplotlib.pyplot as plt
from time import sleep, perf_counter



def Print(string: str) -> None:
    """
    Prints the string with the current time.

    # Parameters
        `string`: The string to be printed
    """
    print(f"[{datetime.now().strftime('%H:%M:%S')}] >> {string}")

    

# Define pins
NORTH_PIN  = 23     # (GPIO 23)
SOUTH_PIN  = 24     # (GPIO 24)
EAST_PIN   = 25     # (GPIO 25)
WEST_PIN   = 12     # (GPIO 12)
COMMON_PIN = 16     # (GPIO 16)


# Set up the GPIO pins
GPIO.setmode(GPIO.BCM)
GPIO.setup(NORTH_PIN,  GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(SOUTH_PIN,  GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(EAST_PIN,   GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(WEST_PIN,   GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(COMMON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)



def rx_callback(channel: int) -> None:
    """
    Callback function for the North, South, East, and West pins.
    Prints the channel that the signal was received on.

    # Parameters
        `channel`: The channel that the signal was received on
    """
    if channel == NORTH_PIN:
        if GPIO.input(NORTH_PIN):
            Print("North HIGH")
#         else:
#             Print("North LOW")
    
    elif channel == SOUTH_PIN:
        if GPIO.input(SOUTH_PIN):
            Print("South HIGH")
#         else:
#             Print("South LOW")
    
    elif channel == EAST_PIN:
        if GPIO.input(EAST_PIN):
            Print("East HIGH")
#         else:
#             Print("East LOW")

    elif channel == WEST_PIN:
        if GPIO.input(WEST_PIN):
            Print("West HIGH")
#         else:
#             Print("West LOW")

#     elif channel == COMMON_PIN:
#         if GPIO.input(COMMON_PIN):
#             Print("Common HIGH")
# #         else:
# #             Print("Common LOW")

    else:
        Print("ERROR: Invalid channel")

        
        
# Add an event listener to the pins, where bouncetime is the de-bounce time in ms,
# i.e. the callback will only be called after the pin has been at the same level for that amount of time
GPIO.add_event_detect(NORTH_PIN,  GPIO.BOTH, callback=rx_callback, bouncetime=20)
GPIO.add_event_detect(SOUTH_PIN,  GPIO.BOTH, callback=rx_callback, bouncetime=20)
GPIO.add_event_detect(EAST_PIN,   GPIO.BOTH, callback=rx_callback, bouncetime=20)
GPIO.add_event_detect(WEST_PIN,   GPIO.BOTH, callback=rx_callback, bouncetime=20)
GPIO.add_event_detect(COMMON_PIN, GPIO.BOTH, callback=rx_callback, bouncetime=20)



# Loop and wait for keyboard interrupt
try:
    while True:
        sleep(0.01)

except KeyboardInterrupt:
    Print("Exiting...")
    GPIO.cleanup()      # Clean up the GPIO pins
    exit()              # Exit the program
