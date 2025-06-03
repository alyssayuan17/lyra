# Lyra – Personalized Vocal Range Analyzer & Song Recommender 🎤 🎵

Lyra is a web app that helps singers explore their vocal range and discover songs that actually suit their voice. It analyzes your range in real time, then recommends songs based on your genre preferences and how much you're looking to challenge yourself!

Built using React + Web Audio API to record and analyze voice - mapped detected pitch to vocal ranges and queried Spotify Web API for matching songs!

---

## Live Demo!

🔗 [Try Lyra here](#) *(link coming soon!)*

---

## Why I Built This! 😊

As a classically trained singer who’s struggled with vocal fatigue and finding the right songs, I built Lyra to make vocal exploration fun, personalized, and accessible! Lyra is a mix of my passion for music and my love for building things with code!

---

## What Lyra Does...

### Record Your Voice:
Start and stop recording directly from your browser, captures microphone input to analyze your singing

### Play It Back: 
Replay your recorded audio to self-assess and compare, simple UI with play/pause functionality

### Detect Your Vocal Range:
Automatically detects the lowest and highest pitch in your voice, displays results in both note format (e.g., C3 - G5) and MIDI

### See It on a Piano:
Interactive piano keyboard displays your vocal range visually, great for visual learners and singers trained on piano

### Know Your Voice Type:
Labels your voice type (i.e. Soprano, Alto, Tenor, Bass), helps you understand which parts and genres suit your voice

### Choose a Genre:
Pick a genre you love — pop, R&B, musical theatre, etc.! Lyra uses it to customize your recommendations! 😉

### Get Spotify-Powered Suggestions:
Finds songs within your range and preferred genre using Spotify's API, filters tracks based on vocal accessibility and pitch window

### Try a “Challenge Song”:
Suggests a challenging high-note song just outside your comfort zone, helps stretch your vocal capacity gradually - helps to build confidence as a singer!

### Health Tips for Singers!
Rotating tips on vocal warmups, hydration, and posture, shares tips to keep your voice healthy while practicing (VERY IMPORTANT!!!)

### Genre Suggestions by Voice Type:
Recommends genres that best match your range and voice type, helps users explore new musical styles confidently!

---

## Tech Stack 🛠️

- **React** with Hooks  
- **TailwindCSS**  
- **Audio**: Web Audio API (for pitch and frequency analysis), custom pitch analysis utilities
- **Auth + API**: Spotify OAuth, Spotify Web API (for song search)
- **Custom Modules**: `noteUtils`, `audioUtils`, `recordingLogic`

---

## File Structure:

```
src/
├── assets/
│   └── logo.svg
├── components/
│   ├── ChallengeBanner.jsx
│   ├── GenreSelect.jsx
│   ├── GenreSuggestions.jsx
│   ├── HealthTip.jsx
│   ├── PianoRange.jsx
│   ├── PlaybackPanel.jsx
│   ├── RecordingControls.jsx
│   ├── SongRecCard.jsx
│   └── VoiceTypeBadge.jsx
├── data/
│   └── songs.js
├── styles/
│   ├── App.css
│   └── index.css
├── utils/
│   ├── audioUtils.js
│   ├── fallbackChallenges.json
│   ├── genreSuggest.js
│   ├── getChallengeSong.js
│   ├── matchSongs.js
│   ├── noteUtils.js
│   ├── pitchUtils.js
│   ├── recordingLogic.js
│   ├── spotifyAuth.js
│   └── spotifySearch.js
├── App.js
├── App.test.js
├── index.js
└── reportWebVitals.js
```

---

## What I Might Add Next! (open to any feedback/suggestions 😁)

- Real-time pitch graph
- Vocal journaling and logs
- Key transposition option? Different octaves? 
- Male/female voice differentiation? (might be challenging)
- Sharper genre-based warmup suggestions?

---

## Contributions

Open to suggestions! Feel free to message if you have ideas 😁
