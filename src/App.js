// Import React hooks and pitch detection algorithm
import React, { useState, useRef } from 'react';
import { YIN } from 'pitchfinder'; // try YIN instead of AMDF

function App() {
  // States for UI and data
  const [isRecording, setIsRecording] = useState(false); // is mic active?
  const [audioURL, setAudioURL] = useState(''); // audio playback URL
  const [vocalRange, setVocalRange] = useState(null); // lowest-highest pitch range
  const [healthTip, setHealthTip] = useState(''); // health message

  // Refs for recording logic
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);

  // Refs for realtime pitch detection
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const detectedPitchesRef = useRef([]); // ✅ Use this instead of ._pitches

  // Energy threshold for voiced segments (adjust as needed)
  const ENERGY_THRESHOLD = 0.005;

  // Helper function to compute RMS energy of a chunk
  const computeRMS = (chunk) => {
    const sumSquares = chunk.reduce((sum, sample) => sum + sample * sample, 0);
    return Math.sqrt(sumSquares / chunk.length);
  };

  // Start mic recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Start media recording for audio playback
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (e) => {
      chunks.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      chunks.current = [];
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
    };
    mediaRecorderRef.current.start();

    // Start live pitch detection
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(2048, 1, 1);
    const detect = YIN();
    const sampleRate = audioContext.sampleRate;

    detectedPitchesRef.current = []; // Reset pitch store

    processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      const rms = computeRMS(input);

      if (rms < ENERGY_THRESHOLD) return;

      const pitch = detect(input, sampleRate);
      if (pitch && pitch > 65 && pitch < 1200) {
        detectedPitchesRef.current.push(pitch);
        console.log("Detected pitch:", pitch);
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    // Save nodes for cleanup later
    audioContextRef.current = audioContext;
    sourceRef.current = source;
    processorRef.current = processor;

    setIsRecording(true);
  };

  // Stop recording when button is clicked
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);

    // Safely disconnect realtime audio nodes
    try {
      processorRef.current?.disconnect();
      sourceRef.current?.disconnect();
      audioContextRef.current?.close();
    } catch (e) {
      console.warn("Audio node cleanup failed:", e);
    }

    const pitches = detectedPitchesRef.current || [];
    console.log("Final captured valid pitches:", pitches);

    if (pitches.length === 0) {
      setVocalRange({ low: "N/A", high: "N/A" });
      setHealthTip("We couldn't detect a clear pitch. Try singing a longer or more sustained tone.");
      return;
    }

    // Process vocal range from valid pitches
    const sortedPitches = pitches.slice().sort((a, b) => a - b);
    const lowIndex = Math.floor(sortedPitches.length * 0.1);
    const highIndex = Math.floor(sortedPitches.length * 0.9);
    const robustMin = sortedPitches[lowIndex];
    const robustMax = sortedPitches[highIndex];

    const getMidi = (freq) => Math.round(69 + 12 * Math.log2(freq / 440));
    const midiMin = getMidi(robustMin);
    const midiMax = getMidi(robustMax);

    // Show helpful health tip based on range
    let tip = "";
    if (midiMax >= 84) {
      tip = "Wow, you hit a really high note! Make sure to warm up and don’t strain your upper range.";
    } else if (midiMin <= 48) {
      tip = "You sang super low! Make sure you're not forcing your chest voice — support with proper breath.";
    } else if (midiMax - midiMin > 24) {
      tip = "Huge range! Great job — just remember to pace yourself when stretching both ends.";
    }
    setHealthTip(tip);

    // Get note names using the robust measurements
    const lowNote = noteFromPitch(robustMin);
    const highNote = noteFromPitch(robustMax);
    if (!lowNote || !highNote) {
      setVocalRange({ low: "N/A", high: "N/A" });
    } else {
      setVocalRange({ low: lowNote, high: highNote });
    }
  };

  // Convert frequency to readable note name (e.g., C4, A5)
  const noteFromPitch = (frequency) => {
    if (!frequency || frequency <= 0) {
      return null;
    }
    const A4 = 440;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const semitonesFromA4 = 12 * Math.log2(frequency / A4);
    const noteIndex = ((Math.round(semitonesFromA4) % 12) + 12) % 12;
    const octave = 4 + Math.floor((Math.round(semitonesFromA4) + 9) / 12);
    return noteNames[noteIndex] + octave;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-extrabold text-indigo-800 mb-6">Lyra 🎙️</h1>

      {/* Start / Stop recording button */}
      <div className="flex gap-4">
        {isRecording ? (
          <button onClick={stopRecording} className="bg-red-500 text-white px-4 py-2 rounded">
            Stop Recording
          </button>
        ) : (
          <button onClick={startRecording} className="bg-indigo-500 text-white px-4 py-2 rounded">
            Start Recording
          </button>
        )}
      </div>

      {/* Playback audio once recorded */}
      {audioURL && (
        <div className="mt-6">
          <audio controls src={audioURL} className="w-full max-w-sm" />
        </div>
      )}

      {/* Display vocal range + health tip */}
      {vocalRange && (
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-gray-800">Your Vocal Range:</p>
          <p className="text-2xl text-indigo-700 font-bold mt-1">
            {vocalRange.low} – {vocalRange.high}
          </p>

          {healthTip && (
            <div className="mt-4 text-center max-w-md bg-yellow-100 border border-yellow-300 p-4 rounded shadow-sm mx-auto">
              <p className="text-yellow-800 font-medium">{healthTip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
