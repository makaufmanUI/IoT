/*
 *  transmitter.ino
 *
 *  Created by:  Matt Kaufman
 *  Date:        April 21, 2023
 *
 *  Code for the transmitter (TX118SA-4) of the 433MHz RF transmitter/receiver pair.
 *  Cyclically emits a 433MHz signal on the K1-K4 pins by pulling them LOW (nominally +VCC).
 *  
*/


#include <Arduino.h>


// Pin definitions
#define NORTH  2    // Yellow
#define SOUTH  4    // Purple (White on perfboard)
#define WEST   7    // Blue
#define EAST   8    // Green


// Globals
unsigned int  iteration = 0;
unsigned long lastTransmit = 0;
unsigned long transmitInterval = 1000;



void setup()
{
    // Initialize serial monitor
    Serial.begin(9600);
    println("Transmitter started.");
    
    // Set pins as outputs
    pinMode(NORTH, OUTPUT);
    pinMode(SOUTH, OUTPUT);
    pinMode(WEST,  OUTPUT);
    pinMode(EAST,  OUTPUT);
    
    // Set pin initial states (LOW)
    digitalWrite(NORTH, LOW);
    digitalWrite(SOUTH, LOW);
    digitalWrite(WEST,  LOW);
    digitalWrite(EAST,  LOW);
    
    // Set the built-in LED as an output
    pinMode(LED_BUILTIN, OUTPUT);
    
    // Set the built-in LED initial state (LOW)
    digitalWrite(LED_BUILTIN, LOW);
    
    println("");
}



void loop()
{
    if (millis()-lastTransmit >= transmitInterval)
    {
        lastTransmit = millis();
        
        iteration++;
        if (iteration == 3)
        {
            iteration = 0;
        }
        
        switch (iteration)
        {
            case 0:
                print("Transmitting on NORTH pin... ");
                transmit(NORTH, 100);
                Serial.println("done.");
                break;
            case 1:
                print("Transmitting on SOUTH pin... ");
                transmit(SOUTH, 100);
                Serial.println("done.");
                break;
            case 2:
                print("Transmitting on WEST pin... ");
                transmit(WEST, 100);
                Serial.println("done.");
                break;
            case 3:
                print("Transmitting on EAST pin... ");
                transmit(EAST, 100);
                Serial.println("done.");
                break;
        }
    }
}




/**
* Transmits a signal on the 433MHz wavelength.
*    @param pin - The pin with which to transmit the signal
*    @param duration - The time, in milliseconds, to transmit for
*    @param blink - Boolean value specifying whether or not to blink LED
**/
void transmit(unsigned int pin, unsigned long duration, bool blink = true)
{
    digitalWrite(pin, HIGH);
    if (blink) {
        digitalWrite(LED_BUILTIN, HIGH);
    }
    unsigned long start = millis();
    while (millis()-start < duration) { };
    digitalWrite(pin, LOW);
    if (blink) {
        digitalWrite(LED_BUILTIN, LOW);
    }
}



/**
* Toggles the state of a pin (i.e., sets its state to the opposite of its current state).
*    @param pin - The pin whose state should be toggled
*    @param toggleLED - Boolean value indicating whether or not to match `pin`'s state with the LED
**/
void toggle(unsigned int pin, bool toggleLED = true)
{
    digitalWrite(pin, !digitalRead(pin));
    if (toggleLED) {
        if (digitalRead(pin)) {
            digitalWrite(LED_BUILTIN, HIGH);
        } else {
            digitalWrite(LED_BUILTIN, LOW);
        }
    }
}



/**
* Prints a string to the serial monitor, prefaced with the current time since program start.
*    @param str - The string to be printed
**/
String print(String str)
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
String println(String str)
{
    Serial.print("[");
    Serial.print(millis()/1000.);
    Serial.print("s]  >> ");
    Serial.println(str);
}
