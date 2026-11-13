# IncuSync – Roadmap & Engineering Blueprint

Dieses Dokument definiert den modularen Entwicklungsplan für **IncuSync**. Der Fokus liegt auf einer iterativen Architektur: Beginnend mit einem autarken, rein clientseitigen Angular-MVP für Equalizer APO bis hin zur Full-Stack-Erweiterung und AutoEQ-Hardwarekompensation.

---

## 🎯 Vision & Scope

IncuSync überbrückt die Lücke zwischen klinischer Audiometrie (Tonaudiogrammen) und digitaler Audiowiedergabe an Desktop-Systemen. Ziel ist die verzerrungsfreie, gehörgerechte Signalkompensation für Gamer und Desktop-Nutzer mit sensorischem Hörverlust, ohne den Broadcast- oder Voice-Stream zu beeinträchtigen.

---

## Phase 1: MVP – The Desktop Audio Engine (Frontend First)

**Fokus:** Autarke Single-Page-Application (Angular, reines Client-Side Rendering, SCSS, Web Audio API, Canvas).

### 1.1 Project Setup & Design System

- [x] Angular Scaffolding (SSR deaktiviert für native Browser-API-Kompatibilität).
- [x] Konfiguration von SCSS & Design-Tokens (Dark-Mode, Studio-Hardware-Ästhetik: Deep Charcoal, anodisiertes Aluminium, LED-Akzente in Amber/Cyan).
- [x] Modularer Aufbau der Ordnerstruktur:
  - `core/` (Services, Singletons, Mathematical Engine)
  - `features/` (Dashboard, Fader-Panel, Canvas-Graph, A/B-Player)
    > **Abweichung:** umgesetzt als `pages/` (Seiten und ihre Bereiche, z. B. `pages/home/app-interface/`) und `layout/` (Header, Footer).
  - `shared/` (UI-Primitives, Custom Slider, Buttons, Pipes)
  - `models/` (Interfaces für Frequenzen, dB HL, Biquad-Parameter, Export-Profile)

### 1.2 Eingabematrix & Reactive Forms

- [x] Implementierung des Frequenz-Grids basierend auf Standard-Audiometrie:
  - Oktav-/Terzbänder: `125 Hz, 250 Hz, 500 Hz, 1 kHz, 2 kHz, 4 kHz, 8 kHz` (optional erweiterbar auf 1.5, 3, 6 kHz).
- [ ] Kanalgetrennte Eingabe (Stereo: Linkes Ohr / Rechtes Ohr) im Bereich von `-10 dB HL bis 120 dB HL`.
- [ ] Angular `ReactiveFormsModule` mit strikter Typisierung und Validierung.

### 1.3 Core Math Engine (`EqCalculatorService`)

- [ ] **Kompensationsformel:** Berechnung des Ziel-Gains anhand etablierter Anpassungsformeln (modifizierte Half-Gain-Rule: $\text{Gain} \approx 0.5 \times \text{dB HL}$ mit Gehörgangsresonanz-Dämpfung bei 3–4 kHz).
  > **Entschieden:** POGO (McCandless & Lyregaard, 1983), nur der Gain-Teil: $\text{Gain} = 0.5 \times \text{dB HL} + k(f)$ mit $k = -10$ dB bei 125/250 Hz, $-5$ dB bei 500 Hz, sonst 0; negative Werte → 0. Keine zusätzliche „ab 20 dB HL“-Schwelle. Die Gehörgangsresonanz-Dämpfung entfällt, denn sie hängt beim Kopfhörer vom Modell ab und gehört zur OPRA-Korrektur in Phase 2. Die 125-Hz-Korrektur ist eine eigene Annahme, POGO nennt dafür keinen Wert.
- [ ] **Digital Headroom Management:** Dynamische Pre-Amp-Kalkulation:
      $$\text{PreAmp} = -\max(\text{Gain}_{\text{left}}, \text{Gain}_{\text{right}}) - 1.0\text{ dB}$$
      Verhindert digitales Clipping bei Anhebungen vollständig.
- [ ] **Interpolation:** Glättung der Kurve zwischen Stützpunkten zur Vermeidung extremer Phasenverzerrungen.

### 1.4 Visual Engine (HTML5 Canvas Curve)

> **Abweichung:** Der Audiogramm-Graph ist als **SVG statt Canvas** umgesetzt (`app-interface.html`).

- [x] Dynamisches Zeichnen des Audiogramm-Koordinatensystems (Frequenzen logarithmisch skaliert, dB-Skala invertiert nach medizinischem Standard: 0 dB oben, Hörverlust nach unten abfallend).
  > **Offen:** Die x-Positionen sind gleichmäßig nach Index verteilt. Bei reinen Oktaven entspricht das einer Log-Skala, mit 1,5 / 3 / 6 kHz nicht mehr.
- [ ] Zeichnen der individuellen Hörschwellen (Blau = Links, Rot = Rechts; Kennzeichnung mit Kreuzen und Kreisen).
- [ ] Echtzeit-Rendering der berechneten Filterkurve bei Fader-Bewegung via `requestAnimationFrame`.

### 1.5 In-Browser Live A/B-Testing Engine (Web Audio API)

- [ ] Initialisierung eines browser-nativen `AudioContext`.
- [ ] Implementierung eines Audioplayers mit integriertem, dynamischem Referenz-Audiofile.
- [ ] Aufbau einer seriellen Filterkette (`BiquadFilterNode` Daisy Chain) für jedes Frequenzband.
- [ ] Dynamisches Patching: Fader-Bewegungen aktualisieren die `gain.value`-Parameter der jeweiligen Biquad-Filter ohne Audio-Dropouts.
- [ ] Bypass-Schalter (Clean vs. Calibrated) für den direkten A/B-Hörvergleich im Browser.

### 1.6 Export Engine (Equalizer APO Target)

- [x] Parser-Implementierung zur Generierung des nativen Equalizer APO Formats:
  - Setzen des globalen Pre-Amps.
  - Stereospezifische Zuweisung (`Channel: L` und `Channel: R`).
  - Formatierung als `GraphicEQ` oder parametrische Filterkette (`Filter: ON PK Fc ... Hz Gain ... dB Q ...`).
    > **Entschieden:** parametrische Filterkette (`PK`), kein `GraphicEQ`.
- [x] One-Click Client-Download der generierten `config.txt` via Blob-API.
  > **Offen:** Die Werte sind bis Export-Schritt 4 fest eingetragen, noch nicht aus dem Audiogramm berechnet.

#### Umsetzungsplan Export

- [x] **1. Durchstich:** `ExportBtn` meldet den Klick per `output()`, der `Export`-Service lädt Text per Blob/Object-URL herunter, `AppInterface` ruft `configDownload()` auf (noch mit Platzhalter-Text).
- [x] **2. Datenmodell** (`models/interfaces.ts`):
  - `FilterConfig`: eine Filterzeile (`frequency` in Hz, `gain` in dB, `qFactor`).
  - `ExportConfig`: `preAmp` (dB, immer negativ, gemeinsam für beide Ohren) + `leftEar` / `rightEar` als `FilterConfig[]`.
- [x] **3. Generator** (`core/generators/equalizer-apo.ts`): reine Funktion `buildEqualizerConfiguration(preset: ExportConfig): string` mit Hilfsfunktion `buildFilterLines`, testgetrieben mit Vitest (5 Tests).
  - Zahlenformat: Frequenz 0, Gain 1, Q 2, Pre-Amp 1 Nachkommastelle; keine `.0`, kein `-0`, immer Punkt.
  - Jede Zeile endet mit `\n`; ein Ohr ohne Filter erzeugt nur seine `Channel:`-Zeile.
  - Eingebaut in `AppInterface.configDownload()`, vorerst mit festen Beispielwerten.
- [ ] **4. Anschluss an `EqCalc`:** Werte als Signals, Gain- und Pre-Amp-Berechnung, Export-Button `disabled`, solange beide Ohren komplett 0 sind.
  - Gain nach **POGO** (siehe 1.3), Q 1.41 für das Oktav-Raster.
  - Pre-Amp **sicher nach unten** runden (z. B. −30.4 → −31), das gehört zur Berechnung, nicht in den Generator.
  - Ungenutzten Import `EqCalc` in `models/interfaces.ts` entfernen (Modelle sollen nichts aus `services/` importieren).
  - > **Edit:** Obergrenze für den Gain pro Filter (z. B. 30 dB, Wert noch offen). Bei sehr großem Hörverlust würde POGO sonst Anhebungen liefern, bei denen Kopfhörer verzerren; dann ist ein Hörgerät die bessere Lösung.
- [ ] > **Edit:** **5. Lautstärke-Hinweis** ab einem maximalen Gain von **20 dB** (nach POGO = 40 dB HL, mittelgradiger Hörverlust):
  - Hinweis in der App neben dem Export-Button: Lautstärke einmal vorsichtig einstellen und nicht weiter hochdrehen; optional ein Limiter-Plugin (VST) in Equalizer APO.
  - Derselbe Hinweis als `#`-Kommentarzeile oben in der `config.txt` (Equalizer APO ignoriert `#`-Zeilen).
  - Hintergrund: Der Pre-Amp schützt nur vor digitalem Übersteuern, nicht vor zu hoher Lautstärke im Ohr. Die 20-dB-Grenze ist eine eigene Festlegung, es gibt keinen Standardwert.

**Entscheidungen:**

- Download-Methode bekommt Inhalt und Dateinamen als Parameter (unabhängig vom Format).
- Jeder Filter hat eine eigene Frequenz, kein festes 7er-Array (Halboktaven wie 1,5 / 3 / 6 kHz und OPRA-Profile müssen passen).
- Pre-Amp gemeinsam für beide Ohren, damit das Verhältnis zwischen links und rechts erhalten bleibt.
- Das Modell hält nur Zahlen; `ON`, `PK` und `L`/`R` schreibt der Generator.
- Generator als reine Funktion statt Service: kein Zustand, kein `inject()`, Tests ohne `TestBed`.
- Rechnen und Drucken getrennt: Der Generator formatiert nur, Gain und Pre-Amp berechnet Schritt 4.
- Die Datei endet mit `\n` (Konvention für Textdateien, nichts klebt beim Anhängen aneinander).
- Gain-Formel POGO statt NAL-R: linear (passt zu statischen PK-Filtern), etabliert, und die NAL-R-Konstanten sind in den Quellen widersprüchlich.
- IncuSync ist kein Medizinprodukt und ersetzt keine Hörgeräte-Anpassung; ein Hinweis dazu gehört in die App.
- Für den Kopfhörer-EQ zählt die Luftleitung im Audiogramm, nicht die Knochenleitung.

---

## Phase 2: Hardware Compensation & Advanced Hub

**Fokus:** Akustische Perfektionierung durch Einbezug von Kopfhörer-Messwerten und erweiterte Desktop-Routing-Ziele.

### 2.1 AutoEQ-Datenbank-Integration

- [ ] Anbindung an den offenen Datensatz von _AutoEQ_ (Messungen von Harman-, Rtings- oder Oratory1990-Targets).
- [ ] Suchmaske für tausende Over-Ear- und In-Ear-Kopfhörermodelle.
- [ ] **Dual-Matrix-Kalkulation:**
      $$\text{Finale Kurve} = \text{Gehörkompensation (dB HL)} + \text{AutoEQ-Hardwarekorrektur}$$
- [ ] Automatisches Nachjustieren des Pre-Amps auf Basis der kombinierten Gesamtkurve.
- [ ] > **Edit:** **Output-Begrenzung (Limiter)** mit der Unbehaglichkeitsschwelle (US) aus dem Audiogramm, angelehnt an den Output-Teil von POGO. Braucht eine erweiterte Eingabe (US-Werte) und einen Bezug zwischen digitalem Pegel und Lautstärke im Ohr (Windows-Lautstärke, Kopfhörer).

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
