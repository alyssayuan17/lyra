export default function PlaybackPanel({ audioURL }) {
    if (!audioURL) return null;
    return (
      <div className="mt-8 w-full max-w-md text-center space-y-3">
        <audio controls src={audioURL} className="w-full rounded border" />
        <a href={audioURL} download="recording.webm" className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition">
          Download Recording
        </a>
      </div>
    );
}