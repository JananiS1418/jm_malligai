import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingHero = () => {
  const [location, setLocation] = useState('');
  const [search, setSearch] = useState('');

  return (
    <div className="relative min-h-[420px] md:min-h-[480px] flex flex-col items-center justify-center px-4 py-16 bg-[#fc8019] overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute bottom-20 right-16 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute top-1/3 right-8 w-24 h-24 rounded-full bg-white/5" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 drop-shadow-sm">
          Order groceries & daily essentials.
          <br />
          <span className="text-white/95">Discover best deals. JM Maligai it!</span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-2xl mx-auto">
          <div className="flex items-center bg-white rounded-lg shadow-lg overflow-hidden flex-1">
            <span className="pl-4 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Enter your delivery location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 py-3.5 px-3 text-gray-800 placeholder-gray-400 outline-none text-sm"
            />
            <span className="pr-3 text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          <div className="flex items-center bg-white rounded-lg shadow-lg overflow-hidden flex-1">
            <span className="pl-4 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search for groceries, items & more"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 py-3.5 px-3 text-gray-800 placeholder-gray-400 outline-none text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;
