import { searchSongs } from './spotifySearch';

import fallback from './fallbackChallenges.json'; // fallback list if keyword search is empty

/* return ONE track that sits around 2 semitones above userMax
strategy: 
1. keyword search: "<rangeTag> high note <genre>"
2. fallback to curated list if none found 
*/

export async function getChallengeSong({ rangeTag, genre, token }) {
    const query = `${rangeTag} high note ${genre}`.trim();
    const results = await searchSongs(query, token, 10);
    if (results.length) { 
        return results[Math.floor(Math.random() * results.length)];
    }
    //fallback
    const list = fallback[rangeTag] || [];
    if (!list.length) { // if no length
        return null;
    }
    const randomId = list[Math.floor(Math.random() * list.length)].id;
    const r = await fetch(`https://api.spotify.com/v1/tracks/${randomId}`, {
        headers: {Authorization: `Bearer ${token}` }
    });
    return await r.json();
}