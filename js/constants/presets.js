// Preset Solar Systems
// Real astronomical data for reproducible systems

import { PHYSICS } from './physics.js';

// Sol System - Our Solar System with accurate data
export const SOL_SYSTEM = {
    name: 'Sol System',
    seed: 'sol',
    aliases: ['solar system', 'sol', 'sun', 'our system'],

    star: {
        name: 'Sol',
        class: 'G',
        fullName: 'G2V Yellow Dwarf',
        temperature: 5778,
        mass: 1.0,
        radius: 1.0,
        luminosity: 1.0,
        color: '#fff4ea',
        // Calculated values
        frostLine: 2.7,  // ~2.7 AU for Sun
        habitableZoneInner: 0.95,
        habitableZoneOuter: 1.37,
        innerLimit: 0.1
    },

    planets: [
        {
            name: 'Mercury',
            type: 'rocky',
            orbitRadiusAU: 0.387,
            radius: 0.383,
            mass: 0.055,
            eccentricity: 0.206,
            color: '#b0a090',
            atmosphere: 'None',
            composition: { rock: 0.68, metal: 0.32 },
            hasRings: false,
            moons: []
        },
        {
            name: 'Venus',
            type: 'terrestrial',
            orbitRadiusAU: 0.723,
            radius: 0.949,
            mass: 0.815,
            eccentricity: 0.007,
            color: '#e6c87a',
            atmosphere: 'Carbon Dioxide',
            composition: { rock: 0.70, metal: 0.25, volatiles: 0.05 },
            hasRings: false,
            moons: []
        },
        {
            name: 'Earth',
            type: 'terrestrial',
            orbitRadiusAU: 1.0,
            radius: 1.0,
            mass: 1.0,
            eccentricity: 0.017,
            color: '#5d9b9b',
            atmosphere: 'Nitrogen/Oxygen',
            composition: { rock: 0.67, metal: 0.32, water: 0.01 },
            hasRings: false,
            moons: [
                { name: 'Luna', type: 'rocky', orbitRadius: 30, size: 0.273, color: '#c0c0c0' }
            ]
        },
        {
            name: 'Mars',
            type: 'rocky',
            orbitRadiusAU: 1.524,
            radius: 0.532,
            mass: 0.107,
            eccentricity: 0.093,
            color: '#c1440e',
            atmosphere: 'Thin Carbon Dioxide',
            composition: { rock: 0.73, metal: 0.22, ice: 0.05 },
            hasRings: false,
            moons: [
                { name: 'Phobos', type: 'captured', orbitRadius: 8, size: 0.02, color: '#696969' },
                { name: 'Deimos', type: 'captured', orbitRadius: 12, size: 0.01, color: '#778899' }
            ]
        },
        {
            name: 'Jupiter',
            type: 'gasGiant',
            orbitRadiusAU: 5.203,
            radius: 11.21,
            mass: 317.8,
            eccentricity: 0.049,
            color: '#e8c48a',
            atmosphere: 'Hydrogen/Helium',
            composition: { hydrogen: 0.75, helium: 0.24, other: 0.01 },
            hasRings: true,
            hasBands: true,
            hasStorm: true,
            stormSize: 0.25,
            moons: [
                { name: 'Io', type: 'volcanic', orbitRadius: 35, size: 0.286, color: '#ffa500' },
                { name: 'Europa', type: 'icy', orbitRadius: 45, size: 0.245, color: '#e8f4f8' },
                { name: 'Ganymede', type: 'icy', orbitRadius: 60, size: 0.413, color: '#c0c0c0' },
                { name: 'Callisto', type: 'rocky', orbitRadius: 80, size: 0.378, color: '#808080' }
            ]
        },
        {
            name: 'Saturn',
            type: 'gasGiant',
            orbitRadiusAU: 9.537,
            radius: 9.45,
            mass: 95.2,
            eccentricity: 0.054,
            color: '#f4d9a0',
            atmosphere: 'Hydrogen/Helium',
            composition: { hydrogen: 0.75, helium: 0.24, other: 0.01 },
            hasRings: true,
            prominentRings: true,  // Saturn's famous rings
            hasBands: true,
            moons: [
                { name: 'Mimas', type: 'icy', orbitRadius: 25, size: 0.03, color: '#e8f4f8' },
                { name: 'Enceladus', type: 'icy', orbitRadius: 30, size: 0.04, color: '#f0f8ff' },
                { name: 'Tethys', type: 'icy', orbitRadius: 35, size: 0.08, color: '#e0e8f0' },
                { name: 'Dione', type: 'icy', orbitRadius: 40, size: 0.09, color: '#d0e0e8' },
                { name: 'Rhea', type: 'icy', orbitRadius: 50, size: 0.12, color: '#c8d8e0' },
                { name: 'Titan', type: 'icy', orbitRadius: 70, size: 0.404, color: '#e6a550' },
                { name: 'Iapetus', type: 'icy', orbitRadius: 100, size: 0.115, color: '#a0a0a0' }
            ]
        },
        {
            name: 'Uranus',
            type: 'iceGiant',
            orbitRadiusAU: 19.19,
            radius: 4.01,
            mass: 14.5,
            eccentricity: 0.047,
            color: '#7ec8e3',
            atmosphere: 'Hydrogen/Methane',
            composition: { hydrogen: 0.15, helium: 0.15, water: 0.35, ammonia: 0.2, methane: 0.15 },
            hasRings: true,
            moons: [
                { name: 'Miranda', type: 'icy', orbitRadius: 20, size: 0.037, color: '#c0c0c0' },
                { name: 'Ariel', type: 'icy', orbitRadius: 25, size: 0.091, color: '#d0d0d0' },
                { name: 'Umbriel', type: 'icy', orbitRadius: 30, size: 0.092, color: '#909090' },
                { name: 'Titania', type: 'icy', orbitRadius: 40, size: 0.124, color: '#b0b0b0' },
                { name: 'Oberon', type: 'icy', orbitRadius: 50, size: 0.119, color: '#a0a0a0' }
            ]
        },
        {
            name: 'Neptune',
            type: 'iceGiant',
            orbitRadiusAU: 30.07,
            radius: 3.88,
            mass: 17.1,
            eccentricity: 0.009,
            color: '#4169e1',
            atmosphere: 'Hydrogen/Methane',
            composition: { hydrogen: 0.15, helium: 0.15, water: 0.35, ammonia: 0.2, methane: 0.15 },
            hasRings: true,
            hasStorm: true,  // Great Dark Spot
            stormSize: 0.2,
            moons: [
                { name: 'Triton', type: 'icy', orbitRadius: 40, size: 0.212, color: '#d8bfd8' }
            ]
        }
    ],

    // Asteroid belt between Mars and Jupiter
    asteroidBelt: {
        innerRadius: 2.1,
        outerRadius: 3.3,
        count: 200,
        color: '#888888'
    },

    // Kuiper belt beyond Neptune
    kuiperBelt: {
        innerRadius: 30,
        outerRadius: 50,
        count: 150,
        color: '#aaaaaa'
    },

    // Notable comets
    comets: [
        { name: "Halley's Comet", perihelion: 0.586, aphelion: 35.1, eccentricity: 0.967 },
        { name: 'Hale-Bopp', perihelion: 0.914, aphelion: 370, eccentricity: 0.995 }
    ]
};

// TRAPPIST-1 System - Famous compact multi-planet system
export const TRAPPIST1_SYSTEM = {
    name: 'TRAPPIST-1 System',
    seed: 'trappist-1',
    aliases: ['trappist', 'trappist1', 'trappist-1'],

    star: {
        name: 'TRAPPIST-1',
        class: 'M',
        fullName: 'M8V Red Dwarf',
        temperature: 2566,
        mass: 0.089,
        radius: 0.121,
        luminosity: 0.000525,
        color: '#ffcc6f',
        frostLine: 0.03,
        habitableZoneInner: 0.022,
        habitableZoneOuter: 0.048,
        innerLimit: 0.005
    },

    planets: [
        { name: 'TRAPPIST-1b', type: 'rocky', orbitRadiusAU: 0.0115, radius: 1.12, mass: 1.02, eccentricity: 0.006, color: '#a08070', atmosphere: 'None', composition: { rock: 0.7, metal: 0.3 }, hasRings: false, moons: [] },
        { name: 'TRAPPIST-1c', type: 'rocky', orbitRadiusAU: 0.0158, radius: 1.10, mass: 1.38, eccentricity: 0.007, color: '#908070', atmosphere: 'Thin Carbon Dioxide', composition: { rock: 0.7, metal: 0.3 }, hasRings: false, moons: [] },
        { name: 'TRAPPIST-1d', type: 'terrestrial', orbitRadiusAU: 0.0223, radius: 0.77, mass: 0.41, eccentricity: 0.008, color: '#6b8e6b', atmosphere: 'Nitrogen', composition: { rock: 0.6, metal: 0.2, water: 0.2 }, hasRings: false, moons: [] },
        { name: 'TRAPPIST-1e', type: 'terrestrial', orbitRadiusAU: 0.0293, radius: 0.91, mass: 0.62, eccentricity: 0.005, color: '#5d9b9b', atmosphere: 'Nitrogen/Oxygen', composition: { rock: 0.6, metal: 0.2, water: 0.2 }, hasRings: false, moons: [] },
        { name: 'TRAPPIST-1f', type: 'oceanWorld', orbitRadiusAU: 0.0385, radius: 1.05, mass: 0.68, eccentricity: 0.010, color: '#4a90d9', atmosphere: 'Nitrogen/Water Vapor', composition: { water: 0.5, rock: 0.4, metal: 0.1 }, hasRings: false, moons: [] },
        { name: 'TRAPPIST-1g', type: 'iceWorld', orbitRadiusAU: 0.0469, radius: 1.13, mass: 1.34, eccentricity: 0.002, color: '#b0e0e6', atmosphere: 'Nitrogen', composition: { ice: 0.4, rock: 0.5, metal: 0.1 }, hasRings: false, moons: [] },
        { name: 'TRAPPIST-1h', type: 'iceWorld', orbitRadiusAU: 0.0619, radius: 0.77, mass: 0.33, eccentricity: 0.006, color: '#e0ffff', atmosphere: 'None', composition: { ice: 0.6, rock: 0.35, metal: 0.05 }, hasRings: false, moons: [] }
    ],

    asteroidBelt: null,
    kuiperBelt: null,
    comets: []
};

// Kepler-90 System - Another 8-planet system
export const KEPLER90_SYSTEM = {
    name: 'Kepler-90 System',
    seed: 'kepler-90',
    aliases: ['kepler90', 'kepler-90'],

    star: {
        name: 'Kepler-90',
        class: 'G',
        fullName: 'G0V Yellow Dwarf',
        temperature: 6080,
        mass: 1.2,
        radius: 1.2,
        luminosity: 1.6,
        color: '#fff8e8',
        frostLine: 3.4,
        habitableZoneInner: 1.1,
        habitableZoneOuter: 1.6,
        innerLimit: 0.05
    },

    planets: [
        { name: 'Kepler-90b', type: 'rocky', orbitRadiusAU: 0.074, radius: 1.31, mass: 2.0, eccentricity: 0.01, color: '#c08060', atmosphere: 'None', composition: { rock: 0.7, metal: 0.3 }, hasRings: false, moons: [] },
        { name: 'Kepler-90c', type: 'terrestrial', orbitRadiusAU: 0.089, radius: 1.18, mass: 1.5, eccentricity: 0.01, color: '#a09080', atmosphere: 'Thin Carbon Dioxide', composition: { rock: 0.7, metal: 0.3 }, hasRings: false, moons: [] },
        { name: 'Kepler-90i', type: 'terrestrial', orbitRadiusAU: 0.1234, radius: 1.32, mass: 2.0, eccentricity: 0.01, color: '#908570', atmosphere: 'Carbon Dioxide', composition: { rock: 0.65, metal: 0.35 }, hasRings: false, moons: [] },
        { name: 'Kepler-90d', type: 'terrestrial', orbitRadiusAU: 0.32, radius: 2.88, mass: 8.0, eccentricity: 0.02, color: '#7a9a7a', atmosphere: 'Nitrogen', composition: { rock: 0.6, metal: 0.25, water: 0.15 }, hasRings: false, moons: [] },
        { name: 'Kepler-90e', type: 'iceGiant', orbitRadiusAU: 0.42, radius: 2.67, mass: 7.0, eccentricity: 0.02, color: '#7ec8e3', atmosphere: 'Hydrogen/Methane', composition: { hydrogen: 0.2, helium: 0.1, water: 0.4, ammonia: 0.15, methane: 0.15 }, hasRings: false, moons: [] },
        { name: 'Kepler-90f', type: 'iceGiant', orbitRadiusAU: 0.48, radius: 2.89, mass: 8.0, eccentricity: 0.02, color: '#85c1e9', atmosphere: 'Hydrogen/Methane', composition: { hydrogen: 0.2, helium: 0.1, water: 0.4, ammonia: 0.15, methane: 0.15 }, hasRings: false, moons: [] },
        { name: 'Kepler-90g', type: 'gasGiant', orbitRadiusAU: 0.71, radius: 8.13, mass: 150, eccentricity: 0.03, color: '#deb887', atmosphere: 'Hydrogen/Helium', composition: { hydrogen: 0.75, helium: 0.24, other: 0.01 }, hasRings: true, hasBands: true, moons: [] },
        { name: 'Kepler-90h', type: 'gasGiant', orbitRadiusAU: 1.01, radius: 11.32, mass: 300, eccentricity: 0.03, color: '#e8c48a', atmosphere: 'Hydrogen/Helium', composition: { hydrogen: 0.75, helium: 0.24, other: 0.01 }, hasRings: true, hasBands: true, moons: [] }
    ],

    asteroidBelt: null,
    kuiperBelt: { innerRadius: 2.0, outerRadius: 4.0, count: 80, color: '#aaaaaa' },
    comets: []
};

// All available presets
export const SYSTEM_PRESETS = {
    'sol': SOL_SYSTEM,
    'trappist-1': TRAPPIST1_SYSTEM,
    'kepler-90': KEPLER90_SYSTEM
};

// Check if a seed matches a preset
export function getPresetForSeed(seed) {
    if (!seed) return null;

    const normalizedSeed = String(seed).toLowerCase().trim();

    // Direct match
    if (SYSTEM_PRESETS[normalizedSeed]) {
        return SYSTEM_PRESETS[normalizedSeed];
    }

    // Check aliases
    for (const preset of Object.values(SYSTEM_PRESETS)) {
        if (preset.aliases && preset.aliases.includes(normalizedSeed)) {
            return preset;
        }
    }

    return null;
}

// Get list of available preset names for UI
export function getPresetNames() {
    return Object.values(SYSTEM_PRESETS).map(p => ({
        seed: p.seed,
        name: p.name
    }));
}
