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



























/**
* Takes a reading from the Sense HAT's IMU and returns the temperature and humidity. Sync version.
* @returns {number[]} - An array containing the temperature and humidity, or `[0, 0]` if there was an error.
*/
function GetTempHumidity_Sync() {
    var data = IMU.getValueSync();
    var str = "[" + data.timestamp.toISOString() + "] ";
    if (data.temperature && data.pressure && data.humidity) {
        str += "Temperature: " + data.temperature.toFixed(4) + "C, Humidity: " + data.humidity.toFixed(4) + "%";
        console.log(str);
        return [data.temperature, data.humidity];
    } else {
        str += "Error getting temperature and humidity data";
        console.log(str);
        return [0, 0];
    }
}





/**
* Takes a reading from the Sense HAT's IMU and returns the temperature and humidity. Async version.
* @returns {number[]} - An array containing the temperature and humidity, or `[0, 0]` if there was an error.
*/
function GetTempHumidity_Async() {
    IMU.getValue((err, data) => {
        if (err) throw err;
        var str = "[" + data.timestamp.toISOString() + "] ";
        if (data.temperature && data.pressure && data.humidity) {
            str += "Temperature: " + data.temperature.toFixed(4) + "C, Humidity: " + data.humidity.toFixed(4) + "%";
            console.log(str);
            return [data.temperature, data.humidity];
        } else {
            str += "Error getting temperature and humidity data";
            console.log(str);
            return [0, 0];
        }
    });
}





/**
* Takes temperature and humidity values and pushes them to the Firebase database.
* @param {number} temperature - The temperature value to push to the database
* @param {number} humidity - The humidity value to push to the database
*/
function PushTempHumidity(temperature, humidity) {
    set(ref(database, 'temperature'), temperature);
    set(ref(database, 'humidity'), humidity);
}










/**
* Takes a row and column number and returns the color of the pixel at that location. Sync version.
* @param {number} pixelRow - The row number of the pixel (0-7), where 0 is on the top, and 7 is on the bottom
* @param {number} pixelColumn - The column number of the pixel (0-7), where 0 is on the left, and 7 is on the right
*/
function GetPixelColor_Sync(pixelRow, pixelColumn) {
    var color = sense.getPixel(pixelRow, pixelColumn);
    return color;
}





/**
* Takes a row and column number and returns the color of the pixel at that location. Async version.
* @param {number} pixelRow - The row number of the pixel (0-7), where 0 is on the top, and 7 is on the bottom
* @param {number} pixelColumn - The column number of the pixel (0-7), where 0 is on the left, and 7 is on the right
*/
function GetPixelColor_Async(pixelRow, pixelColumn) {
    sense.getPixel(pixelRow, pixelColumn, (err, color) => {
        if (err) throw err;
        return color;
    });
    // return new Promise((resolve, reject) => {
    //     var color = sense.getPixel(pixelRow, pixelColumn);
    //     resolve(color);
    // });
}





/**
* Takes a row and column number and sets the color of the pixel at that location. Sync version.
* @param {number} pixelRow - The row number of the pixel (0-7), where 0 is on the top, and 7 is on the bottom
* @param {number} pixelColumn - The column number of the pixel (0-7), where 0 is on the left, and 7 is on the right
* @param {number} red - The red value of the pixel (0-255)
* @param {number} green - The green value of the pixel (0-255)
* @param {number} blue - The blue value of the pixel (0-255)
*/
function SetPixelColor_Sync(pixelRow, pixelColumn, red, green, blue) {
    sense.setPixel(pixelRow, pixelColumn, red, green, blue);
}





/**
* Takes a row and column number and sets the color of the pixel at that location. Async version.
* @param {number} pixelRow - The row number of the pixel (0-7), where 0 is on the top, and 7 is on the bottom
* @param {number} pixelColumn - The column number of the pixel (0-7), where 0 is on the left, and 7 is on the right
* @param {number} red - The red value of the pixel (0-255)
* @param {number} green - The green value of the pixel (0-255)
* @param {number} blue - The blue value of the pixel (0-255)
*/
function SetPixelColor_Async(pixelRow, pixelColumn, red, green, blue) {
    sense.setPixel(pixelRow, pixelColumn, [red, green, blue], (err) => {
        if (err) throw err;
        sense.getPixel(pixelRow, pixelColumn, (err, color) => {
            if (err) throw err;
            console.log(color);
        })
    });
}





/**
* Checks the Firebase database for a light to update on the Sense HAT's LED matrix.
* @returns {boolean} - `true` if there is a light to update, `false` if there is not.
*/
function LightNeedsUpdated() {
    var light = false;
    // Check what the value of the `update_light` boolean is in the database
    onValue(ref(database, 'update_light'), (snapshot) => {
        light = snapshot.val();
    });
    return light;
}





/**
* Updates the Sense HAT's LED matrix if there is a light to update.
* @returns {boolean} - `true` if a light was updated, `false` if there was no light to update.
*/
function UpdateLight() {
    if (LightNeedsUpdated()) {
        // Get the light data from the database
        var row = 0;
        var column = 0;
        var r, g, b = 0;
        // Check what the values of the `light_row`, `light_col`, `light_r`, `light_g`, and `light_b` values are in the database
        onValue(ref(database, 'light_row'), (snapshot) => {
            row = snapshot.val();
        });
        onValue(ref(database, 'light_col'), (snapshot) => {
            column = snapshot.val();
        });
        onValue(ref(database, 'light_r'), (snapshot) => {
            r = snapshot.val();
        });
        onValue(ref(database, 'light_g'), (snapshot) => {
            g = snapshot.val();
        });
        onValue(ref(database, 'light_b'), (snapshot) => {
            b = snapshot.val();
        });
        // Update the Sense HAT's LED matrix
        sense.clear();
        SetPixelColor_Sync(row, column, r, g, b);
        // Update the `update_light` boolean in the database to `false`
        update(ref(database, 'update_light'), false);
        return true;
    } else {
        return false;
    }
}































// // Function to get the light data from the Firebase database
// function GetLight() {
//     get(ref(database, 'light')).then((snapshot) => {
//         if (snapshot.exists()) {
//             console.log(snapshot.val());
//             var light = snapshot.val();
//             var row = light.row;
//             var col = light.col;
//             var r = light.r;
//             var g = light.g;
//             var b = light.b;
//             var update = light.update;
//             if (update) {
//                 sense.clear();
//                 sense.setPixel(row, col, r, g, b);
//                 update(ref(database, 'light/update'), false);
//             }
//         } else {
//             console.log("No data available");
//         }
//     }).catch((error) => {
//         console.error(error);
//     });
// }

// // Function to update the Sense HAT's LED matrix
// function UpdateLight() {
//     GetLight();
// }
