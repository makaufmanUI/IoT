# Lab02
Using a Firebase Realtime Database, the `nodeimu` and `sense-hat-led` libraries, and the Raspberry Pi Sense HAT:
  1. Get temperature and humidity data from the Sense HAT
  2. Push this data to a Firebase database along with a light to change on the Sense HAT's LED matrix, composed of the following:
      - Light's row (valid values 0-7)
      - Light's column (valid values 0-7)
      - New light color's R,G,B values (valid values 0-255)
      - Boolean value indicating whether the light should be updated
  3. Update the Sense HAT's LED matrix according to the boolean value

Firebase Project Overview: https://console.firebase.google.com/u/9/project/iotgroup15b-lab02/overview

Firebase Realtime Database: https://console.firebase.google.com/u/9/project/iotgroup15b-lab02/database

# Useful Links
`nodeimu` repo: https://github.com/rupnikj/nodeimu

`nodeimu` readme: https://www.npmjs.com/package/@trbll/nodeimu

`sense-hat-led` repo: https://github.com/aonghusonia/sense-hat-led

`sense-hat-led` readme: https://www.npmjs.com/package/@trbll/sense-hat-led

Firebase reading and writing: https://firebase.google.com/docs/database/web/read-and-write
