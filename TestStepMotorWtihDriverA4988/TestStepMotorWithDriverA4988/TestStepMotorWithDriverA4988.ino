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
  pinMode(1,OUTPUT); // Enable
  pinMode(2,OUTPUT); // Step
  pinMode(3,OUTPUT); // Dir;
  digitalWrite(3,LOW); // Set Enable low
  digitalWrite(13,HIGH);
  delay(4000);
  digitalWrite(13,LOW);

}

int currentDir = clockwise;

void loop() 
{
  digitalWrite(1,LOW); // Set Enable low
  digitalWrite(3, currentDir); // Set Dir high
  currentDir = HIGH - currentDir; //change dir
  Serial.println("Loop 200 steps (1 rev)");
  for(x = 0; x < 40; x++) // Loop 200 times
  {
    digitalWrite(2,LOW); // Output high
    delay(1); // Wait
    digitalWrite(2,HIGH); // Output low
    delay(1);
  }
  Serial.println("Pause");
  delay(100); // pause one second
}
