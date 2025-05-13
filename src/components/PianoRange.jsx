import React, { useMemo } from 'react'
import { noteToMidi, midiToKeyIndex } from '../utils/noteUtils'

const WHITE_KEY_WIDTH = 20
const WHITE_KEY_HEIGHT = 120
const BLACK_KEY_WIDTH = WHITE_KEY_WIDTH * 0.6
const BLACK_KEY_HEIGHT = 80
const BASE_MIDI = noteToMidi('C3') // 48, standard
const TOTAL_KEYS = 12 * 2 // two octaves

export default function PianoRange({ lowNote, highNote, currentPitch, playProgress }) {
    
    const allKeys = useMemo(() => { // always call hook, even if lowNote/highNote are undefined
        if (!lowNote || !highNote) return []
    
        const lowMidi = noteToMidi(lowNote)
        const highMidi = noteToMidi(highNote)
        const lowIdx = midiToKeyIndex(lowMidi, BASE_MIDI)
        const highIdx = midiToKeyIndex(highMidi, BASE_MIDI)
    
        return Array.from({ length: TOTAL_KEYS }, (_, i) => {
            const midi = BASE_MIDI + i
            const isBlack = [1, 3, 6, 8, 10].includes(midi % 12)
            return {
                id: midi,
                isBlack,
                highlight: i >= lowIdx && i <= highIdx,
                x: i * WHITE_KEY_WIDTH,
            }
        })
    }, [lowNote, highNote])

    // bail out if can't get a valid range
    if (!lowNote || !highNote) {
        return null
    }

    return (
        <div className = "relative w-full h-full">
            {/* highlight layer (purple) */}
            <div className = "absolute inset-0 z-0 pointer-events-none">
                {allKeys.map(({ id, isBlack, highlight, x }) =>
                highlight ? (
                    <div
                        key = {`h-${id}`}
                        className="absolute bg-purple-400 opacity-75"
                        style = {{
                            left: `${x}px`,
                            width: `${isBlack ? BLACK_KEY_WIDTH : WHITE_KEY_WIDTH}px`,
                            height: `${isBlack ? BLACK_KEY_HEIGHT : WHITE_KEY_HEIGHT}px`,
                        }}
                    />
                ) : null
            )}
        </div>

        {/* white keys layer */}
        <div className="relative z-10 h-full">
            {allKeys
                .filter((k) => !k.isBlack)
                .map(({ id, x }) => (
                    <div
                        key = {`w-${id}`}
                        className = "absolute border border-gray-300 bg-white"
                        style = {{
                            left: `${x}px`,
                            width: `${WHITE_KEY_WIDTH}px`,
                            height: `${WHITE_KEY_HEIGHT}px`,
                        }}
                    />
                ))}
        </div>

        {/* black keys layer */}
        <div className = "absolute top-0 left-0 z-20 h-full">
            {allKeys
                .filter((k) => k.isBlack)
                .map(({ id, x }) => (
                    <div
                        key = {`b-${id}`}
                        className = "absolute bg-black"
                        style = {{
                            left: `${x + WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2}px`,
                            width: `${BLACK_KEY_WIDTH}px`,
                            height: `${BLACK_KEY_HEIGHT}px`,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}