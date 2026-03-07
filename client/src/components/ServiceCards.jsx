import React from 'react';
import { Link } from 'react-router-dom';

const services = [
  {
    title: 'GROCERY DELIVERY',
    subtitle: 'FRESH TO YOUR DOOR',
    offer: 'UPTO 60% OFF',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=280&fit=crop',
    to: '/',
  },
  {
    title: 'FRESH VEGETABLES',
    subtitle: 'FARM TO TABLE',
    offer: 'UPTO 50% OFF',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=280&fit=crop',
    to: '/',
  },
  {
    title: 'DAILY DEALS',
    subtitle: 'SAVE EVERY DAY',
    offer: 'UPTO 40% OFF',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=280&fit=crop',
    to: '/',
  },
];

const ServiceCards = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {services.map((s, i) => (
          <Link
            key={i}
            to={s.to}
            className="group bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="p-4 pb-2">
              <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-wider uppercase">
                {s.subtitle}
              </p>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mt-0.5">{s.title}</h3>
              <p className="text-orange-500 font-bold text-sm mt-1">{s.offer}</p>
            </div>
            <div className="relative h-40 md:h-44 overflow-hidden bg-gray-100">
              <img
                src={s.image}
                alt={s.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x280?text=Grocery';
                }}
              />
              <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ServiceCards;
