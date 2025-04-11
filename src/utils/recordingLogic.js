import { YIN } from "pitchfinder";
import { computeRMS, getMidi } from "./audioUtils";
import { noteFromPitch } from "./noteUtils";
import { getAccessToken } from "./spotifyAuth";
import { searchSongs } from "./spotifySearch";

const ENERGY_THRESHOLD = 0.005;

export const startRecording = async ({
  mediaRecorderRef,
  chunks,
  audioContextRef,
  sourceRef,
  processorRef,
  detectedPitchesRef,
  setIsRecording,
  setAudioURL,
}) => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorderRef.current = new MediaRecorder(stream);
  mediaRecorderRef.current.ondataavailable = (e) => {
    chunks.current.push(e.data);
  };
  mediaRecorderRef.current.onstop = () => {
    const blob = new Blob(chunks.current, { type: "audio/webm" });
    chunks.current = [];
    const url = URL.createObjectURL(blob);
    setAudioURL(url);
  };
  mediaRecorderRef.current.start();

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(2048, 1, 1);
  const detect = YIN();
  const sampleRate = audioContext.sampleRate;

  detectedPitchesRef.current = [];

  processor.onaudioprocess = (event) => {
    const input = event.inputBuffer.getChannelData(0);
    const rms = computeRMS(input);
    if (rms < ENERGY_THRESHOLD) return;
    const pitch = detect(input, sampleRate);
    if (pitch && pitch > 65 && pitch < 1200) {
      detectedPitchesRef.current.push(pitch);
    }
  };

  source.connect(processor);
  processor.connect(audioContext.destination);

  audioContextRef.current = audioContext;
  sourceRef.current = source;
  processorRef.current = processor;

  setIsRecording(true);
};

export const stopRecording = async ({
  mediaRecorderRef,
  audioContextRef,
  processorRef,
  sourceRef,
  detectedPitchesRef,
  setIsRecording,
  setVocalRange,
  setHealthTip,
  setRecommended,
}) => {
  mediaRecorderRef.current?.stop();
  setIsRecording(false);

  try {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    audioContextRef.current?.close();
  } catch (e) {
    console.warn("Audio cleanup failed:", e);
  }

  const pitches = detectedPitchesRef.current || [];

  if (pitches.length === 0) {
    setVocalRange({ low: "N/A", high: "N/A" });
    setHealthTip("We couldn't detect a clear pitch. Try singing a longer or more sustained tone.");
    return;
  }

  const sorted = pitches.slice().sort((a, b) => a - b);
  const low = sorted[Math.floor(sorted.length * 0.1)];
  const high = sorted[Math.floor(sorted.length * 0.9)];
  const midiMin = getMidi(low);
  const midiMax = getMidi(high);

  let tip = "";
  if (midiMax >= 84) {
    tip = "Wow, you hit a really high note! Make sure to warm up and don’t strain your upper range.";
  } else if (midiMin <= 48) {
    tip = "You sang super low! Make sure you're not forcing your chest voice — support with proper breath.";
  } else if (midiMax - midiMin > 24) {
    tip = "Huge range! Great job — just remember to pace yourself when stretching both ends.";
  }
  setHealthTip(tip);

  const lowNote = noteFromPitch(low);
  const highNote = noteFromPitch(high);
  setVocalRange({ low: lowNote, high: highNote });

  const token = await getAccessToken();
  const results = await searchSongs("pop female vocal", token);
  setRecommended(results);
};
