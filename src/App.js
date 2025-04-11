import React, { useState, useEffect, useRef } from 'react';
import RecordingControls from './components/RecordingControls';
import PlaybackPanel from './components/PlaybackPanel';
import HealthTip from './components/HealthTip';
import { startRecording, stopRecording } from "./utils/recordingLogic";

import { computeRMS, getMidi } from './utils/audioUtils';
import { noteFromPitch } from './utils/noteUtils';
import { getAccessToken } from './utils/spotifyAuth';
import { searchSongs } from './utils/spotifySearch';



function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [vocalRange, setVocalRange] = useState(null);
  const [healthTip, setHealthTip] = useState("");
  const [recommended, setRecommended] = useState([]);

  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const detectedPitchesRef = useRef([]);

  const handleStart = () => {
    startRecording({
      mediaRecorderRef,
      chunks,
      audioContextRef,
      sourceRef,
      processorRef,
      detectedPitchesRef,
      setIsRecording,
      setAudioURL,
      setRecommended,
    });
  };

  const handleStop = () => {
    stopRecording({
      mediaRecorderRef,
      audioContextRef,
      processorRef,
      sourceRef,
      detectedPitchesRef,
      setIsRecording,
      setVocalRange,
      setHealthTip,
      setRecommended,
    });
  };

  useEffect(() => {
    const fetchSpotifySongs = async () => {
      const token = await getAccessToken();
      const results = await searchSongs("belting female vocal", token);
      setRecommended(results);
    };
  
    fetchSpotifySongs();
  }, []);  

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white flex flex-col items-center justify-center px-6 py-12">
      <h1 className="text-4xl sm:text-5xl font-extrabold font-poppins text-indigo-800 mb-8 tracking-tight drop-shadow">
        Lyra <span role="img" aria-label="mic">🎙️</span>
      </h1>

      <RecordingControls
        isRecording={isRecording}
        startRecording={handleStart}
        stopRecording={handleStop}
      />

      <PlaybackPanel audioURL={audioURL} />

      {vocalRange && (
        <div className="mt-10 text-center space-y-4">
          <p className="text-lg font-semibold text-gray-700">Your Vocal Range:</p>
          <p className="text-3xl font-bold text-indigo-700">
            {vocalRange.low} – {vocalRange.high}
          </p>
          <HealthTip tip={healthTip} />
        </div>
      )}

      {recommended.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 max-w-2xl mx-auto">
          {recommended.map((track) => (
            <div key={track.id} className="bg-white shadow p-4 rounded-lg">
              <img src={track.album.images[0]?.url} alt={track.name} className="w-full rounded" />
              <p className="font-semibold mt-2">{track.name}</p>
              <p className="text-sm text-gray-500">{track.artists[0]?.name}</p>
              {track.preview_url && (
                <audio controls className="w-full mt-2">
                  <source src={track.preview_url} type="audio/mpeg" />
                </audio>
              )}
              <a
                href={track.external_urls.spotify}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 underline text-sm"
              >
                Open in Spotify
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;