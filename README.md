# IncuSync

**Bridging the gap between medical hearing data and digital audio precision.**

## Über das Projekt

IncuSync ist ein inoffizielles Konfigurationstool für Equalizer APO. Es automatisiert den komplexen Prozess, systemweite Audio-Equalizer-Einstellungen basierend auf medizinischen Messwerten vorzunehmen. Das Tool schlägt die direkte Brücke zwischen einem Tonaudiogramm und einer sofort nutzbaren Equalizer-APO-Konfigurationsdatei.

## Die Mission

Als schwerhöriger Gamer und Mediengestalter erlebte ich einen prägenden Moment, als ich mein PC-Audio zum ersten Mal exakt anhand meiner medizinischen Daten kalibrierte: Der akustische "Nebel" lichtete sich und ich konnte Details hören, die mir jahrelang verborgen blieben.

IncuSync entsteht aus dem Antrieb, diese technische Hürde abzubauen und dieses Erlebnis der absoluten Klarheit für jeden zugänglich zu machen – ohne dass tiefgreifendes Wissen über Audio-Routing oder Frequenzbänder nötig ist.

## Geplante Features

- **Das Dashboard (UI):** Ein visuelles, interaktives Interface zur präzisen Eingabe der individuellen Hörschwellen (dB HL) für das linke und rechte Ohr.
- **Die Signalverarbeitung (Logik):** Automatische Berechnung der notwendigen Verstärkungswerte (Gain) sowie des negativen Pre-Amps zur Vermeidung von Audio-Clipping, basierend auf medizinischen Standard-Anpassungsformeln.
- **Der Export (APO-Link):** One-Click-Generierung einer fertigen `config.txt` zur direkten Einbindung in Equalizer APO.
- **Zukunftsvision:** KI-Vision-Integration, um ärztliche Audiogramme via Bild-Upload oder Screenshot direkt einzulesen und die Parameter automatisch in die App zu übertragen.

## Tech-Stack

- **Frontend:** Angular, TypeScript, SCSS
- **Design:** Custom Dark Mode UI im professionellen Studio-Hardware-Look (konzipiert in Figma)
- **Visualisierung:** HTML5 Canvas zur dynamischen Echtzeit-Darstellung der Audiogramm-Kurven

## Projektstatus

Das Projekt entsteht als praxisnahes Utility im Rahmen meiner Weiterbildung zum Full-Stack-Entwickler. Aktuell befindet sich IncuSync in der Konzeptionsphase der Angular-Architektur und des UI-Designs.

## Danksagung & Disclaimer

Dieses Projekt wäre ohne die herausragende Arbeit der Entwickler von Equalizer APO nicht möglich. IncuSync ist ein unabhängiges Community-Projekt und steht in keiner offiziellen Verbindung zu den Entwicklern von Equalizer APO. Es dient als eigenständiges Utility, um die Nutzung dieser großartigen Software für eine breitere Zielgruppe zugänglich zu machen.

<br>

<details>
<summary>🇬🇧 <strong>English Version (Click to expand)</strong></summary>

# IncuSync

**Bridging the gap between medical hearing data and digital audio precision.**

## About the Project

IncuSync is an unofficial configuration tool for Equalizer APO. It automates the complex, manual process of setting up system-wide audio equalizer configurations based on medical data. The tool creates a direct bridge between a standard medical pure-tone audiogram and a ready-to-use Equalizer APO configuration file.

## The Mission

As a hard-of-hearing gamer and media designer, I experienced a defining moment when I accurately calibrated my PC audio based on my medical data for the first time: The acoustic "fog" lifted, and I could hear details that had been hidden from me for years.

IncuSync was born out of the drive to remove this technical barrier and make this experience of absolute clarity accessible to everyone—without requiring in-depth knowledge of audio routing or frequency bands.

## Planned Features

- **The Dashboard (UI):** A visual, interactive interface for the precise input of individual hearing thresholds (dB HL) for the left and right ear.
- **Signal Processing (Logic):** Automatic calculation of the necessary gain values and negative pre-amp to prevent audio clipping, based on standard medical fitting formulas.
- **The Export (APO-Link):** One-click generation of a finished `config.txt` for direct integration into Equalizer APO.
- **Future Vision:** AI vision integration to read medical audiograms directly via image upload or screenshot, automatically transferring the parameters into the app.

## Tech Stack

- **Frontend:** Angular, TypeScript, SCSS
- **Design:** Custom Dark Mode UI featuring a professional studio hardware aesthetic (designed in Figma)
- **Visualization:** HTML5 Canvas for dynamic, real-time rendering of audiogram curves

## Project Status

This project is being developed as a practical utility during my transition into full-stack development. Currently, IncuSync is in the conceptual phase, focusing on Angular architecture and UI design.

## Acknowledgments & Disclaimer

This project would not be possible without the outstanding work of the Equalizer APO developers. IncuSync is an independent community project and is not officially affiliated with the developers of Equalizer APO. It serves as a standalone utility to make this fantastic software accessible to a broader audience.

</details>

```
incu-sync
├─ .editorconfig
├─ .prettierrc
├─ angular.json
├─ package-lock.json
├─ package.json
├─ public
│  ├─ assets
│  │  ├─ fonts
│  │  │  ├─ IBMPlexSans-VariableFont_wdth,wght.ttf
│  │  │  └─ JetBrainsMono-VariableFont_wght.ttf
│  │  ├─ icons
│  │  └─ images
│  └─ favicon.ico
├─ README.md
├─ ROADMAP.md
├─ src
│  ├─ app
│  │  ├─ app.config.ts
│  │  ├─ app.html
│  │  ├─ app.routes.ts
│  │  ├─ app.scss
│  │  ├─ app.spec.ts
│  │  ├─ app.ts
│  │  ├─ core
│  │  │  └─ services
│  │  │     ├─ audio-context.spec.ts
│  │  │     ├─ audio-context.ts
│  │  │     ├─ eq-calc.spec.ts
│  │  │     ├─ eq-calc.ts
│  │  │     ├─ export.spec.ts
│  │  │     └─ export.ts
│  │  ├─ layout
│  │  │  ├─ footer
│  │  │  │  ├─ footer.html
│  │  │  │  ├─ footer.scss
│  │  │  │  ├─ footer.spec.ts
│  │  │  │  └─ footer.ts
│  │  │  └─ header
│  │  │     ├─ header.html
│  │  │     ├─ header.scss
│  │  │     ├─ header.spec.ts
│  │  │     └─ header.ts
│  │  ├─ legal
│  │  │  ├─ imprint
│  │  │  │  ├─ imprint.html
│  │  │  │  ├─ imprint.scss
│  │  │  │  ├─ imprint.spec.ts
│  │  │  │  └─ imprint.ts
│  │  │  └─ legal-notice
│  │  │     ├─ legal-notice.html
│  │  │     ├─ legal-notice.scss
│  │  │     ├─ legal-notice.spec.ts
│  │  │     └─ legal-notice.ts
│  │  ├─ models
│  │  │  └─ interfaces.ts
│  │  ├─ pages
│  │  │  ├─ home
│  │  │  │  ├─ app-interface
│  │  │  │  │  ├─ ab-player
│  │  │  │  │  │  ├─ ab-player.html
│  │  │  │  │  │  ├─ ab-player.scss
│  │  │  │  │  │  ├─ ab-player.spec.ts
│  │  │  │  │  │  └─ ab-player.ts
│  │  │  │  │  ├─ app-interface.html
│  │  │  │  │  ├─ app-interface.scss
│  │  │  │  │  ├─ app-interface.spec.ts
│  │  │  │  │  ├─ app-interface.ts
│  │  │  │  │  ├─ canvas-graph
│  │  │  │  │  │  ├─ canvas-graph.html
│  │  │  │  │  │  ├─ canvas-graph.scss
│  │  │  │  │  │  ├─ canvas-graph.spec.ts
│  │  │  │  │  │  └─ canvas-graph.ts
│  │  │  │  │  └─ fader-panel
│  │  │  │  │     ├─ fader-panel.html
│  │  │  │  │     ├─ fader-panel.scss
│  │  │  │  │     ├─ fader-panel.spec.ts
│  │  │  │  │     └─ fader-panel.ts
│  │  │  │  ├─ hero
│  │  │  │  │  ├─ hero.html
│  │  │  │  │  ├─ hero.scss
│  │  │  │  │  ├─ hero.spec.ts
│  │  │  │  │  └─ hero.ts
│  │  │  │  ├─ home.html
│  │  │  │  ├─ home.scss
│  │  │  │  ├─ home.spec.ts
│  │  │  │  ├─ home.ts
│  │  │  │  ├─ share-story
│  │  │  │  │  ├─ share-story.html
│  │  │  │  │  ├─ share-story.scss
│  │  │  │  │  ├─ share-story.spec.ts
│  │  │  │  │  └─ share-story.ts
│  │  │  │  └─ thanks
│  │  │  │     ├─ thanks.html
│  │  │  │     ├─ thanks.scss
│  │  │  │     ├─ thanks.spec.ts
│  │  │  │     └─ thanks.ts
│  │  │  ├─ stories
│  │  │  │  ├─ stories.html
│  │  │  │  ├─ stories.scss
│  │  │  │  ├─ stories.spec.ts
│  │  │  │  └─ stories.ts
│  │  │  └─ tutorial
│  │  │     ├─ tutorial.html
│  │  │     ├─ tutorial.scss
│  │  │     ├─ tutorial.spec.ts
│  │  │     └─ tutorial.ts
│  │  └─ shared
│  │     ├─ components
│  │     │  ├─ custom-slider
│  │     │  │  ├─ custom-slider.html
│  │     │  │  ├─ custom-slider.scss
│  │     │  │  ├─ custom-slider.spec.ts
│  │     │  │  └─ custom-slider.ts
│  │     │  └─ export-btn
│  │     │     ├─ export-btn.html
│  │     │     ├─ export-btn.scss
│  │     │     ├─ export-btn.spec.ts
│  │     │     └─ export-btn.ts
│  │     └─ pipes
│  │        ├─ dbhl-pipe.spec.ts
│  │        ├─ dbhl-pipe.ts
│  │        ├─ frequency-pipe.spec.ts
│  │        ├─ frequency-pipe.ts
│  │        ├─ gain-pipe.spec.ts
│  │        └─ gain-pipe.ts
│  ├─ environments
│  │  ├─ environment.development.ts
│  │  └─ environment.ts
│  ├─ index.html
│  ├─ main.ts
│  ├─ styles
│  │  ├─ abstracts
│  │  │  ├─ _mixins.scss
│  │  │  ├─ _typography.scss
│  │  │  └─ _variables.scss
│  │  ├─ base
│  │  │  ├─ _base.scss
│  │  │  └─ _reset.scss
│  │  └─ utils
│  │     └─ _utilities.scss
│  └─ styles.scss
├─ tsconfig.app.json
├─ tsconfig.json
└─ tsconfig.spec.json

```
