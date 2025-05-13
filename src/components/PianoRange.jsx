import React from "react";
import { noteToMidi } from "../utils/noteUtils";

const WHITE_KEY_WIDTH = 30;
const WHITE_KEY_HEIGHT = 100;
const BLACK_KEY_WIDTH = 18;
const BLACK_KEY_HEIGHT = 60;
const BASE_MIDI = 48; // C3

export default function PianoRange({ lowNote, highNote, playProgress }) {
  // turn note names into midi numbers
  const lowMidi  = noteToMidi(lowNote);
  const highMidi = noteToMidi(highNote);

  // build an array of 2 octaves worth of keys
  const OCTAVES = 3;
  const allKeys = Array.from({ length: OCTAVES * 12 }, (_, i) => {
    const midi = BASE_MIDI + i;
    const isBlack = [1,3,6,8,10].includes(midi % 12);
    return {
      midi,
      isBlack
    };
  });

  // split white and black keys
  const whiteKeys = allKeys.filter(k => !k.isBlack);
  const blackKeys = allKeys.filter(k => k.isBlack);

  return (
    <svg
      width = {whiteKeys.length * WHITE_KEY_WIDTH}
      height = {WHITE_KEY_HEIGHT}
      style = {{ display: "block" }}
    >
        {/* white keys */}
        {whiteKeys.map((k, idx) => (
            <rect
            key = {k.midi}
            x = {idx * WHITE_KEY_WIDTH}
            y = {0}
            width = {WHITE_KEY_WIDTH}
            height = {WHITE_KEY_HEIGHT}
            fill = {k.midi >= lowMidi && k.midi <= highMidi ? "#a78bfa" : "#fff"}
            stroke = "#333"
            />
        ))}

        {/* black keys */}
        {/** draw blacks positioned between the white keys */}
        {blackKeys.map((k) => {
            const whiteBefore = whiteKeys.filter(w => w.midi < k.midi).length;
            const x = whiteBefore * WHITE_KEY_WIDTH - (BLACK_KEY_WIDTH / 2);
            return (
                <rect
                    key = {k.midi}
                    x = {x}
                    y = {0}
                    width = {BLACK_KEY_WIDTH}
                    height = {BLACK_KEY_HEIGHT}
                    fill = {k.midi >= lowMidi && k.midi <= highMidi ? "#7c3aed" : "#000"}
                />
            );
        })}

        {/* playhead line */}
        <line
            x1 = {playProgress * whiteKeys.length * WHITE_KEY_WIDTH}
            y1 = {0}
            x2 = {playProgress * whiteKeys.length * WHITE_KEY_WIDTH}
            y2 = {WHITE_KEY_HEIGHT}
            stroke = "red"
            strokeWidth = {2}
        />
    </svg>
  );
}
