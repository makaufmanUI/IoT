/*******************************************************************************
*
*   IoT Lab 02
*   03/12/2023
*
*   Group 15B
*   Matt Kaufman, Mark Brom
*   
*   Using a Firebase Realtime Database,
*   the `nodeimu` and `sense-hat-led` libraries,
*   and the Raspberry Pi Sense HAT, this program does the following:
*
*   1. Get temperature and humidity data from the Sense HAT
*   2. Pushes this data to the Firebase database along with a light
*      to change on the Sense HAT's LED matrix, composed of the following:
*      - Light's row (0-7)
*      - Light's column (0-7)
*      - Light's new R,G,B color values (0-255)
*      - Boolean value indicating the need to update
*   3. Updates the Sense HAT's LED matrix according to the boolean value
*
********************************************************************************/

var firebase = require("firebase/app");
var nodeimu = require("@trbll/nodeimu");
var IMU = new nodeimu.IMU();
var sense = require("@trbll/sense-hat-led");
const { getDatabase, ref, onValue, set, update, get } = require("firebase/database");

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};
firebase.initializeApp(firebaseConfig);

const database = getDatabase();
