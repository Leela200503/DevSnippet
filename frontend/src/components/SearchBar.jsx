import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('');

  const handleSearch = () => {
    onSearch({ title, language });
  };

  const handleReset = () => {
    setTitle('');
    setLanguage('');
    onSearch({ title: '', language: '' });
  };

  const languages = [
    'All Languages',
    'JavaScript',
    'Python',
    'Java',
    'C++',
    'C#',
    'Ruby',
    'Go',
    'Rust',
    'PHP',
    'Swift',
    'Kotlin',
    'SQL',
    'HTML',
    'CSS',
    'TypeScript',
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Search & Filter</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Search by Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter snippet title..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Filter by Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value === 'All Languages' ? '' : e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang === 'All Languages' ? '' : lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            Search
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
