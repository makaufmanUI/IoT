# UART Example

Unmodified code from the "1_UART-Example.zip" example provided on ICON (minus some formatting changes).

To run, should only need to modify line #11 in `pi/app.js`: replace the Bluetooth address to the address of the Arduino being used, as determined from the `hciconfig` > `sudo bluetoothctl` > `scan on` series of terminal commands on the Raspberry Pi.
