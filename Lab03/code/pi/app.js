/********************
*
*   app.js
*   Pi-side code for the bidirectional Pi-Arduino Bluetooth link.
*
*   Communicates with the Arduino peripheral device over Bluetooth Low Energy (BLE) using the UART service.
*
*   The script connects to the Arduino device by its address, 
*   discovers the UART service and its characteristics, and establishes a two-way communication channel.
*   The user can input text in the console, which is sent to the Arduino. When data is received from the Arduino, it is printed to the console.
*
*
*   Lab requirements (building off of Lab02):
*       1. Add the ability to harvest the temperature data from the Arduino via Bluetooth LE.
*       2. Add the ability to control the interval at which the temperature and humidity data are harvested.
*          In other words, be able to modify the value of the `Interval` key in the database (valid values are 1-10 *seconds*).
*          The `Interval` value will control the sampling rate of the simulated environmental sensor service on the Arduino and the humidity sensor on the Pi.
*       3. Modify the example Arduino sketch so that it can vary the sampling interval in the valid range of 1-10 seconds.
*       4. Upon the value of `Interval` changing in the Firebase database, the updated value should be pushed
*          to the Node app on the Pi and then be sent wirelessly to the Arduino **using the Bluetooth LE Nordic UART service**.
*       5. The JavaScript/Node app on the Pi should also change the sampling interval of the humidity to match the new value of the `Invertal` entry.
*          This means that the Arduino sketch (and JavaScript/Node app) will need to use both the Bluetooth LE Nordic UART and Environmental Sensing service profiles.
*
*   Specific requirements of the JavaScript/Node app:
*       1. Must be able to update the sense-hat’s light array like in Lab 2.
*       2. Add the value `Interval` to the Firebase database (valid values are 1-10 *seconds*).
*       3. Set up the app to receive a callback whenever the value of `Interval` changes in the Firebase database.
*          This callback should be specifically on the `Interval` entry, ** not on the root of the database **.
*          The callback function should forward the new `Interval` value to the Arduino using the Bluetooth LE Nordic UART service profile.
*          It should also change the sampling rate of the humidity readings to reflect the new `Interval` value.
*          The humidity should be read and pushed to Firebase at the rate specified by the new `Interval` value.
*          The app should print a message when the `Interval` value changes.
*       4. Must send the updated Temperature value to Firebase whenever it is received from
*          the Arduino via the Temperature characteristic of the Environmental Sensing service.
*       5. Messages that the app should print (at a minimum):
*              a) The temperature whenever it receives it from the Arduino.
*              b) The humidity after every reading at rate specified by `Interval`.
*              c) The new value of `Interval` whenever it changes on Firebase.
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

var nodeimu = require( '@trbll/nodeimu' );
var sense = require( '@trbll/sense-hat-led' );

var IMU = new nodeimu.IMU();

var firebase = require( 'firebase/app' );
const { getDatabase, ref, onValue, set, update, get } = require( 'firebase/database' );

const firebaseConfig = {
    apiKey: "AIzaSyAnF3DRcYYXgiy5Kt9ZFl9N7goOd9U3dj0",
    authDomain: "iotgroup15b-lab03.firebaseapp.com",
    projectId: "iotgroup15b-lab03",
    storageBucket: "iotgroup15b-lab03.appspot.com",
    messagingSenderId: "107385041601",
    appId: "1:107385041601:web:d7cbe213d15b6725951a40"
};
firebase.initializeApp( firebaseConfig );

const database = getDatabase();


const { createBluetooth } = require( 'node-ble' );
const ARDUINO_BLUETOOTH_ADDR = '64:AB:DF:6A:07:14';   // TODO: Replace with address obtained from 'scan on' command in bluetoothctl

const UART_SERVICE_UUID      = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
const TX_CHARACTERISTIC_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
const RX_CHARACTERISTIC_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';



async function main()
{
    // Reference the BLE adapter and begin device discovery...
    const { bluetooth, destroy } = createBluetooth();
    const adapter = await bluetooth.defaultAdapter();
    const discovery = await adapter.startDiscovery();
    console.log( 'discovering...' );
    
    // Attempt to connect to the device with specified BT address
    const device = await adapter.waitDevice( ARDUINO_BLUETOOTH_ADDR.toUpperCase() );
    console.log( 'found device. attempting connection...' );
    await device.connect();
    console.log( 'connected to device!' );
    
    // Get references to the desired UART service and its characteristics
    const gattServer = await device.gatt();
    const uartService = await gattServer.getPrimaryService( UART_SERVICE_UUID.toLowerCase() );
    const txChar = await uartService.getCharacteristic( TX_CHARACTERISTIC_UUID.toLowerCase() );
    const rxChar = await uartService.getCharacteristic( RX_CHARACTERISTIC_UUID.toLowerCase() );
    
    // Register for notifications on the RX characteristic
    await rxChar.startNotifications();
    
    // Callback for when data is received on RX characteristic
    rxChar.on('valuechanged', buffer => {
        console.log( 'Received: ' + buffer.toString() );
    });
    
    // Set up a listener for console input.
    // When console input is received, write it to TX characteristic
    const stdin = process.openStdin();
    stdin.addListener('data', async function( d )
    {
        let inStr = d.toString().trim();
        
        // Disconnect and exit if user types 'exit'
        if ( inStr === 'exit' )
        {
            console.log( 'disconnecting...' );
            await device.disconnect();
            console.log( 'disconnected.' );
            destroy();
            process.exit();
        }
        
        // Specification limits packets to 20 bytes; truncate string if too long.
        inStr = (inStr.length > 20) ? inStr.slice(0,20) : inStr;
        
        // Attempt to write/send value to TX characteristic
        await txChar.writeValue( Buffer.from(inStr) ).then(() => {
            console.log( 'Sent: ' + inStr );
        });
    });
}



main().then((ret) => {
    if (ret) console.log( ret );
}).catch((err) => {
    if (err) console.error( err );
});

