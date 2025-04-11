export default function RecordingControls({ isRecording, startRecording, stopRecording }) {
    return (
      <div className="flex gap-4">
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl shadow-md transition"
          >
            Stop Recording
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-md transition"
          >
            Start Recording
          </button>
        )}
      </div>
    );
}
  