export const noteFromPitch = (frequency) => {
    if (!frequency || frequency <= 0) return null;
    const A4 = 440;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const semitonesFromA4 = 12 * Math.log2(frequency / A4);
    const noteIndex = ((Math.round(semitonesFromA4) % 12) + 12) % 12;
    const octave = 4 + Math.floor((Math.round(semitonesFromA4) + 9) / 12);
    return noteNames[noteIndex] + octave;
};

export function noteToMidi(note) {
    if (!note) {
        return null;
    }
    const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const match = note.match(/^([A-G]#?)(\d)$/);
    if (!match) {
        return null;
    }
    const [, letter, octaveStr] = match;
    const octave = parseInt(octaveStr, 10); // converting the octave (string) into a number, in decimal base 10
    const index = noteNames.indexOf(letter);
    if (index === -1) { // -1 is returned when the letter is not found in the noteNames array
        return null; // return null because it wasn't a valid note name
    }
    return index + (octave + 1)*12; // +1 to shift everything up; so note-to-MIDI math matches standard MIDI mapping
}

export function midiToKeyIndex(midi, baseMidi = 48 /*C3*/) {
    return midi - baseMidi;
}

export function midiToNote(midi) {
    const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const note = noteNames[midi % 12];
    const oct  = Math.floor(midi / 12) - 1;
    return note + oct;
}