// React and pitch detection library import
import React, { useState, useRef } from 'react';
import { AMDF } from 'pitchfinder';

function App() {
  // State to manage recording status, recorded audio URL, and detected vocal range
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [vocalRange, setVocalRange] = useState(null);
  const [healthTip, setHealthTip] = useState(''); // health tips

  // Refs to manage MediaRecorder and audio data chunks
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);

  // Starts recording user's microphone input
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    // Collect audio data as it becomes available
    mediaRecorderRef.current.ondataavailable = (e) => {
      chunks.current.push(e.data);
    };

    // When recording stops:
    mediaRecorderRef.current.onstop = async () => {
      // Convert recorded chunks into a usable Blob and generate a playback URL
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const getMidi = (freq) => Math.round(69 + 12 * Math.log2(freq / 440));

      // Convert min/max pitch to MIDI numbers
      const midiMin = getMidi(min);
      const midiMax = getMidi(max);

      // Clear previous tip
      setHealthTip('');

      // Add a health tip if user hits extreme highs or lows
      if (midiMax >= 84) { // if too high, provide reminder
        setHealthTip("Wow, you hit a really high note! Make sure to warm up and don’t strain your upper range.");
      } else if (midiMin <= 48) {
        setHealthTip("You sang super low! Make sure you're not forcing your chest voice — support with proper breath.");
      } else if (midiMax - midiMin > 24) {
        setHealthTip("Huge range! Great job — just remember to pace yourself when stretching both ends.");
      }

      setAudioURL(url);
      chunks.current = [];

      // Analyze the pitch data from the recorded audio
      const pitches = await detectPitchesFromBlob(blob);
      if (pitches.length === 0) return;

      // Find lowest and highest pitch values detected
      const min = Math.min(...pitches);
      const max = Math.max(...pitches);

      // Convert pitch frequencies into musical notes
      setVocalRange({
        low: noteFromPitch(min),
        high: noteFromPitch(max),
      });
    };

    // Start the actual recording
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  // Stops the recording
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  // Analyze the audio blob to detect pitch values
  const detectPitchesFromBlob = async (blob) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const float32Array = audioBuffer.getChannelData(0); // use the first audio channel

    const detectPitch = AMDF(); // use the AMDF pitch detection algorithm
    const sampleRate = audioBuffer.sampleRate;
    const stepSize = 1024; // frame size
    const pitches = [];

    // Iterate over the audio data in steps and detect pitch for each frame
    for (let i = 0; i < float32Array.length; i += stepSize) {
      const chunk = float32Array.slice(i, i + stepSize);
      const pitch = detectPitch(chunk, sampleRate);
      if (pitch) pitches.push(pitch);
    }

    return pitches;
  };

  // Converts a pitch frequency (Hz) into a readable musical note (e.g., C4, A5)
  const noteFromPitch = (frequency) => {
    const A4 = 440; // reference pitch for A4
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const semitonesFromA4 = 12 * Math.log2(frequency / A4);
    const noteIndex = Math.round(semitonesFromA4) + 57; // 57 = MIDI index of A4
    const octave = Math.floor(noteIndex / 12);
    const noteName = noteNames[noteIndex % 12];
    return `${noteName}${octave}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-extrabold text-indigo-800 mb-6">Lyra 🎙️</h1>

      {/* Start/Stop recording buttons */}
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

      {/* Audio playback */}
      {audioURL && (
        <div className="mt-6">
          <audio controls src={audioURL} className="w-full max-w-sm" />
        </div>
      )}

      {/* Display detected vocal range */}
      {vocalRange && (
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-gray-800">Your Vocal Range:</p>
          <p className="text-2xl text-indigo-700 font-bold mt-1">
            {vocalRange.low} – {vocalRange.high}
          </p>
          {vocalRange && (
            <div className="mt-6 text-center">
              <p className="text-lg font-semibold text-gray-800">Your Vocal Range:</p>
              <p className="text-2xl text-indigo-700 font-bold mt-1">
                {vocalRange.low} – {vocalRange.high}
              </p>

              {/* 🎯 Vocal health tip */}
              {healthTip && (
                <div className="mt-4 text-center max-w-md bg-yellow-100 border border-yellow-300 p-4 rounded shadow-sm mx-auto">
                  <p className="text-yellow-800 font-medium">{healthTip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
