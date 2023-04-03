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
*********************/


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

