# TechVLSI 2026 - Departmental Event Website

Official event website for **TechVLSI 2026**, organized by the **Department of Electronics Engineering (VLSI Design & Technology)** at **Chh Shahu College of Engineering**, Aurangabad.

## Overview

A professional, responsive, multi-page static website showcasing the departmental event, competitions, schedule, and registration system.

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero section, event highlights, competition preview, countdown, schedule overview |
| About | `about.html` | Department overview, vision & mission, VLSI importance, labs |
| Event Overview | `event-overview.html` | Event purpose, theme, objectives, participating departments |
| Competitions | `competitions.html` | Detailed competition cards with rules & registration links |
| Schedule | `schedule.html` | Full event timeline (table on desktop, cards on mobile) |
| Registration | `registration.html` | Registration form with validation |
| Rules | `rules.html` | General and per-competition rules with accordions |
| Contact | `contact.html` | Coordinator details, department info, embedded map |

## Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Grid, Flexbox, animations
- **JavaScript** — Vanilla JS, IntersectionObserver, form validation
- **Google Fonts** — Inter + Playfair Display
- **Firebase** — Optional integration for form submissions

## Folder Structure

```
├── index.html, about.html, event-overview.html, ...
├── css/
│   ├── style.css          # Design system & global styles
│   ├── components.css     # Reusable UI components
│   ├── animations.css     # Scroll reveals & transitions
│   └── responsive.css     # Tablet & mobile breakpoints
├── js/
│   ├── navigation.js      # Sticky nav, hamburger menu
│   ├── main.js            # Scroll animations, scroll-to-top
│   ├── countdown.js       # Event countdown timer
│   ├── registration.js    # Form validation & submission
│   └── firebase-config.js # Firebase setup (placeholder)
├── assets/
│   ├── images/, icons/, docs/
└── README.md
```

## Setup

1. Clone or download the project
2. Open `index.html` in a browser
3. No build tools required — pure static files

### Optional: Firebase Integration

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Update `js/firebase-config.js` with your credentials
3. Add Firebase SDK scripts to your HTML files

## Customization

- **Colors**: Edit CSS variables in `css/style.css` `:root` block
- **Event Date**: Update in `js/countdown.js` and HTML content
- **Contact Details**: Update coordinator names/emails across HTML pages
- **Competitions**: Add/modify competition cards in `competitions.html`

## License

Built for departmental use at Chh Shahu College of Engineering.
