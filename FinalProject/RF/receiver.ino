/*
 *  receiver.ino
 *
 *  Created by:  Matt Kaufman
 *  Date:        April 21, 2023
 *
 *  Code for the receiver (RX480E-4) of the 433MHz RF transmitter/receiver pair.
 *  Continuously checks for an incoming signal from the transmitter (TX118SA-4),
 *  and makes the distinction between channels that the incoming signal was received on.
*/

#include <Arduino.h>

