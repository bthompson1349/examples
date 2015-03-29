//Involt - Servo example

//include and define servo library
#include <Servo.h>
Servo myservo;

  boolean autoPinMode = true;
  boolean directMode = false;
  int chromeDigital[14] = {};

void setup() {
  //Do not change the serial connection bitrate.
  Serial.begin(115200);
  
  //Begin servo
  chromeDigital[9] = 90;
  myservo.attach(9);
}

void loop() {  
  //receive data from your app, do not remove this line.
  chromeReceive();
  
  //change servo position
  myservo.write(chromeDigital[9]);
  delay(15);
  
}

//----------------------
  String V = "V";

void chromeSend(int pinNumber, int sendValue){
  String A = "A";
  String E = "E";
  Serial.println(A+pinNumber+V+sendValue+E);
}

void chromeReceive(){
  String chrome;
  String pwm = "P";
  String dig = "D";
  int chromeLen;
  int pin;
  int val;
  
  if(Serial.available() > 0){
    String chrome = Serial.readStringUntil('\n');
    int chromeLen = chrome.length();
    pin = chrome.substring(1,chrome.indexOf(V)).toInt();
    String valRaw = chrome.substring(chrome.indexOf(V)+1,chromeLen);
    val = valRaw.toInt();
    
    if (autoPinMode){
      pinMode(pin, OUTPUT);
    };
    
    if (directMode){
      if (chrome.indexOf(dig) == 0){
        digitalWrite(pin, val);
      }
      else if (chrome.indexOf(pwm) == 0 ){ 
        analogWrite(pin, val);
      };
    }
    else{
      chromeDigital[pin]=val;
    };
    
  }
};
