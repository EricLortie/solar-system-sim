# Solar System Simulator

An interactive, browser-based solar system simulator with procedurally generated star systems, physics-based orbital mechanics, and rich visualization controls.

**[Live Demo](https://yourusername.github.io/solar-system-sim/)** *(update after enabling GitHub Pages)*

![Solar System Simulator Screenshot](screenshot.png)

## Features

### Celestial Bodies
- **7 Star Classes** - O, B, A, F, G, K, M (blue supergiants to red dwarfs)
- **8 Planet Types** - Gas giants, ice giants, terrestrial, rocky, lava worlds, ocean worlds, ice worlds, and dwarf planets
- **4 Moon Types** - Rocky, icy, volcanic, and captured asteroids
- **Comets** - With physics-based tail activation near the star
- **Asteroid Belts** - Placed in resonance gaps between planets
- **Kuiper Belts** - Beyond the outermost planet
- **Binary Star Systems** - Chance of secondary companion stars

### Physics
- **Kepler's Laws** - Orbital periods calculated from semi-major axis and star mass
- **Hill Spheres** - Planet spacing based on gravitational influence zones
- **Frost Line** - Planet types determined by distance from star and ice condensation boundary
- **Resonance Gaps** - Asteroid belts avoid unstable orbital resonances (like Kirkwood gaps)
- **Habitable Zones** - Calculated based on stellar luminosity

### System Archetypes
- **Solar System Type** - Rocky inner planets, gas giants beyond frost line
- **Hot Jupiter** - Gas giant very close to star, few other planets
- **Super-Earth** - Multiple large rocky planets, tightly packed
- **Compact Multi-Planet** - Many small planets in tight orbits (like TRAPPIST-1)
- **Sparse System** - Few widely-spaced planets

### Visualization
- 3D camera controls (tilt, rotation, zoom, pan)
- Cinematic auto-camera mode
- Preset camera views (top-down, edge-on, dramatic angle)
- Toggleable orbit paths, labels, habitable zones
- Planet surface details (ice caps, storms, craters, bands)
- Star flares and corona effects
- Mini-map navigation

### Controls
- Mouse wheel to zoom
- Click and drag to pan
- Click planet to select and view details
- Double-click to focus on planet
- Seed input for reproducible systems
- Time speed control
- Fullscreen mode
- Screenshot capture

## Usage

Just open `index.html` in any modern browser. No build step, no dependencies, no server required.

Click **Generate System** to create a new random solar system, or enter a seed for reproducibility.

## Keyboard Shortcuts

- `R` - Reset camera view
- `G` - Generate new system
- `O` - Toggle orbit paths
- `L` - Toggle labels
- `H` - Toggle habitable zone
- `F` - Toggle fullscreen
- `Space` - Pause/resume simulation
- `Escape` - Deselect / exit modes

## Technical Details

- Pure vanilla JavaScript (ES6+)
- HTML5 Canvas 2D rendering
- Single-file architecture (~3400 lines)
- No external dependencies

## Vibecoded

This entire project was vibecoded by [Claude](https://claude.ai) (Opus 4.5), Anthropic's AI assistant, through natural language conversation. No human-written code - just vibes and iteration.

## License

MIT License - do whatever you want with it.
