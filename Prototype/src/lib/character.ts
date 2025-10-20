import paths from './assets/paths.json';

export interface CharacterPart {
    path: string;
    price: number;
}

export interface CharacterConfig {
    body: CharacterPart;
    hat: CharacterPart;
    shirt: CharacterPart;
}

export function getDefaultCharacter(): CharacterConfig {
    return {
        body: paths.body[0],  // Body 1
        hat: paths.hats[0],   // Hat 1
        shirt: paths.shirts[0] // Shirt 1
    };
}
