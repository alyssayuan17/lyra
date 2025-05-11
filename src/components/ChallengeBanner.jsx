export default function ChallengeBanner({ track }) {
    if (!track) { // check if track is available
        return null;
    }
    return (
        <div className="mt-10 bg-red-50 border border-red-200 p-4 rounded max-w-md mx-auto shadow-sm">
            <h2 className = "text-lg font-bold text-red-600">Try This Challenge</h2>
            <p className = "mt-1 font-semibold">{track.name}</p>
            <p className = "text-sm text-gray-600">{track.artists[0]?.name}</p>
            {track.preview_url && (
                <audio controls className = "w-full mt-2">
                    <source src={track.preview_url} type="audio/mpeg" />
                </audio>
            )}
            <a
                href={track.external_urls.spotify}
                target = "_blank"
                rel = "noreferrer"
                className = "block text-indigo-600 underline text-sm mt-1"
            >
                Open in Spotify
            </a>
        </div>
    );
}