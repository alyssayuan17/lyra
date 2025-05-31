import React from 'react'

export default function GenreSuggestions({ genres }) {
    if (!genres || genres.length === 0) {
        return null;
    }

    return (
        <div className = "mt-6 text-center">
            <p className = "text-sm text-gray-600 mb-1">Suggested genres for you:</p>
            <div className = "inline-flex flex-wrap gap-2">
                <ul className = "gap-2 justify-center">
                    {genres.map((genre, index) => (
                        <li key = {index} className="px-3 py-1 bg-gray-200 rounded-full text-sm">
                            {genre.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}