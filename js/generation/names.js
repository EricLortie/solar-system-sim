// Name Generation for celestial bodies

const NAME_PREFIXES = [
    'Kep', 'Zan', 'Vor', 'Nix', 'Tra', 'Hel', 'Cor', 'Bel', 'Aur', 'Cyr',
    'Dra', 'Ely', 'Fal', 'Gal', 'Ion', 'Jov', 'Lyr', 'Myr', 'Neb', 'Orb',
    'Pol', 'Qua', 'Rex', 'Sol', 'Tau', 'Uma', 'Vex', 'Wyr', 'Xen', 'Zep'
];

const NAME_MIDDLES = [
    'ar', 'en', 'ix', 'on', 'us', 'ia', 'or', 'an', 'el', 'is',
    'os', 'um', 'ius', 'era', 'ova', 'ith', 'eon', 'ala', 'eri', 'olo'
];

const NAME_SUFFIXES = [
    '', '', '', '', '-I', '-II', '-III', '-IV', '-V',
    ' Prime', ' Major', ' Minor', ' Alpha', ' Beta', '-7', '-9'
];

export function generateName(rng) {
    const prefix = rng.randomChoice(NAME_PREFIXES);
    const middle = rng.randomChoice(NAME_MIDDLES);
    const suffix = rng.randomChoice(NAME_SUFFIXES);
    return prefix + middle + suffix;
}

export function generateMoonName(planetName, moonIndex) {
    const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return `${planetName} ${numerals[moonIndex] || (moonIndex + 1)}`;
}
