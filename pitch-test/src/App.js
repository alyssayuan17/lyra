import React, { useEffect } from 'react';
import { YIN } from 'pitchfinder';

function App() {
  useEffect(() => {
    const detectPitch = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1);

      const detect = YIN();
      const sampleRate = audioContext.sampleRate;

      const validPitches = [];

      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        const pitch = detect(input, sampleRate);

        if (pitch && pitch > 65 && pitch < 1200) {
          validPitches.push(pitch);
          console.log("🎶 Valid pitch:", pitch);
        } else {
          console.log("🛑 Invalid pitch:", pitch);
        }
      };


      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        const pitch = detect(input, sampleRate);
        console.log('Pitch:', pitch);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    };

    detectPitch();
  }, []);

  return (
    <div className="App" style={{ textAlign: 'center', paddingTop: 100 }}>
      <h1>🎤 Pitch Test</h1>
      <p>Open your console and speak or sing.</p>
    </div>
  );
}

export default App;
