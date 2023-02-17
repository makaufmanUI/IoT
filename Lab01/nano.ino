/********************
*
*    nano.ino
*    
*    Adapted code from:
*        -> ReadSensors.ino (HTS221 example)
*        -> ReadPressure.ino (LPS22HB example)
*
*    Collects one sample every second from the HTS221 and LPS22HB sensors.
*    Displays the most recent samples collected, and the average of the last 10 samples.
*
*********************/

#include <Arduino_HTS221.h>     // HTS221 library
#include <Arduino_LPS22HB.h>    // LPS22HB library




// Initialize counter
int counter = 0;        // Keeps measurement array indexing accurate -- cycles from 0 to 9


// Initialize arrays to store measurements
float humidity_data[10] = {0};
float pressure_data[10] = {0};
float temperature_data[10] = {0};


// Declare averaging function
float GetAverage(float *data, int size);    // Computes the average of 10 measurements





void setup()
{
    // Start serial
    Serial.begin(9600);
    while (!Serial) {};


    // Initialize sensors
    if (!HTS.begin()) {
        Serial.println("Failed to initialize HTS221 sensor!");
        while (1);
    }
    if (!BARO.begin()) {
        Serial.println("Failed to initialize LPS22HB sensor!");
        while (1);
    }
}





void loop()
{
    // Get data from sensors
    float humidity = HTS.readHumidity();
    float pressure = BARO.readPressure(PSI);
    float temperature = HTS.readTemperature();


    // Update arrays
    humidity_data[counter] = humidity;
    pressure_data[counter] = pressure;
    temperature_data[counter] = temperature;


    // Update counter
    counter = (counter + 1) % 10;


    // Compute averages
    float humidity_avg = GetAverage(humidity_data, 10);
    float pressure_avg = GetAverage(pressure_data, 10);
    float temperature_avg = GetAverage(temperature_data, 10);


    // Print data

    Serial.print("Time: ");             // Print time (in seconds)
    Serial.print(millis() / 1000.0);    // Print time in seconds
    Serial.println("s");
    
    Serial.print("  > Humidity: ");     // Print humidity
    Serial.print(humidity);
    Serial.print("%  (avg: ");
    Serial.print(humidity_avg);
    Serial.println("%)");

    Serial.print("  > Pressure: ");     // Print pressure
    Serial.print(pressure);
    Serial.print("psi");
    Serial.print("  (avg: ");
    Serial.print(pressure_avg);
    Serial.println("psi)");

    Serial.print("  > Temperature: ");  // Print temperature
    Serial.print(temperature);
    Serial.print("°F");
    Serial.print("  (avg: ");
    Serial.print(temperature_avg);
    Serial.println("°F)");


    Serial.println();

    delay(1000);    // Wait 1 second
}





/*  Computes the average of the last 10 samples of data.
 *  @param data: An array holding sensor samples.
 *  @param size: The size of the array. Should be 10.  */
float GetAverage(float *data, int size)
{
    float sum = 0;
    for (int i = 0; i < size; i++) {
        sum += data[i];
    }
    return sum / size;
}
