#include <EmonLib.h>
#include <WiFi.h>
#include <FirebaseESP32.h>

#define FIREBASE_HOST "firebase-host-here.firebaseio.com"
#define FIREBASE_AUTH "firebase-secret-here"
#define WIFI_SSID "WiFi SSID"
#define WIFI_PASSWORD "W1Fi P@ssw0rd"

#define PINO_TENSAO 36
#define PINO_CORRENTE 32

#define NUM_AMOSTRAS_POR_HORA 720

#define VOLTS_POR_UNIDADE (3.3 / 4096)

EnergyMonitor energyMonitor;

double potenciaKilloWattsHoraAcumulada = 0.0;

void setup() {

  Serial.begin(9600);

  connectToWiFi();

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);

  energyMonitor.current(PINO_CORRENTE, 63.5);
  energyMonitor.voltage(PINO_TENSAO, 624.3 , 1.7);

}

bool isConnected() {
  return WiFi.status() == WL_CONNECTED;
}

void connectToWiFi() {

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando ao WiFi");
  while (!isConnected()) {
    Serial.print(".");
    delay(300);
  }

  Serial.println();
  Serial.print("Conectado no IP: ");
  Serial.println(WiFi.localIP());
  
}

void salvarPotenciaFirebase(double potencia) {
  
  StaticJsonBuffer<JSON_BUFFER_SIZE> jsonBuffer;
  JsonObject& object = jsonBuffer.createObject();
  JsonObject& timeStampObject = object.createNestedObject("timestamp");
  
  timeStampObject[".sv"] = "timestamp";
  
  object["potencia"] = potencia;

  JsonVariant variant = object;

  Firebase.push("/historico", variant);
  
}

void loop() {

  if(!isConnected()) {
    connectToWiFi();
  } else {

    // Calcula todas as grandezas, tensão, corrente, potência e fator de potência
    energyMonitor.calcVI(500, 200);
  
    double tensao = energyMonitor.Vrms * sqrt(2.0);
    double corrente = energyMonitor.Irms * sqrt(2.0);
    double potenciaKilloWatts = energyMonitor.Irms * energyMonitor.Vrms * sqrt(2.0) * sqrt(2.0) / 1000;
    double potenciaKilloWattsHora = potenciaKilloWatts / NUM_AMOSTRAS_POR_HORA;
          
    potenciaKilloWattsHoraAcumulada += potenciaKilloWattsHora;
    
    Serial.print("Tensao: ");
    Serial.print(tensao);
    Serial.println(" V");
    
    Serial.print("Corrente: ");
    Serial.print(corrente);
    Serial.println(" I");
  
    Serial.print("potenciaKilloWattsHora: ");
    Serial.print(potenciaKilloWattsHora, 4);
    Serial.println(" kW/h");
  
    Serial.print("potenciaKilloWatts: ");
    Serial.print(potenciaKilloWatts, 4);
    Serial.println(" kW");
  
    Serial.print("potenciaKilloWattsHora acumulada: ");
    Serial.print(potenciaKilloWattsHoraAcumulada, 4);
    Serial.println(" kW");
    
    Serial.println("--------------------------------------");

    salvarPotenciaFirebase(potenciaKilloWattsHora);

    delay(5000);

  }
  
}
