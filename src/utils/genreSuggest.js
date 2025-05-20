import { noteToMidi } from "../utils/noteUtils";

// given a low/high note, return 2–3 genres that fit that range

export function suggestGenres({ low, high }) {
    const lowMidi = noteToMidi(low) || 0;
    const highMidi = noteToMidi(high) || 0;
    const avgMidi = (lowMidi + highMidi) / 2;

    const genres = [];

    // deeper voices
    if (avgMidi < 55) {
        genres.push('jazz', 'R&B', 'soul');
    }

    // mid‐range voices
    if (avgMidi >= 55 && avgMidi < 70) {
        genres.push('pop', 'folk', 'musical theatre');
    }

    // higher voices
    if (avgMidi >= 70) {
        genres.push('classical', 'opera', 'electronic');
    }

    return Array.from(new Set(genres)).slice(0, 3)
}