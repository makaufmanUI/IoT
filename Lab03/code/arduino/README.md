# Requirements for the Arduino sketch

1. Read the temperature from the HTS221 sensor used in Lab 1 and transmit it to the Pi via the **Temperature characteristic of the Environmental Sensing service** at the Interval specified by the Pi. **DO NOT use the UART service to transmit temperature data.**

2. Receive the sampling interval from the Pi via the Bluetooth LE **Nordic UART service** profile and change the sampling interval of the temperature sensor accordingly.

3. Print the following messages to the serial monitor (at a minimum):

    a) The temperature after every Interval’s reading.
  
    b) The new Interval every time it is received from the Pi. This message should be printed within one second of the Pi sending the new interval.
