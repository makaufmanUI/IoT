/********************
*
*   arduino.ino
*   Arduino-side code for the bidirectional Pi-Arduino Bluetooth link.
*
*   Uses the ArduinoBLE library to simulate a UART connection using the Nordic UART service profile.
*   More: https://learn.adafruit.com/introducing-adafruit-ble-bluetooth-low-energy-friend/uart-service
*
*   Definition of terms:
*       Central device  -   A device that initiates the connection and controls the data exchange with the peripheral device.
*                           It scans for nearby peripherals, connects to them, and can read or write data to their characteristics.
*                           The central device can manage multiple connections with different peripheral devices simultaneously.
*
*       Peripheral device - A (usually) low-power, resource-constrained devicelike a sensor, an IoT device,
*                           or a microcontroller (e.g., Arduino) that advertises its presence and services to nearby central devices.
*                           It provides data or accepts commands from the central device through the use of services and characteristics.
*                           In a BLE connection, the peripheral device can only be connected to one central device at a time.
*                           
*   For the purposes of this lab, the Arduino board acts as a peripheral device, advertising a UART service over BLE,
*   and the Raspberry Pi acts as a central device, allowing the exchange of data between the two using the defined characteristics of the UART service.
*
*
*   Specific requirements of the Arduino sketch:
*       1. Read the temperature from the HTS221 sensor used in Lab 1 and transmit it to the Pi via
*          the Temperature characteristic of the Environmental Sensing service at the Interval specified by the Pi.
*          DO NOT use the UART service to transmit temperature data.
*       2. Receive the sampling interval from the Pi via the Bluetooth LE Nordic UART
*          service profile and change the sampling interval of the temperature sensor accordingly.
*       3. Print the following messages to the serial monitor (at a minimum):
*              a) The temperature after every Interval’s reading.
*              b) The new Interval every time it is received from the Pi.
*                 This message should be printed within one second of the Pi sending the new interval.
*
*********************/


#include <ArduinoBLE.h>
#include "TimeoutTimer.h"
#define BUFSIZE 20


// Declare BLE service and characteristics for UART communication
BLEService uartService("6E400001-B5A3-F393-E0A9-E50E24DCCA9E");
BLEStringCharacteristic txChar("6E400002-B5A3-F393-E0A9-E50E24DCCA9E", BLEWrite, 20);
BLEStringCharacteristic rxChar("6E400003-B5A3-F393-E0A9-E50E24DCCA9E", BLERead | BLENotify, 20);



void setup()
{
    // Initialize Serial communication
    Serial.begin(9600);
    while (!Serial) { }
    
    // Initialize the BLE module
    if ( !BLE.begin() )
    {
        Serial.println("Starting BLE failed!");
        while(1);
    }
    
    // Get the Arduino's BT address
    String deviceAddress = BLE.address();
    
    // Set the device name to advertise with
    BLE.setLocalName("ArduinoBLE UART");
    
    // Set up the UART service and its characteristics
    BLE.setAdvertisedService( uartService );
    uartService.addCharacteristic( txChar );
    uartService.addCharacteristic( rxChar );
    BLE.addService( uartService );
    
    // Start advertising the new service
    BLE.advertise();
    Serial.println("Bluetooth device (" + deviceAddress + ") active, waiting for connections...");
}



void loop()
{
    // Wait for a BLE central device to connect
    BLEDevice central = BLE.central();
    
    // If a central device is connected to the peripheral...
    if ( central )
    {
        // Print the central device's BT address
        Serial.print("Connected to central: ");
        Serial.println( central.address() );
        
        // While the central device is connected...
        while ( central.connected() )
        {
            // Get input from the user (via Serial Monitor) and send it to the central device
            char inputs[BUFSIZE+1];
            if ( getUserInput( inputs, BUFSIZE ) )
            {
                Serial.print("[Send] ");
                Serial.println( inputs );
                rxChar.writeValue( inputs );
            }
            // Receive data from the central device (if written is true) and print it to the Serial Monitor
            if ( txChar.written() )
            {
                Serial.print("[Recv] ");
                Serial.println( txChar.value() );
            }
        }
        
        // Print the central device's BT address upon disconnect
        Serial.print("Disconnected from central: ");
        Serial.println( central.address() );
    }
}





/**************************************************************************/
/*!
    @brief  Checks for user input (via the Serial Monitor)
        From: https://github.com/adafruit/Adafruit_BluefruitLE_nRF51
*/
/**************************************************************************/
bool getUserInput(char buffer[], uint8_t maxSize)
{
    // Create a TimeoutTimer object with a 100 millisecond timeout
    TimeoutTimer timeout(100);
    
    // Clear the buffer
    memset(buffer, 0, maxSize);
    
    // Wait for Serial data or until the timeout expires
    while ( (!Serial.available()) && !timeout.expired() ) { delay(1); }
    
    // If the timeout expired, return false (no data received)
    if ( timeout.expired() ) return false;
    
    // Wait for a short delay to allow the Serial buffer to fill up
    delay(2);
    
    // Read data from the Serial buffer into 'buffer' until maxSize is reached or no more data is available
    uint8_t count = 0;
    do {
        count += Serial.readBytes(buffer+count, maxSize);
        delay(2);
    }   while ( (count < maxSize) && (Serial.available()) );
    
    // If data has been read into 'buffer', return true
    return true;
}

