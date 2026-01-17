// Comet Type Definitions

export const COMET_TYPES = {
    waterIce: {
        name: 'Water Ice Comet',
        color: '#aaddff',
        tailColor: { r: 170, g: 220, b: 255 },
        dustColor: { r: 255, g: 220, b: 180 },
        volatility: 1.0,  // How easily it sublimates (affects tail activation distance)
        tailBrightness: 1.0
    },
    carbonDioxide: {
        name: 'CO2 Ice Comet',
        color: '#ddddff',
        tailColor: { r: 200, g: 200, b: 255 },
        dustColor: { r: 220, g: 200, b: 180 },
        volatility: 1.5,  // CO2 sublimates further from star
        tailBrightness: 0.8
    },
    methane: {
        name: 'Methane Ice Comet',
        color: '#aaffdd',
        tailColor: { r: 170, g: 255, b: 220 },
        dustColor: { r: 200, g: 220, b: 180 },
        volatility: 2.0,  // Methane is very volatile
        tailBrightness: 0.6
    },
    mixed: {
        name: 'Mixed Composition Comet',
        color: '#ccddee',
        tailColor: { r: 200, g: 220, b: 240 },
        dustColor: { r: 240, g: 220, b: 200 },
        volatility: 1.2,
        tailBrightness: 0.9
    }
};
