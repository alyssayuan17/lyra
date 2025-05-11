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
    const [, letter, octave] = note.match(/^([A-G]#?)(\d)$/) || [];
    const index = noteNames.indexOf(letter);
    if (index === -1) { // -1 is returned when the letter is not found in the noteNames array
        return null; // return null because it wasn't a valid note name
    }
    return index + 12 * (parseInt(octave, 10) + 1);
}

export function midiToNote(midi) {
    const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const note = noteNames[midi % 12];
    const oct  = Math.floor(midi / 12) - 1;
    return note + oct;
}