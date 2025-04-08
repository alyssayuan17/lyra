// Import React hooks and pitch detection algorithm
import React, { useState, useRef } from 'react';
import { AMDF } from 'pitchfinder';

function App() {
  // States for UI and data
  const [isRecording, setIsRecording] = useState(false); // is mic active?
  const [audioURL, setAudioURL] = useState(''); // audio playback URL
  const [vocalRange, setVocalRange] = useState(null); // lowest-highest pitch range
  const [healthTip, setHealthTip] = useState(''); // health message

  // Refs for recording logic
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);

  // Start mic recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    // Push audio chunks as they come in
    mediaRecorderRef.current.ondataavailable = (e) => {
      chunks.current.push(e.data);
    };

    // When recording stops, analyze audio
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      chunks.current = [];

      // Detect pitch values from the audio
      const pitches = await detectPitchesFromBlob(blob);
      if (pitches.length === 0) return;

      // Find the lowest and highest pitch
      const min = Math.min(...pitches);
      const max = Math.max(...pitches);

      // Convert pitch to MIDI to determine vocal strain
      const getMidi = (freq) => Math.round(69 + 12 * Math.log2(freq / 440));
      const midiMin = getMidi(min);
      const midiMax = getMidi(max);

      // Show helpful health tip based on range
      setHealthTip('');
      if (midiMax >= 84) {
        setHealthTip("Wow, you hit a really high note! Make sure to warm up and don’t strain your upper range.");
      } else if (midiMin <= 48) {
        setHealthTip("You sang super low! Make sure you're not forcing your chest voice — support with proper breath.");
      } else if (midiMax - midiMin > 24) {
        setHealthTip("Huge range! Great job — just remember to pace yourself when stretching both ends.");
      }

      // Set the vocal range for display
      setVocalRange({
        low: noteFromPitch(min),
        high: noteFromPitch(max),
      });
    };

    // Begin recording
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  // Stop recording when button is clicked
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  // Convert recorded audio blob → array of pitch values
  const detectPitchesFromBlob = async (blob) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const float32Array = audioBuffer.getChannelData(0);

    const detectPitch = AMDF(); // use AMDF pitch detection
    const sampleRate = audioBuffer.sampleRate;
    const stepSize = 1024;
    const pitches = [];

    // Loop through audio chunks to find pitch
    for (let i = 0; i < float32Array.length; i += stepSize) {
      const chunk = float32Array.slice(i, i + stepSize);
      const pitch = detectPitch(chunk, sampleRate);
      if (pitch) pitches.push(pitch);
    }

    return pitches;
  };

  // Convert frequency to readable note name (e.g., C4, A5)
  const noteFromPitch = (frequency) => {
    const A4 = 440;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const semitonesFromA4 = 12 * Math.log2(frequency / A4);
    const noteIndex = Math.round(semitonesFromA4) % 12;
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
