import React from 'react';
{/*render a dropdown (<select>) and notify the parent (App.jsx) whenever the user picks a different genre*/}
export default function GenreSelect({value, onChange}) {
    return (
        <div className = "mt-4 flex items-center gap-2">
            <label className = "text-sm text-gray-700 font-medium">Genre:</label>
            <select
                value = {value} 
                onChange = {(e) => onChange(e.target.value)}
                className = "border border-gray-300 rounded px-2 py-1 text-sm"
            >   {/*set option values*/} 
                <option value = "">Any</option> 
                <option value = "pop">Pop</option>
                <option value = "r&b">R&amp;B</option>
                <option value = "musical theatre">Musical Theatre</option>
                <option value = "rock">Rock</option>
                <option value = "jazz">Jazz</option>
            </select>
        </div>
    )
}