# Lab03
Gaining experience using Bluetooth Low Energy (BLE) with the Arduino and Raspberry Pi, using the `ArduinoBLE` and `node-ble` libraries.

<br>

## Lab requirements (building off of Lab02):

1. Add the ability to harvest the temperature data from the Arduino via Bluetooth LE. 

2. Add the ability to control the interval at which the temperature and humidity data are harvested. In other words, be able to modify the value of the `Interval` key in the database (valid values are 1-10 **seconds**). The `Interval` value will control the sampling rate of the simulated environmental sensor service on the Arduino and the humidity sensor on the Pi. 

3. Modify the example Arduino sketch so that it can vary the sampling interval in the valid range of 1-10 seconds.

4. Upon the value of `Interval` changing in the Firebase database, the updated value should be pushed to the Node app on the Pi and then be sent wirelessly to the Arduino **using the Bluetooth LE Nordic UART service**.

5. The JavaScript/Node app on the Pi should also change the sampling interval of the humidity to match the new value of the `Invertal` entry. This means that the Arduino sketch (and JavaScript/Node app) will **need to use both the Bluetooth LE Nordic UART and Environmental Sensing service profiles**.

<br>

# Useful Links
`nodeimu` repo: https://github.com/rupnikj/nodeimu

`node-ble` repo: https://github.com/chrvadala/node-ble

`sense-hat-led` repo: https://github.com/aonghusonia/sense-hat-led

`ArduinoBLE` reference: https://www.arduino.cc/reference/en/libraries/arduinoble/

Firebase reading and writing: https://firebase.google.com/docs/database/web/read-and-write
