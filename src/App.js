import React, { useState, useEffect, useRef } from 'react';
import RecordingControls from './components/RecordingControls';
import PlaybackPanel from './components/PlaybackPanel';
import HealthTip from './components/HealthTip';
import GenreSelect from './components/GenreSelect';
import { startRecording, stopRecording } from "./utils/recordingLogic";
import { computeRMS, getMidi } from './utils/audioUtils';
import { noteFromPitch } from './utils/noteUtils';
import { getAccessToken } from './utils/spotifyAuth';
import { searchSongs } from './utils/spotifySearch';
import { getChallengeSong } from './utils/getChallengeSong';
import ChallengeBanner from './components/ChallengeBanner';
import PianoRange from './components/PianoRange';
import VoiceTypeBadge from './components/VoiceTypeBadge';
import { suggestGenres } from './utils/genreSuggest';
import GenreSuggestions from './components/GenreSuggestions';



function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [vocalRange, setVocalRange] = useState(null);
  const [autoGenres, setAutoGenres] = useState([]);
  const [healthTip, setHealthTip] = useState("");
  const [recommended, setRecommended] = useState([]);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const detectedPitchesRef = useRef([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [challengeSong, setChallengeSong] = useState(null);
  const [playProgress, setPlayProgress] = useState(0); // for piano
  const audioRef = useRef(null);
  const recordingStartRef = useRef(0);
  const [currentPitch, setCurrentPitch] = useState(null);

  const handleStart = () => { 
    startRecording({ // when user hits 'start recording', it calls this function + hands it a single object with refs & state-updaters
      mediaRecorderRef, // React ref for MediaRecorder
      chunks,
      audioContextRef,
      sourceRef,
      processorRef,
      detectedPitchesRef,
      setIsRecording,
      setAudioURL,
      setRecommended,
      recordingStartRef,
      setCurrentPitch,
    });
  };

  const handleStop = () => {
    // calculate how long user recorded for
    const durationMs = Date.now() - recordingStartRef.current;
    if (durationMs < 800) { // check if recording is too short to avoid program crash
      alert("Recording was too short, please sing for at least one second.");
      return;
    }

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
      recordingStartRef,
    });
  };

  useEffect(() => { // whenever vocalRange changes, compute suggestions
    if (!vocalRange) {
      return;
    }
    setAutoGenres(suggestGenres(vocalRange));
  }, [vocalRange]);

  const rangeToTag = (vocalRange) => { // mapping: match the user’s range to a tagged song category
    if (!vocalRange || !vocalRange.low || !vocalRange.high) { // check if it is null, check if low/high is missing
      return "general vocal";
    }
    
    const { low, high } = vocalRange;
  
    if (!low || !high) return "general vocal";
  
    if (low.startsWith("C3") && high.startsWith("G4")) {
      return "deep alto vocal";
    } else if (low.startsWith("A3") && high.startsWith("E5")) {
      return "belting female vocal";
    } else if (high.startsWith("A5") || high.startsWith("B5")) {
      return "soprano arias";
    }
  
    return "vocal warm up"; // if none matches, return this
  };  

  useEffect(() => { // when page loads, vocalRange is null, so call this effect instead
    // so user can see default recommendations immediately
    (async () => { 
      try{
        const token = await getAccessToken();

        // tag for "default" recommendations
        const defaultTag = "general vocal";
        const defaultQuery = defaultTag;
        const defaultRecs = await searchSongs(defaultQuery, token);
        setRecommended(defaultRecs);

        const defaultChallenge = await getChallengeSong({
          rangeTag: defaultTag,
          genre: "", // no genre yet
          token
        });

        setChallengeSong(defaultChallenge);
      } catch (error) {
        console.error("Error loading default Spotify recommendations: " + error);
        setRecommended([]);
        setChallengeSong(null);
      }
    })()
  }, []);

  useEffect(() => {

    if (!vocalRange) { // if vocalRange is null, don’t run the “range-based” fetch
      return;
    }

    const fetchSpotifySongs = async () => {
      try { // try-catch to avoid program crash if recording is too short
        const token = await getAccessToken();
        const tag = rangeToTag(vocalRange); // use range mapping in function
        const query = `${tag} ${selectedGenre}`.trim();
        const recs = await searchSongs(query, token);
        setRecommended(recs);

        // pull challenge track
        const challenger = await getChallengeSong({ // call method, async function so await to pause until it finished Spotify fetch logic
          rangeTag: tag, 
          genre: selectedGenre,
          token, // OAuth access token
        });
        setChallengeSong(challenger); // returned track object is stored in 'challenger' so it can be immediately passed or rendered
      } catch (error) {
        console.error("Error fetching Spotify songs:", error);
        setRecommended([]);
        setChallengeSong(null);
        // check if it is truly a "failed to fetch" error (due to network/internet connection)
        if (error.message.includes("Failed to fetch")) {
          alert("Couldn’t reach Spotify. Please check your network or try again later.");
        } else {
          alert("Something went wrong: " + error.message);
        }
      }
      
    };

    fetchSpotifySongs();

  }, [vocalRange, selectedGenre]);  

  // hook up playhead progress whenever the audioURL (and thus <audio />) changes
  useEffect(() => { // track playback
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const onTime = () => { // runs every time audio's playback position changes
      setPlayProgress(audio.currentTime / (audio.duration || 1)); // compute a normalized progress value
    };

    audio.addEventListener('timeupdate', onTime); // subscribe when effect runs

    return () => { // unsubscribe when the component unmounts or audioURL changes
      audio.removeEventListener('timeupdate', onTime);
    }
  }, [audioURL]); // re-attach whenever the source URL changes


  return (
    <div className = "min-h-screen bg-gradient-to-b from-[#FEF9C3] to-white flex flex-col items-center justify-center px-6 py-12">
      <h1 className = "text-4xl sm:text-5xl font-extrabold font-poppins text-indigo-800 mb-8 tracking-tight drop-shadow">
        Lyra <span role = "img" aria-label="mic"></span>
      </h1>

      <RecordingControls
        isRecording = {isRecording}
        startRecording = {handleStart}
        stopRecording = {handleStop}
      />

      <PlaybackPanel audioURL = {audioURL} audioRef = {audioRef} />

      <GenreSelect value = {selectedGenre} onChange = {setSelectedGenre} />

      <ChallengeBanner track = {challengeSong} />

      {vocalRange && (
        <>
          {/* vocal range + health tip */}
          <div className = "mt-10 text-center space-y-4">
            <p className = "text-lg font-semibold text-gray-700">Your Vocal Range:</p>
            <p className = "text-3xl font-bold text-indigo-700">
              {vocalRange.low} – {vocalRange.high}
            </p>
            <HealthTip tip = {healthTip} />
            <GenreSuggestions genres = {autoGenres} />
            <VoiceTypeBadge vocalRange = {vocalRange} />
          </div>

          {/* piano keyboard in its own box (overflow visible) */}
          <div className = "piano-container overflow-visible h-[120px] mx-auto mt-4 bg-white">
            <PianoRange
              lowNote = {vocalRange.low}
              highNote = {vocalRange.high}
              currentPitch = {currentPitch}
              playProgress = {playProgress}
            />
          </div>
        </>
      )}

      {recommended.length > 0 && (
        <div className = "grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 max-w-2xl mx-auto">
          {recommended.map((track) => (
            <div key = {track.id} className="bg-white shadow p-4 rounded-lg">
              <img src = {track.album.images[0]?.url} alt={track.name} className="w-full rounded" />
              <p className = "font-semibold mt-2">{track.name}</p>
              <p className = "text-sm text-gray-500">{track.artists[0]?.name}</p>
              {track.preview_url && (
                <audio controls className="w-full mt-2">
                  <source src = {track.preview_url} type="audio/mpeg" />
                </audio>
              )}
              <a
                href = {track.external_urls.spotify}
                target = "_blank"
                rel = "noreferrer"
                className = "text-indigo-600 underline text-sm"
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