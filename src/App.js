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

  // Energy threshold for voiced segments (adjust as needed)
  const ENERGY_THRESHOLD = 0.02;

  // Helper function to compute RMS energy of a chunk
  const computeRMS = (chunk) => {
    const sumSquares = chunk.reduce((sum, sample) => sum + sample * sample, 0);
    return Math.sqrt(sumSquares / chunk.length);
  };

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

      // Use percentiles to determine a more robust vocal range
      const sortedPitches = pitches.slice().sort((a, b) => a - b);
      const lowIndex = Math.floor(sortedPitches.length * 0.1);
      const highIndex = Math.floor(sortedPitches.length * 0.9);
      const robustMin = sortedPitches[lowIndex];
      const robustMax = sortedPitches[highIndex];
      
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

      // Get note names using the robust measurements
      const lowNote = noteFromPitch(robustMin);
      const highNote = noteFromPitch(robustMax);

      if (!lowNote || !highNote) { // In case neither return true
        // Handle the error case—set fallback values, log an error, etc.
        setVocalRange({ low: "N/A", high: "N/A" });
      } else {
        // Set the vocal range for display
        setVocalRange({
          low: lowNote,
          high: highNote,
        });
      }
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
    let audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // --- apply a high-frequency low-pass filter using OfflineAudioContext ---
    // create an offline context matching the decoded audio
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    // Create a source from the original buffer
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    // Create a BiquadFilter and set it as a low-pass filter
    const lowPassFilter = offlineContext.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.value = 2000; // Filter frequencies above 2000 Hz

    // Connect the nodes: source -> filter -> destination
    source.connect(lowPassFilter);
    lowPassFilter.connect(offlineContext.destination);

    // Start processing and render the filtered audio
    source.start();
    audioBuffer = await offlineContext.startRendering();

    // ----------------------------------------------------

    // Extract channel data from the filtered audioBuffer
    const float32Array = audioBuffer.getChannelData(0);
    // print length
    console.log('Filtered audio data length:', float32Array.length);
    
    const sampleRate = audioBuffer.sampleRate; // define, then call
    console.log('Sample rate:', sampleRate); // now it works

    const detectPitch = YIN(); // use YIN/AMDF pitch detection
    const stepSize = 512; // try smaller step size
    const pitches = [];

    // computing RMS per chunk
    const computeRMS = (chunk) => {
      const sumSquares = chunk.reduce((sum, sample) => sum + sample * sample, 0);
      return Math.sqrt(sumSquares / chunk.length);
    };
    const ENERGY_THRESHOLD = 0.02;

    // Loop through audio chunks to find pitch
    for (let i = 0; i < float32Array.length; i += stepSize) {
      const chunk = float32Array.slice(i, i + stepSize);
      const rms = computeRMS(chunk); // Compute the RMS energy of the current chunk
      if (rms < ENERGY_THRESHOLD) { // Skip chunks with low energy (likely unvoiced)
        continue;
      }
      const pitch = detectPitch(chunk, sampleRate);
      console.log(`Chunk ${i} - RMS: ${rms.toFixed(3)} - Pitch:`, pitch);
      if (pitch) {
        pitches.push(pitch);
      }
    }
    
    console.log('Raw detected pitches:', pitches);

    // Filter out any invalid pitches
    const validPitches = pitches.filter(f => f && f > 0);
    if (validPitches.length === 0) {
      console.log('No valid pitches detected.');
      return [];
    }
  
    console.log('Valid pitches:', validPitches);
    return validPitches;

  };

  // Convert frequency to readable note name (e.g., C4, A5)
  const noteFromPitch = (frequency) => {
    if (!frequency || frequency <= 0) {
      return null; 
    }
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
