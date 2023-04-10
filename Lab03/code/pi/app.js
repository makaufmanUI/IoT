/********************
*
*   app.js
*   Pi-side code for the bidirectional Pi-Arduino Bluetooth link.
*
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
*********************/

var nodeimu = require('@trbll/nodeimu');
var sense = require('@trbll/sense-hat-led');
var IMU = new nodeimu.IMU();
var firebase = require('firebase/app');
const { getDatabase, ref, onValue, set, update, get } = require('firebase/database');

const firebaseConfig = {
    apiKey: "AIzaSyAnF3DRcYYXgiy5Kt9ZFl9N7goOd9U3dj0",
    authDomain: "iotgroup15b-lab03.firebaseapp.com",
    projectId: "iotgroup15b-lab03",
    storageBucket: "iotgroup15b-lab03.appspot.com",
    messagingSenderId: "107385041601",
    appId: "1:107385041601:web:d7cbe213d15b6725951a40"
};
firebase.initializeApp(firebaseConfig);


const database = getDatabase();

const { createBluetooth } = require('node-ble');
const ARDUINO_BLUETOOTH_ADDR = '64:ab:df:6a:07:2c';     // TODO: Replace this with Arduino's BT address


// Define Nordic UART service profile UUIDs
const UART_SERVICE_UUID      = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
const TX_CHARACTERISTIC_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
const RX_CHARACTERISTIC_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';


// Define ESS GATT service profile UUIDs
const EES_SERVICE_UUID         = '0000181a-0000-1000-8000-00805f9b34fb';
const TEMP_CHARACTERISTIC_UUID = '00002a6e-0000-1000-8000-00805f9b34fb';



// Global Interval timer for humidity sensor sampling rate
var firebaseInterval = 10;


// Set interval at which humidity data is read and pushed to database
var setInt = setInterval(GetHumidity, firebaseInterval*1000);





async function main()
{
    // Reference the BLE adapter and begin device discovery
    const { bluetooth, destroy } = createBluetooth();
    const adapter = await bluetooth.defaultAdapter();
    const discovery = await adapter.startDiscovery();
    console.log('>> Discovering...');
    
    // Attempt to connect to the device with specified BT address
    const device = await adapter.waitDevice(ARDUINO_BLUETOOTH_ADDR.toUpperCase());
    console.log('>> Found device. Attempting connection...');
    await device.connect();
    console.log('>> Connected to device!');
    
    // Get references to the desired UART service and its characteristics
    const gattServer = await device.gatt();
    const uartService = await gattServer.getPrimaryService(UART_SERVICE_UUID.toLowerCase());
    const txCharacteristic = await uartService.getCharacteristic(TX_CHARACTERISTIC_UUID.toLowerCase());
    const rxCharacteristic = await uartService.getCharacteristic(RX_CHARACTERISTIC_UUID.toLowerCase());
    
    // Get references to the desired ESS service and its temparature characteristic
    const essService = await gattServer.getPrimaryService(EES_SERVICE_UUID.toLowerCase());
    const tempCharacteristic = await essService.getCharacteristic(TEMP_CHARACTERISTIC_UUID.toLowerCase());
    
    // Register for notifications on the temperature characteristic
    await tempCharacteristic.startNotifications();
    
    // Callback for when data is received on the temp characteristic
    tempCharacteristic.on('valuechanged', buffer => {
        const tempNum = buffer.readUInt16LE() / 100;    // Read in the temperature and divide to restore precision
        console.log('>> Received Temperature: ' + temp.toFixed(2) + ' °C'); 
        set(ref(database, 'temperature'), tempNum)      // Push temperature to database
    });
    
    // Callback for when `Interval` changes in the database
    onValue(ref(database, 'Interval'), (snapshot) => 
    {
        var interval = snapshot.val();
        firebaseInterval = interval;    // Update global sampling rate
        clearInterval(setInt);          // Clear the humidity sampling/updating interval
        setInt = setInterval(GetHumidity, firebaseInterval*1000)    // Set new interval
        let writeVal = "interval : " + interval.toString().trim();
        txCharacteristic.writeValue(Buffer.from(writeVal))  // Send to Arduino via UART
    }
    
    // Set up listener for console input
    // When console input is received, write it to TX characteristic
    const stdin = process.openStdin();
    stdin.addListener('data', async function(d)
    {
        let inStr = d.toString().trim();
        
        // Disconnect and exit if user types 'exit'
        if (inStr === 'exit')
        {
            console.log('>> Disconnecting...');
            await device.disconnect();
            console.log('>> Disconnected.');
            destroy();          // Clean up any BT resources
            process.exit();     // Terminate current Node.js process & return control to shell
        }
        
        // Specification limits packets to 20 bytes; truncate string if too long
        inStr = (inStr.length > 20) ? inStr.slice(0,20) : inStr;
        
        // Attempt to write/send value to TX characteristic
        await txCharacteristic.writeValue( Buffer.from(inStr) ).then(() => {
            console.log('>> Sent: ' + inStr);
        });
    });
}



main().then((ret) => {
    if (ret) console.log( ret );
}).catch((err) => {
    if (err) console.error( err );
});






/**
* Takes a reading from the Sense HAT's IMU and returns the humidity.
* @returns {number} - The current humidity, or `0` if there was an error
*/
function GetHumidity() {
    var data = IMU.getValueSync();
    var str = ">> [" + data.timestamp.toISOString() + "] ";
    if (data.humidity) {
        str += "Humidity: " + data.humidity.toFixed(2) + "%.";
        console.log(str);
        set(ref(database, 'humidity'), data.humidity);  // Push humidity reading to database
        return data.humidity;
    } else {
        str += "Error getting humidity reading.";
        console.log(str);
        return 0.0;
    }
}





/**
* Takes a row and column number and returns the color of the pixel at that location.
* @param {number} pixelRow - The row number of the pixel (0-7), where 0 is on the top, and 7 is on the bottom
* @param {number} pixelColumn - The column number of the pixel (0-7), where 0 is on the left, and 7 is on the right
* @returns {Object} color - An object with attributes `r`, `g`, and `b`, representing the RGB values of the light
*/
function GetPixelColor(pixelRow, pixelColumn) {
    var color = sense.getPixel(pixelRow, pixelColumn);
    return color;
}





/**
* Takes a row and column number and sets the color of the pixel at that location.
* @param {number} pixelRow - The row number of the pixel (0-7), where 0 is on the top, and 7 is on the bottom
* @param {number} pixelColumn - The column number of the pixel (0-7), where 0 is on the left, and 7 is on the right
* @param {number} red - The red value of the pixel (0-255)
* @param {number} green - The green value of the pixel (0-255)
* @param {number} blue - The blue value of the pixel (0-255)
* @returns {void}
*/
function SetPixelColor(pixelRow, pixelColumn, red, green, blue) {
    sense.setPixel(pixelRow, pixelColumn, red, green, blue);
}
