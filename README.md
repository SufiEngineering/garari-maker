# ⚙️ Garari Maker — Sprocket DXF Generator

A free, open-source, browser-based sprocket design tool that generates CNC/laser-ready DXF files. Built by [Sufi Engineering](https://sufi.engineering).

![Garari Maker](https://img.shields.io/badge/Made_with-React_19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite) ![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 What is Garari Maker?

**Garari** (گراری) is the Urdu word for *sprocket*. This tool lets anyone — from workshop machinists to mechanical engineering students — design precision roller-chain sprockets directly in the browser, without CAD software.

All tooth profiles follow the **ANSI B29.1M** standard, with proper seating arcs, working flanks, and tip radii calculated from chain pitch and roller diameter.

## ✨ Features

- **Standard ANSI Chains** — Select from #25, #35, #40, #41, #50, #60, #80, and #100 roller chains
- **Tooth Count** — 8 to 120 teeth with live preview updates
- **Bore & Hub** — Configurable center bore with optional hub circle
- **Keyway Slot** — Standard keyway cut with adjustable width & depth
- **Mounting Holes** — Bolt-circle pattern with 3–12 holes
- **2D + 3D Preview** — Live SVG preview and interactive Three.js 3D view with real plate thickness
- **Weight Estimation** — Supports 9 materials: mild steel, stainless steel, hardened steel, aluminum, brass, bronze, cast iron, nylon, and Delrin
- **DXF Export** — Layered output (outline, bore, hub, holes) ready for CNC/laser
- **Share Links** — Encode any configuration into a URL to share with others
- **WhatsApp Ordering** — Send specs directly to Sufi Engineering for fabrication
- **Bilingual UI** — Full English 🇬🇧 and Urdu 🇵🇰 support with RTL layout

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4.2 |
| Build Tool | Vite 7.3 |
| 2D Geometry | [Maker.js](https://maker.js.org/) |
| 3D Preview | [Three.js](https://threejs.org/) |
| DXF/SVG Export | Maker.js exporters |
| File Download | FileSaver.js |

## 📦 Installation

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (or pnpm / yarn)

### Setup

```bash
# Clone the repository
git clone https://github.com/SufiEngineering/garari-maker.git
cd garari-maker

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173**.

### Build for Production

```bash
npm run build
```

Output is generated in the `dist/` folder, ready for static hosting.

### Other Scripts

```bash
npm run lint       # Run ESLint
npm run preview    # Preview the production build locally
```

## 📁 Project Structure

```
garari-maker/
├── public/                  # Static assets
├── src/
│   ├── components/          # React UI components
│   │   ├── DownloadModal.tsx     # DXF download dialog
│   │   ├── NumberInput.tsx       # Numeric input with validation
│   │   ├── ParameterPanel.tsx    # Main parameter controls
│   │   ├── Preview3D.tsx         # Three.js 3D extruded preview
│   │   ├── PreviewPanel.tsx      # 2D/3D preview container
│   │   ├── SectionHeader.tsx     # Collapsible section headers
│   │   └── ToggleSwitch.tsx      # Toggle switch control
│   ├── data/
│   │   ├── chainTable.ts         # ANSI chain specs (pitch, roller dia)
│   │   └── materials.ts          # Material densities for weight calc
│   ├── engine/
│   │   └── sprocketGeometry.ts   # Core geometry engine (tooth profiles, export)
│   ├── i18n/
│   │   ├── LangContext.tsx        # Language context provider
│   │   └── translations.ts       # EN/UR translation strings
│   ├── types/
│   │   └── sprocket.ts           # TypeScript interfaces
│   ├── utils/
│   │   └── shareLink.ts          # URL encode/decode for sharing
│   ├── App.tsx                    # Root app component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository at [github.com/SufiEngineering/garari-maker](https://github.com/SufiEngineering/garari-maker)
2. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. **Make your changes** and ensure the build passes:
   ```bash
   npm run lint
   npm run build
   ```
4. **Commit** with a descriptive message:
   ```bash
   git commit -m "feat: add support for metric chain standards"
   ```
5. **Push** and open a **Pull Request**

### Ideas for Contributions

- Additional chain standards (metric ISO, British BS)
- STL/STEP 3D export
- Dimension annotation overlay
- Lightening hole patterns for weight reduction
- Print-friendly layout
- Dark/light theme toggle
- Unit conversion (metric ↔ imperial)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Contact

**Sufi Engineering** — Custom sprocket fabrication & industrial parts

- 🌐 [sufi.engineering](https://sufi.engineering)
- 🐙 GitHub: [github.com/SufiEngineering](https://github.com/SufiEngineering)

---

<p align="center">Built with ❤️ in Pakistan 🇵🇰</p>
