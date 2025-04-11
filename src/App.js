import RecordingControls from "./components/RecordingControls";
import PlaybackPanel from "./components/PlaybackPanel";
import HealthTip from "./components/HealthTip";

import { computeRMS, getMidi } from "./utils/audioUtils";
import { noteFromPitch } from "./utils/noteUtils";

import { useEffect, useState } from "react";
import { getAccessToken } from "./utils/spotifyAuth";
import { searchSongs } from "./utils/spotifySearch";
