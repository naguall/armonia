# ARMONÍA

> App profesional para aprender armonía, arreglos y composición en profundidad — jazz, clásico, pop/cine, latino/folclórico — con tutor IA, ear training, análisis de canciones y mapa de maestría.

[![PWA](https://img.shields.io/badge/PWA-instalable-2E5C8A)](#)
[![License](https://img.shields.io/badge/license-proprietary-C77B2A)](#)
[![Idiomas](https://img.shields.io/badge/idiomas-ES%20·%20EN%20·%20PT%20·%20FR%20·%20IT-4A7FB8)](#)

---

## 🎯 Qué es

ARMONÍA es una PWA (Progressive Web App) que lleva a músicos intermedios al nivel profesional de armonía, arreglos y composición. El contenido cubre con igual profundidad:

- 🎷 Jazz (CST, reharmonización, voicings, bebop, modal, post-bop)
- 🎻 Clásico (armonía tonal, contrapunto, Schenker, post-tonal)
- 🎤 Pop / rock / neo-soul / film scoring
- 🥁 Latino (bossa, salsa, tango, flamenco, folclórico)
- 🎬 Música de cine (Williams, Herrmann, Zimmer)

Con un tutor IA conversacional, mapa de maestría real (no streaks infantiles), ear training adaptativo, análisis de canciones con Roman numerals y separación de stems.

## 🏗 Estructura del repo

```
/
├── APP_ARMONIA_Prototipo.html      # App principal (SPA)
├── manifest.webmanifest            # PWA manifest
├── sw.js                           # Service worker (offline)
├── icon-192.svg                    # Ícono launcher
├── icon-512.svg                    # Ícono splash
├── cloudflare-worker.js            # Proxy para Claude API
├── servir.command                  # Launcher local (macOS)
├── GUIA_INSTALACION.html           # Guía paso a paso
├── APP_ARMONIA_Dossier_Maestro.docx    # Investigación y PRD
├── APP_ARMONIA_Matriz_Competitiva.xlsx # Análisis competitivo
└── README.md
```

## 🚀 Despliegue

### Opción A — Netlify Drop (2 min, sin configuración)
1. Ir a https://app.netlify.com/drop
2. Arrastrar la carpeta completa
3. Obtener URL `https://xxx.netlify.app`
4. Abrir en teléfono → instalar PWA

### Opción B — GitHub Pages (recomendada)
1. Settings → Pages → Source = `main` branch, `/ (root)`
2. URL será `https://tu-usuario.github.io/armonia/APP_ARMONIA_Prototipo.html`
3. Cada push a main despliega automáticamente

### Opción C — Local (desarrollo)
```bash
python3 -m http.server 8765
# Abre http://localhost:8765/APP_ARMONIA_Prototipo.html
```

## 🤖 Activar Tutor IA real

Por defecto el tutor usa respuestas guionadas. Para conectarlo a Claude API:

1. Obtener API key en https://console.anthropic.com/
2. Crear Cloudflare Worker y pegar `cloudflare-worker.js`
3. Settings → Variables → Add `ANTHROPIC_API_KEY` (encrypted)
4. En `APP_ARMONIA_Prototipo.html`, configurar `WORKER_URL` y activar `tutorReplyAI()`

Ver `GUIA_INSTALACION.html` para instrucciones completas.

## ✨ Stack

- **Frontend:** HTML + Tailwind CSS (CDN) + Vanilla JS
- **Audio:** Tone.js (Web Audio API)
- **Persistencia:** localStorage (MVP), migración futura a Supabase
- **PWA:** Service Worker cache-first para shell, icons SVG
- **IA:** Anthropic Claude (vía Cloudflare Worker proxy)
- **Hosting:** GitHub Pages / Cloudflare Pages / Netlify

## 🗺 Roadmap

- **V0 (actual)** — Prototipo interactivo con 10 pantallas, audio real, mic, tutor IA guionado
- **V0.5** — Tutor IA real vía Claude, backend básico en Cloudflare
- **V1 MVP** — Niveles 1-3 completos ES/EN, 50 canciones analizadas, ear training adaptativo real
- **V1.5** — Niveles 4-5, PT/FR/IT, stems con Moises API, plan Pro en Stripe
- **V2** — Nivel 6, capa institucional B2B, plugin DAW, voz-a-voz

## 📚 Fuentes pedagógicas

Currículo basado en: Aldwell-Schachter, Kostka-Payne, de la Motte, Zamacois, Schoenberg, Fux, Levine, Nettles-Graf, Ligon, Herrera, Adler, Persichetti, Mauleón, Salgán, Leiva. Ver `APP_ARMONIA_Dossier_Maestro.docx` para bibliografía completa.

## 📞 Contacto

- Creador: bearman (campoltro@gmail.com)

## 📄 Licencia

Proprietary — todos los derechos reservados. Este repo es privado / propiedad del autor; no está abierto a contribuciones externas sin acuerdo previo.
