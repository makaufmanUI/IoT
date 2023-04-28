/*
 *  transmitter_esp.ino 
 * 
 *  Created by:  Matt Kaufman
 *  Date:        April 26, 2023
 *
 *  ESP8266 code for the transmitter (TX118SA-4) of the 433MHz RF transmitter/receiver pair.
 *  Cyclically emits a 433MHz signal on the K1-K4 pins by pulling them LOW (nominally +VCC).
*/



// Pin definitions
#define NORTH 4   // Yellow (GPIO4  / D2)
#define SOUTH 5   // White  (GPIO5  / D1)
#define EAST  12  // Green  (GPIO12 / D6)
#define WEST  13  // Blue   (GPIO13 / D7)
#define LED   2   // Built-in LED (GPIO2)

// Global variables
unsigned int  iteration = 1;            // Iteration counter
unsigned int  currentPin = NORTH;       // Variable used to cycle through the pins
unsigned long lastTransmit  = 0;        // Time of last transmission, in milliseconds
unsigned long transmitDuration = 250;   // Duration of each transmission, in milliseconds
unsigned long transmitInterval = 1000;  // Interval between transmissions, in milliseconds

// Function prototypes
void end_transmission(unsigned int pin);
void start_transmission(unsigned int pin);



void setup()
{
    Serial.begin(9600);
    Serial.println(">> Transmitter started.");

    // Set pins as outputs
    pinMode(NORTH, OUTPUT);
    pinMode(SOUTH, OUTPUT);
    pinMode(EAST,  OUTPUT);
    pinMode(WEST,  OUTPUT);
    pinMode(LED, OUTPUT);

    // Set pin initial states (LOW)
    digitalWrite(NORTH, LOW);
    digitalWrite(SOUTH, LOW);
    digitalWrite(EAST,  LOW);
    digitalWrite(WEST,  LOW);
    digitalWrite(LED, LOW);
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
* Ends the transmission of a signal on a pin.
*    @param pin - The pin which is currently transmitting the signal
**/
void end_transmission(unsigned int pin)
{
    digitalWrite(pin, LOW);
    digitalWrite(LED, LOW);
}



/**
* Begins the transmission of a signal on a pin.
*    @param pin - The pin with which to transmit the signal
**/
void start_transmission(unsigned int pin)
{
    digitalWrite(pin, HIGH);
    digitalWrite(LED, HIGH);
    unsigned long start = millis();
    while (millis()-start < transmitDuration) { };
}
