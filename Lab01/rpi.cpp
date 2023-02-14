/********************
*
*    rpi.cpp
*    
*    Adapted code from the supplied example.cpp,
*    with the addition of the last 10 sample averaging.
*
*********************/
#include <vector>
#include "RTIMULib.h"





/*  Computes the average of the last 10 samples.
 *  @param dataVector: The vector that holds the previous 10 measurements.  */
RTFLOAT getLast10Average(std::vector<RTFLOAT> dataVector)
{
    RTFLOAT sum = 0;
    for (int i=0; i<dataVector.size(); i++) {
        sum += dataVector[i];
    }
    return sum/dataVector.size();
}




int main()
{
	
    int sampleRate = 0;
    int sampleCount = 0;
    uint64_t now;
    uint64_t rateTimer;
    uint64_t displayTimer;


    std::vector<RTFLOAT> rollData;
    std::vector<RTFLOAT> pitchData;
    std::vector<RTFLOAT> yawData;
    std::vector<RTFLOAT> pressureData;
    

    RTIMUSettings* settings = new RTIMUSettings("RTIMULib");

    RTIMU* imu = RTIMU::createIMU(settings);
    RTPressure* pressure = RTPressure::createPressure(settings);
    RTHumidity* humidity = RTHumidity::createHumidity(settings);

    if ((imu == NULL) || (imu->IMUType() == RTIMU_TYPE_NULL)) {
        printf("No IMU found\n");
        exit(1);
    }


    imu->IMUInit();

    imu->setSlerpPower(0.02);
    imu->setGyroEnable(true);
    imu->setAccelEnable(true);
    imu->setCompassEnable(true);


    //  set up pressure sensor
    if (pressure != NULL) {
        pressure->pressureInit();
    }

    //  set up humidity sensor
    if (humidity != NULL) {
        humidity->humidityInit();
    }

    //  set up for rate timer
    rateTimer = displayTimer = RTMath::currentUSecsSinceEpoch();


    while (1) 
	{
		/* HINT: The whole purpose of the weird way this is written is to poll the 
		 *       IMU at its recommended rate, but display the data at a rate that may be different.
         *		 Not polling at the correct rate can result in weird readings.
		 *
		 **/
		

        //  poll at the rate recommended by the IMU
        usleep(imu->IMUGetPollInterval() * 1000);



        while (imu->IMURead()) 
		{
            RTIMU_DATA imuData = imu->getIMUData();

            // Get individual components of imu data
            RTFLOAT roll  = imuData.fusionPose.x() * RTMATH_RAD_TO_DEGREE
            RTFLOAT pitch = imuData.fusionPose.y() * RTMATH_RAD_TO_DEGREE
            RTFLOAT yaw   = imuData.fusionPose.z() * RTMATH_RAD_TO_DEGREE

            // Add latest roll measurement to its vector
            rollData.emplace_back(roll);
            if (rollData.size() > 10) {
                rollData.erase(rollData.begin());
            }

            // Add latest pitch measurement to its vector
            pitchData.emplace_back(pitch);
            if (pitchData.size() > 10) {
                pitchData.erase(pitchData.begin());
            }

            // Add latest yaw measurement to its vector
            yawData.emplace_back(yaw);
            if (yawData.size() > 10) {
                yawData.erase(yawData.begin());
            }

            // Compute averages of last 10 gyro measurements
            RTFLOAT rollAverage  = getLast10Average(rollData);
            RTFLOAT pitchAverage = getLast10Average(pitchData);
            RTFLOAT yawAverage   = getLast10Average(yawData);


            //  add the pressure data to the structure
            if (pressure != NULL) {
                pressure->pressureRead(imuData);

                // Add latest pressure measurement to its vector
                pressureData.emplace_back(imuData.pressure);
                if (pressureData.size() > 10) {
                    pressureData.erase(pressureData.begin());
                }
                
                // Compute the average of the last 10 measurements
                RTFLOAT pressureAverage = getLast10Average(pressureData);
            }


            //  add the humidity data to the structure
            if (humidity != NULL) {
                humidity->humidityRead(imuData);
            }


            sampleCount++;
            now = RTMath::currentUSecsSinceEpoch();


            //  display 1 time per second
			//  HINT: The code inside this "if" statement executes once per second.
			//        Put all of your code to print/calculate current and average IMU data inside here.
			//        You shouldn't need to modify anything outside of this "if" statement.
			//        The IMU is polled at the recommended rate, but this "if" statement ensures that the  
            //        values are only displayed at a certain interval.			
            if ((now - displayTimer) > 1000000) 
			{ 
                printf("Sample rate %d: %s\n", sampleRate, RTMath::displayDegrees("", imuData.fusionPose));


                printf("Last 10 roll average: %4.1f" , rollAverage);
                printf("Last 10 pitch average: %4.1f", pitchAverage);
                printf("Last 10 yaw average: %4.1f"  , yawAverage);


                if (pressure != NULL) {
                    printf("Pressure: %4.1f, height above sea level: %4.1f, temperature: %4.1f",
                           imuData.pressure, RTMath::convertPressureToHeight(imuData.pressure), imuData.temperature);

                    printf("Last 10 pressure average: %4.1f", pressureAverage);
                }
				
                if (humidity != NULL) {
                    printf(", humidity: %4.1f", imuData.humidity);
                }
                printf("\n");

                fflush(stdout);
                displayTimer = now;//HINT: LEAVE THIS LINE ALONE!!!
            }


            //  update rate every second
            if ((now - rateTimer) > 1000000) {
                sampleRate = sampleCount;
                sampleCount = 0;
                rateTimer = now;
            }
        
		}
    }
}








/////////////////////////////////////////////////////////////////////////////
//
//  This file is part of RTIMULib
//
//  Copyright (c) 2014-2015, richards-tech, LLC
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy of
//  this software and associated documentation files (the "Software"), to deal in
//  the Software without restriction, including without limitation the rights to use,
//  copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
//  Software, and to permit persons to whom the Software is furnished to do so,
//  subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in all
//  copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
//  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
//  PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
//  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
//  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
//  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/////////////////////////////////////////////////////////////////////////////
