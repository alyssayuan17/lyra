import React from 'react'

export default function GenreSuggestions({ genres }) {
    if (!genres || genres.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Suggested genres for you:</p>
            <div className="inline-flex flex-wrap gap-2">
                {genres.map((g) => (
                <span
                    key={g}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                >
                    {g}
                </span>
                ))}
            </div>
        </div>
    )
}