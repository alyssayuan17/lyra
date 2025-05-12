import React from 'react'
import { noteToMidi } from '../utils/noteUtils'

const WHITE_KEY_WIDTH = 20
const WHITE_KEY_HEIGHT = 120
const BLACK_KEY_WIDTH = WHITE_KEY_WIDTH * 0.6
const BLACK_KEY_HEIGHT = 80
const BASE_MIDI = noteToMidi('C3') // 48, standard
const TOTAL_KEYS = 12 * 2 // two octaves

const isBlack = (m) => [1,3,6,8,10].includes(m % 12);

export default function PianoRange({ low, high, playProgress = 0}) {
    if (!low || !high) {
        return null;
    }
    const lowMidi  = noteToMidi(low)
    const highMidi = noteToMidi(high)

    // build key data
    const keys = Array.from({ length: TOTAL_KEYS }, (_, i) => {
        const midi = BASE_MIDI + i
        return {
        midi,
        x: i * WHITE_KEY_WIDTH,
        black: isBlack(midi),
        highlight: midi >= lowMidi && midi <= highMidi
        }
    })

    const svgWidth  = TOTAL_KEYS * WHITE_KEY_WIDTH
    const svgHeight = WHITE_KEY_HEIGHT

    return (
        <svg width={svgWidth} height={svgHeight}>
            {/* White keys */}
            {keys.filter(k => !k.black).map(k => (
                <rect
                key={k.midi}
                x={k.x}
                y={0}
                width={WHITE_KEY_WIDTH}
                height={WHITE_KEY_HEIGHT}
                fill={k.highlight ? '#a78bfa' : '#ffffff'}
                stroke="#333"
                />
            ))}

            {/* Black keys (drawn after so they sit on top) */}
            {keys.filter(k => k.black).map(k => (
                <rect
                key={k.midi}
                x={k.x + WHITE_KEY_WIDTH - BLACK_KEY_WIDTH/2}
                y={0}
                width={BLACK_KEY_WIDTH}
                height={BLACK_KEY_HEIGHT}
                fill={k.highlight ? '#7c3aed' : '#000000'}
                />
            ))}

            {/* Playhead line (0→1) */}
            <line
                x1={playProgress * svgWidth}
                y1={0}
                x2={playProgress * svgWidth}
                y2={svgHeight}
                stroke="red"
                strokeWidth={2}
            />
        </svg>
    )
}