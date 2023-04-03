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





// Callback to run every 5 seconds
setInterval(function() {
    var tempHumidity = GetTempHumidity();
    PushTempHumidity(tempHumidity[0], tempHumidity[1]);
    console.log("> New data pushed to database...");
    console.log("  Humidity: "    + tempHumidity[1]);
    console.log("  Temperature: " + tempHumidity[0]);
}, 5000);



// Callback to run on "update_light" change
onValue(ref(database, 'update_light'), (snapshot) => 
{
    // Get data from the database
    const data = snapshot.val();
    
    if ( data )
    {
        // Update the appropriate light with the appropriate color
        SetPixelColor( data.light_row, data.light_col, data.light_r, data.light_g, data.light_b );
        
        // Set "update_light" to false
        update( ref(database,'update_light'), false );
        
        // Check that the pixel color has been set correctly
        var newColor = GetPixelColor( data.light_row, data.light_col );
        console.log( "> Light has been updated..." );
        console.log( "  Row: " + data.light_row );
        console.log( "  Column: " + data.light_col );
        console.log( "  Color: (" + newColor.r + ", " + newColor.g + ", " + newColor.b + ")" );
    }
});










/**
* Takes a reading from the Sense HAT's IMU and returns the temperature and humidity.
* @returns {number[]} - An array containing the temperature and humidity, or `[0, 0]` if there was an error.
*/
function GetTempHumidity() {
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
function GetPixelColor(pixelRow, pixelColumn) {
    var color = sense.getPixel(pixelRow, pixelColumn);
    return color;
}





/**
* Takes a row and column number and sets the color of the pixel at that location. Sync version.
* @param {number} pixelRow - The row number of the pixel (0-7), where 0 is on the top, and 7 is on the bottom
* @param {number} pixelColumn - The column number of the pixel (0-7), where 0 is on the left, and 7 is on the right
* @param {number} red - The red value of the pixel (0-255)
* @param {number} green - The green value of the pixel (0-255)
* @param {number} blue - The blue value of the pixel (0-255)
*/
function SetPixelColor(pixelRow, pixelColumn, red, green, blue) {
    sense.setPixel(pixelRow, pixelColumn, red, green, blue);
}
