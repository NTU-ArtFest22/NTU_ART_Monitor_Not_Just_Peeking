// Run a A4998 Stepstick from an Arduino UNO.
// Paul Hurley Aug 2015
int x; 
#define BAUD (9600)

enum Dir {
  counterClockwise = LOW,
  clockwise = HIGH
};

void setup() 
{
  Serial.begin(BAUD);
  pinMode(6,OUTPUT); // Enable
  pinMode(5,OUTPUT); // Step
  pinMode(4,OUTPUT); // Dir
  digitalWrite(6,LOW); // Set Enable low
}

int currentDir = clockwise;

void loop() 
{
  digitalWrite(6,LOW); // Set Enable low
  digitalWrite(4, currentDir); // Set Dir high
  currentDir = HIGH - currentDir; //change dir
  Serial.println("Loop 200 steps (1 rev)");
  for(x = 0; x < 20; x++) // Loop 200 times
  {
    digitalWrite(5,LOW); // Output high
    delay(1); // Wait
    digitalWrite(5,HIGH); // Output low
  }
  Serial.println("Pause");
  delay(100); // pause one second
}
