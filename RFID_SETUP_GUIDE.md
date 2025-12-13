# 🔖 RFID/NFC Login - Panduan Setup

## Overview
Sistem login menggunakan RFID/NFC tag memungkinkan user untuk login otomatis hanya dengan tap kartu RFID mereka pada reader yang terhubung ke ESP32.

---

## 📋 Hardware Requirements

### ESP32 RFID Reader Kit:
- **ESP32 Development Board**
- **MFRC522 RFID Reader Module**
- **RFID/NFC Cards atau Key Fobs** (13.56 MHz)
- **Jumper Wires**

### Wiring Diagram:
```
MFRC522 Pin  →  ESP32 Pin
────────────────────────
SDA (SS)     →  GPIO 5
SCK          →  GPIO 18
MOSI         →  GPIO 23
MISO         →  GPIO 19
IRQ          →  (tidak digunakan)
GND          →  GND
RST          →  GPIO 22
3.3V         →  3.3V
```

---

## 🔧 Software Setup

### 1. Arduino IDE Configuration
1. Install **Arduino IDE** (https://www.arduino.cc/en/software)
2. Install **ESP32 Board** via Board Manager
3. Install Library **MFRC522** by GithubCommunity

### 2. Upload Code ke ESP32

Buat file baru di Arduino IDE dan paste kode berikut:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 5     // sesuai wiring RC522
#define RST_PIN 22

// ===== KONFIGURASI WiFi =====
const char* ssid = "NAMA_WIFI_ANDA";
const char* password = "PASSWORD_WIFI_ANDA";

// ===== KONFIGURASI Server =====
// Ganti dengan IP Address komputer yang menjalankan server
// Gunakan ipconfig (Windows) atau ifconfig (Linux/Mac) untuk cek IP
const char* serverUrl = "http://192.168.1.15:3040/rfid";

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); 
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! IP: "); 
  Serial.println(WiFi.localIP());
  Serial.println("Ready to scan RFID cards...");
}

String uidToString(MFRC522::Uid uid) {
  String s = "";
  for (byte i = 0; i < uid.size; i++) {
    if (uid.uidByte[i] < 0x10) s += "0";
    s += String(uid.uidByte[i], HEX);
    if (i + 1 < uid.size) s += ":";
  }
  s.toUpperCase();
  return s;
}

void loop() {
  // Cari kartu RFID
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  String uid = uidToString(mfrc522.uid);
  Serial.println("Card UID: " + uid);

  // Kirim ke server via HTTP POST
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    String body = "{\"uid\":\"" + uid + "\"}";
    int httpCode = http.POST(body);
    
    if (httpCode > 0) {
      String payload = http.getString();
      Serial.println("Server Response (" + String(httpCode) + "): " + payload);
      
      // Parse response untuk feedback
      if (httpCode == 200) {
        Serial.println("✅ LOGIN SUCCESS!");
      } else if (httpCode == 404) {
        Serial.println("❌ RFID NOT REGISTERED!");
      } else {
        Serial.println("⚠️  UNKNOWN RESPONSE");
      }
    } else {
      Serial.println("❌ HTTP POST failed: " + String(httpCode));
    }
    http.end();
  } else {
    Serial.println("❌ WiFi disconnected!");
  }

  // Debouncing: tunggu sebentar agar tidak mengirim berulang
  delay(1500);
}
```

### 3. Konfigurasi WiFi dan Server URL

**Edit pada kode:**
```cpp
const char* ssid = "NAMA_WIFI_ANDA";          // Ganti dengan nama WiFi
const char* password = "PASSWORD_WIFI_ANDA";   // Ganti dengan password WiFi
const char* serverUrl = "http://192.168.1.15:3040/rfid"; // Ganti IP sesuai server Anda
```

**Cara cek IP Address server:**
- **Windows**: Buka CMD, ketik `ipconfig`, lihat "IPv4 Address"
- **Linux/Mac**: Buka Terminal, ketik `ifconfig` atau `ip addr`

---

## 📝 Registrasi RFID UID

### Option 1: Via Web Form Register
1. Buka http://localhost:3040/register
2. Isi semua data (username, password, nama, dll)
3. Di field **RFID UID**, tap kartu RFID di reader
4. Copy UID yang muncul di Serial Monitor Arduino IDE
5. Paste ke field RFID UID (format: `AB:CD:EF:12`)
6. Submit registrasi

### Option 2: Edit Manual di Database
Edit file `data/users.json`:
```json
{
  "username": "mahasiswa",
  "nama": "Test Mahasiswa",
  "rfidUid": "12:34:56:78",  // <-- Tambahkan ini
  ...
}
```

---

## 🎯 Cara Menggunakan

### 1. Start Server
```bash
cd d:\Website\peminjamanProyektor
npm start
```

### 2. Upload & Run ESP32
- Upload kode ke ESP32 via Arduino IDE
- Buka Serial Monitor (115200 baud)
- Pastikan ESP32 terhubung ke WiFi
- ESP32 siap scan kartu RFID

### 3. Login via RFID
**Method 1: Via Web Interface**
- Buka http://localhost:3040/rfid-login
- Tap kartu RFID di reader
- Server akan auto-login dan redirect ke dashboard

**Method 2: Direct Tap (Background)**
- User cukup tap kartu RFID di reader
- ESP32 otomatis kirim UID ke server
- Server response dengan data user

---

## 🔍 Testing & Troubleshooting

### Test Manual (tanpa ESP32)
Gunakan **curl** atau **Postman** untuk test endpoint:

```bash
# Test dengan RFID UID yang terdaftar
curl -X POST http://localhost:3040/rfid \
  -H "Content-Type: application/json" \
  -d "{\"uid\":\"12:34:56:78\"}"

# Response jika sukses:
{
  "success": true,
  "message": "Login berhasil!",
  "user": {
    "nama": "Test Mahasiswa",
    "username": "mahasiswa",
    "role": "mahasiswa",
    "nim": "60200123456"
  }
}

# Response jika RFID tidak terdaftar:
{
  "success": false,
  "message": "RFID tidak terdaftar. Silakan registrasi terlebih dahulu.",
  "uid": "XX:XX:XX:XX"
}
```

### Debug ESP32
1. Buka Serial Monitor di Arduino IDE (115200 baud)
2. Tap kartu RFID
3. Check output:
   - UID terdeteksi?
   - WiFi connected?
   - HTTP POST success?
   - Server response?

### Common Issues

**❌ ESP32 tidak connect WiFi**
- Check SSID dan password
- Pastikan WiFi 2.4GHz (bukan 5GHz)
- Check jarak ESP32 dengan router

**❌ HTTP POST failed**
- Check IP address server benar
- Pastikan server running (npm start)
- Pastikan ESP32 dan server di network yang sama
- Test ping dari ESP32 ke server

**❌ RFID tidak terdeteksi**
- Check wiring MFRC522
- Pastikan kartu RFID 13.56 MHz (bukan 125kHz)
- Test dengan Serial Monitor Arduino IDE

---

## 🔐 Security Considerations

### Production Deployment:
1. **Gunakan HTTPS** untuk komunikasi ESP32 ↔ Server
2. **Implementasi Token-based Auth** setelah RFID tap
3. **Rate Limiting** untuk mencegah brute force
4. **Encrypt RFID UID** sebelum disimpan di database
5. **Logging** semua RFID tap attempts

### Best Practices:
- Jangan hardcode WiFi password di kode (gunakan EEPROM)
- Implementasi timeout untuk session
- Tambahkan PIN/password tambahan untuk transaksi penting
- Rotasi RFID card secara berkala

---

## 📊 RFID UID Test Data

```
Admin:      AB:CD:EF:12
Mahasiswa:  12:34:56:78
```

---

## 🎓 Next Steps

1. **WebSocket Integration**: Real-time notification saat RFID tap
2. **Display Screen**: Tambahkan LCD/OLED di ESP32 untuk feedback
3. **Multi-factor Auth**: Kombinasi RFID + PIN
4. **Access Control**: Kontrol akses pintu dengan relay
5. **Attendance System**: Track kehadiran dengan RFID

---

## 📞 Support

Jika ada masalah:
1. Check Serial Monitor ESP32
2. Check server logs (console)
3. Test endpoint dengan curl
4. Review wiring diagram

**Happy Coding!** 🚀
