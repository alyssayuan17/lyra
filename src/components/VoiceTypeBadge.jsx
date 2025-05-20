import React from 'react'
import { noteToMidi } from '../utils/noteUtils'

/**
 * thesholds
 * Soprano: high ≥ A5 (MIDI 81)
 * Mezzo: high ≥ F5 (MIDI 77)
 * Alto: high ≥ C4 (MIDI 60)
 * Tenor: high ≥ C3 (MIDI 48)
 * Bass: everything else
 */

function getVoiceType (lowNote, highNote) {
    // convert to Midi 
    const lowMidi = noteToMidi(lowNote) || 0;
    const highMidi = noteToMidi(highNote) || 0;

    if (highMidi >= 81) {
        return 'Soprano';
    }

    if (highMidi >= 77) {
        return 'Mezzo-Soprano';
    }

    if (highMidi >= 60) {
        return 'Alto';
    }
    
    if (highMidi >= 48) {
        return 'Tenor';
    }

    return 'Base';
}

export default function VoiceTypeBadge({ vocalRange }) {
    if (!vocalRange) {
        return null;
    }
    const { low, high } = vocalRange;
    const type = getVoiceType(low, high);

    return (
        <div className = "inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
            {type}
        </div>
    )
}