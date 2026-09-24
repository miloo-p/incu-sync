# IncuSync – Roadmap & Engineering Blueprint

Dieses Dokument definiert den modularen Entwicklungsplan für **IncuSync**. Der Fokus liegt auf einer iterativen Architektur: Beginnend mit einem autarken, rein clientseitigen Angular-MVP für Equalizer APO bis hin zur Full-Stack-Erweiterung und AutoEQ-Hardwarekompensation.

---

## 🎯 Vision & Scope

IncuSync überbrückt die Lücke zwischen klinischer Audiometrie (Tonaudiogrammen) und digitaler Audiowiedergabe an Desktop-Systemen. Ziel ist die verzerrungsfreie, gehörgerechte Signalkompensation für Gamer und Desktop-Nutzer mit sensorischem Hörverlust, ohne den Broadcast- oder Voice-Stream zu beeinträchtigen.

---

## Phase 1: MVP – The Desktop Audio Engine (Frontend First)

**Fokus:** Autarke Single-Page-Application (Angular, reines Client-Side Rendering, SCSS, Web Audio API, Canvas).

### 1.1 Project Setup & Design System

- [ ] Angular Scaffolding (SSR deaktiviert für native Browser-API-Kompatibilität).
- [ ] Konfiguration von SCSS & Design-Tokens (Dark-Mode, Studio-Hardware-Ästhetik: Deep Charcoal, anodisiertes Aluminium, LED-Akzente in Amber/Cyan).
- [ ] Modularer Aufbau der Ordnerstruktur:
  - `core/` (Services, Singletons, Mathematical Engine)
  - `features/` (Dashboard, Fader-Panel, Canvas-Graph, A/B-Player)
  - `shared/` (UI-Primitives, Custom Slider, Buttons, Pipes)
  - `models/` (Interfaces für Frequenzen, dB HL, Biquad-Parameter, Export-Profile)

### 1.2 Eingabematrix & Reactive Forms

- [ ] Implementierung des Frequenz-Grids basierend auf Standard-Audiometrie:
  - Oktav-/Terzbänder: `125 Hz, 250 Hz, 500 Hz, 1 kHz, 2 kHz, 4 kHz, 8 kHz` (optional erweiterbar auf 1.5, 3, 6 kHz).
- [ ] Kanalgetrennte Eingabe (Stereo: Linkes Ohr / Rechtes Ohr) im Bereich von `-10 dB HL bis 120 dB HL`.
- [ ] Angular `ReactiveFormsModule` mit strikter Typisierung und Validierung.

### 1.3 Core Math Engine (`EqCalculatorService`)

- [ ] **Kompensationsformel:** Berechnung des Ziel-Gains anhand etablierter Anpassungsformeln (modifizierte Half-Gain-Rule: $\text{Gain} \approx 0.5 \times \text{dB HL}$ mit Gehörgangsresonanz-Dämpfung bei 3–4 kHz).
- [ ] **Digital Headroom Management:** Dynamische Pre-Amp-Kalkulation:
      $$\text{PreAmp} = -\max(\text{Gain}_{\text{left}}, \text{Gain}_{\text{right}}) - 1.0\text{ dB}$$
      Verhindert digitales Clipping bei Anhebungen vollständig.
- [ ] **Interpolation:** Glättung der Kurve zwischen Stützpunkten zur Vermeidung extremer Phasenverzerrungen.

### 1.4 Visual Engine (HTML5 Canvas Curve)

- [ ] Dynamisches Zeichnen des Audiogramm-Koordinatensystems (Frequenzen logarithmisch skaliert, dB-Skala invertiert nach medizinischem Standard: 0 dB oben, Hörverlust nach unten abfallend).
- [ ] Zeichnen der individuellen Hörschwellen (Blau = Links, Rot = Rechts; Kennzeichnung mit Kreuzen und Kreisen).
- [ ] Echtzeit-Rendering der berechneten Filterkurve bei Fader-Bewegung via `requestAnimationFrame`.

### 1.5 In-Browser Live A/B-Testing Engine (Web Audio API)

- [ ] Initialisierung eines browser-nativen `AudioContext`.
- [ ] Implementierung eines Audioplayers mit integriertem, dynamischem Referenz-Audiofile.
- [ ] Aufbau einer seriellen Filterkette (`BiquadFilterNode` Daisy Chain) für jedes Frequenzband.
- [ ] Dynamisches Patching: Fader-Bewegungen aktualisieren die `gain.value`-Parameter der jeweiligen Biquad-Filter ohne Audio-Dropouts.
- [ ] Bypass-Schalter (Clean vs. Calibrated) für den direkten A/B-Hörvergleich im Browser.

### 1.6 Export Engine (Equalizer APO Target)

- [ ] Parser-Implementierung zur Generierung des nativen Equalizer APO Formats:
  - Setzen des globalen Pre-Amps.
  - Stereospezifische Zuweisung (`Channel: L` und `Channel: R`).
  - Formatierung als `GraphicEQ` oder parametrische Filterkette (`Filter: ON PK Fc ... Hz Gain ... dB Q ...`).
- [ ] One-Click Client-Download der generierten `config.txt` via Blob-API.

---

## Phase 2: Hardware Compensation & Advanced Hub

**Fokus:** Akustische Perfektionierung durch Einbezug von Kopfhörer-Messwerten und erweiterte Desktop-Routing-Ziele.

### 2.1 AutoEQ-Datenbank-Integration

- [ ] Anbindung an den offenen Datensatz von _AutoEQ_ (Messungen von Harman-, Rtings- oder Oratory1990-Targets).
- [ ] Suchmaske für tausende Over-Ear- und In-Ear-Kopfhörermodelle.
- [ ] **Dual-Matrix-Kalkulation:**
      $$\text{Finale Kurve} = \text{Gehörkompensation (dB HL)} + \text{AutoEQ-Hardwarekorrektur}$$
- [ ] Automatisches Nachjustieren des Pre-Amps auf Basis der kombinierten Gesamtkurve.

### 2.2 Desktop Export Hub (Strategy Pattern)

Erweiterung der Export-Architektur über getrennte Strategy-Klassen:

- [ ] **Peace Equalizer:** Generierung nativer `.peace`-Preset-Dateien.
- [ ] **Voicemeeter:** Export von XML-Konfigurationen für das Routing auf isolierte Hardware-Outs (A1/A2), um den Broadcast-Stream sauber zu halten.
- [ ] **Custom Parametric Hub:** Generischer Export als CSV/JSON zur manuellen Übertragung in DAWs, RME TotalMix oder MiniDSP-Hardware.

---

## Phase 3: Full-Stack Expansion & Automation

**Fokus:** Datenspeicherung, Persistenz, Accounts und Bildverarbeitung via Backend.

### 3.1 Backend-Architektur (Python & Django REST Framework)

- [ ] Entwurf und Bereitstellung einer RESTful API.
- [ ] Token-basierte Authentifizierung (JWT) für personalisierte Nutzerkonten.
- [ ] Datenmodelle:
  - `UserProfile` (Präferenzen, Standard-Hardware)
  - `AudiogramSession` (Historische Messungen mit Zeitstempel, Arzt-Notizen, Timestamp)
  - `FrequencyDataPoint` (Frequenz, Seite, dB HL, Gain)

### 3.2 Gehör-Historie & Verlaufsanalyse

- [ ] Frontend-Dashboard zur Anzeige des Hörverlaufs über mehrere Jahre (Trendanalyse).
- [ ] Vergleichsansicht zweier historischer Audiogramme (z. B. 2024 vs. 2026).
- [ ] Warnhinweise bei signifikanten Schwellenwert-Verschlechterungen (medizinischer Hinweis zur Konsultation eines HNO-Arztes).

### 3.3 Computer Vision / OCR-Integration

- [ ] Datei-Upload (PDF, JPG, PNG) für abfotografierte/gescannte Arztbefunde.
- [ ] Backend-Pipeline (OpenCV / KI-Vision-Modelle):
  - Erkennung des Achsenkreuzes (Frequenz- und Dezibelskala).
  - Isolierung der roten Kreis- (Rechts) und blauen Kreuz-Punkte (Links).
  - Koordinatentransformation von Pixelwerten in diskrete dB HL-Werte.
- [ ] Interaktiver Preview-Modus im Frontend: Der Nutzer bestätigt oder korrigiert die erkannten Marker vor der Berechnung.

---

## 🚫 Scope-Ausschlüsse (Archived Decisions)

- **Keine mobilen EQ-Exporte (Wavelet, Poweramp etc.):** Moderne Hörsysteme kompensieren über Bluetooth (ASHA / MFi) am Smartphone bereits vollautomatisch. Ein zusätzlicher Software-EQ würde zu Doppelverstärkung und Verzerrung führen. Der Fokus bleibt strikt auf unkompensierten Desktop-Kopfhörer-Umgebungen.
- **Kein Dynamic Layering (Gaming-/Cinematic-Presets):** IncuSync bleibt ein medizinisches Präzisionswerkzeug. Künstliche Bass-Boosts oder Surround-Effekte verwässern den linearen Korrekturansatz.
