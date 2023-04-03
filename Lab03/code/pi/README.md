# Requirements for the Pi code / Node app

1. Must be able to update the sense-hat’s light array like in Lab 2.

2. ~~Add the value `Interval` to the Firebase database (valid values are 1-10 **seconds**).~~

3. Set up the app to receive a callback whenever the value of `Interval` changes in the Firebase database. This callback should be specifically on the `Interval` entry, **not on the root of the database**. The callback function should **forward the new `Interval` value to the Arduino using the Bluetooth LE Nordic UART service profile**. It should also change the sampling rate of the humidity readings to reflect the new `Interval` value. The humidity should be read and pushed to Firebase at the rate specified by the new `Interval` value. The app should print a message when the `Interval` value changes.

4. Must send the updated Temperature value to Firebase whenever it is received from the Arduino via the **Temperature characteristic** of the **Environmental Sensing service**.

5. Messages that the app should print (at a minimum):

    a) The temperature whenever it receives it from the Arduino.
  
    b) The humidity after every reading at rate specified by `Interval`.
  
    c) The new value of `Interval` whenever it changes on Firebase.
