import React from 'react'
import { noteToMidi, midiToKeyIndex } from '../utils/noteUtils'

const WHITE_KEY_WIDTH = 20
const WHITE_KEY_HEIGHT = 120
const BLACK_KEY_WIDTH = WHITE_KEY_WIDTH * 0.6
const BLACK_KEY_HEIGHT = 80
const BASE_MIDI = noteToMidi('C3') // 48, standard
const TOTAL_KEYS = 12 * 2 // two octaves

const isBlack = (m) => [1,3,6,8,10].includes(m % 12);

export default function PianoRange({ lowNote, highNote, currentPitch, playProgress }) {
    if (!lowNote || !highNote) {
        return null;
    }
    
    const lowMidi  = noteToMidi(lowNote);
    const highMidi = noteToMidi(highNote);
    const lowIdx   = midiToKeyIndex(lowMidi, BASE_MIDI);
    const highIdx  = midiToKeyIndex(highMidi, BASE_MIDI);

    // build key data
    const keys = Array.from({ length: TOTAL_KEYS }, (_, i) => {
        const midi    = BASE_MIDI + i;
        const isBlack = [1,3,6,8,10].includes(midi % 12);
        return {
          midi,
          isBlack,
          highlight: i >= lowIdx && i <= highIdx,
          x: i * WHITE_KEY_WIDTH
        };
    });

    const svgWidth  = TOTAL_KEYS * WHITE_KEY_WIDTH;
    const svgHeight = WHITE_KEY_HEIGHT;

    return (
        <svg width = {svgWidth} height = {svgHeight}>
            {/* white keys */}
            {keys.filter(k => !k.isBlack).map(k => (
                <rect
                key = {k.midi}
                x = {k.x}
                y = {0}
                width = {WHITE_KEY_WIDTH}
                height = {WHITE_KEY_HEIGHT}
                fill = {k.highlight ? '#a78bfa' : '#ffffff'}
                stroke = "#333"
                />
            ))}

            {/* black keys */}
            {keys.filter(k => k.isBlack).map(k => (
                <rect
                key = {k.midi}
                x = {k.x + WHITE_KEY_WIDTH - BLACK_KEY_WIDTH/2}
                y = {0}
                width = {BLACK_KEY_WIDTH}
                height = {BLACK_KEY_HEIGHT}
                fill = {k.highlight ? '#7c3aed' : '#000000'}
                />
            ))}

            {/* playhead */}
            <line
                x1 = {playProgress * svgWidth}
                y1 = {0}
                x2 = {playProgress * svgWidth}
                y2 = {svgHeight}
                stroke = "red"
                strokeWidth = {2}
            />
        </svg>
    );
}