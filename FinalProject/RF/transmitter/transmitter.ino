/*
 *  transmitter.ino
 *
 *  Created by:  Matt Kaufman
 *  Date:        April 26, 2023
 *
 *  Code for the transmitter (TX118SA-4) of the 433MHz RF transmitter/receiver pair.
 *  Cyclically emits a 433MHz signal on the K1-K4 pins by pulling them LOW (nominally +VCC).
*/

#include <Arduino.h>


// Pin definitions
#define NORTH 2    // Yellow
#define SOUTH 4    // Purple (White on perfboard)
#define EAST  8    // Green
#define WEST  7    // Blue


// Global variables
unsigned int  iteration = 1;            // Iteration counter
unsigned int  currentPin = NORTH;       // Variable used to cycle through the pins
unsigned long lastTransmit  = 0;        // Time of last transmission, in milliseconds
unsigned long transmitDuration = 250;   // Duration of each transmission, in milliseconds
unsigned long transmitInterval = 1000;  // Interval between transmissions, in milliseconds


// Function prototypes
void print(String str);
void println(String str);
void end_transmission(unsigned int pin);
void start_transmission(unsigned int pin);




void setup()
{
    Serial.begin(9600);
    println("Transmitter started.");

    // Set pins as outputs
    pinMode(NORTH, OUTPUT);
    pinMode(SOUTH, OUTPUT);
    pinMode(EAST,  OUTPUT);
    pinMode(WEST,  OUTPUT);
    pinMode(LED_BUILTIN, OUTPUT);

    // Set pin initial states (LOW)
    digitalWrite(NORTH, LOW);
    digitalWrite(SOUTH, LOW);
    digitalWrite(EAST,  LOW);
    digitalWrite(WEST,  LOW);
    digitalWrite(LED_BUILTIN, LOW);
}




void loop()
{
    
    // If the interval between transmissions has elapsed
    if (millis() - lastTransmit >= transmitInterval)
    {
        lastTransmit = millis();    // Update lastTransmit

        iteration++;                // Increment iteration counter
        if (iteration > 4)
        {
            iteration = 1;          // Reset iteration counter if it exceeds 4
        }

        // Set the current pin depending on the iteration
        switch (iteration)
        {
            case 1:
                currentPin = NORTH;
                break;
            case 2:
                currentPin = SOUTH;
                break;
            case 3:
                currentPin = EAST;
                break;
            case 4:
                currentPin = WEST;
                break;
        }

        // Transmit on the current pin if it is not already
        if (digitalRead(currentPin) == LOW)
        {
            start_transmission(currentPin);
        }
    }

    
    // End transmission on the current pin if it is currently transmitting
    if (digitalRead(currentPin) == HIGH)
    {
        end_transmission(currentPin);
    }
    
}





/**
* Prints a string to the serial monitor, prefaced with the current time since program start.
*    @param str - The string to be printed
**/
void print(String str)
{
    Serial.print("[");
    Serial.print(millis()/1000.);
    Serial.print("s]  >> ");
    Serial.print(str);
}



/**
* Prints a string to the serial monitor, prefaced with the current time since program start, followed by a newline.
*    @param str - The string to be printed
**/
void println(String str)
{
    Serial.print("[");
    Serial.print(millis()/1000.);
    Serial.print("s]  >> ");
    Serial.println(str);
}



/**
* Ends the transmission of a signal on a pin.
*    @param pin - The pin which is currently transmitting the signal
**/
void end_transmission(unsigned int pin)
{
    digitalWrite(pin, LOW);
    digitalWrite(LED_BUILTIN, LOW);
}



/**
* Begins the transmission of a signal on a pin.
*    @param pin - The pin with which to transmit the signal
**/
void start_transmission(unsigned int pin)
{
    digitalWrite(pin, HIGH);
    digitalWrite(LED_BUILTIN, HIGH);
    unsigned long start = millis();
    while (millis()-start < transmitDuration) { };
}
