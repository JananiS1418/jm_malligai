import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CountContext from '../context/CountContext';
import { API_BASE, resolveUploadUrl } from '../utils/api';

const Profile = () => {
  const { user } = useContext(CountContext);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.filter((p) => p.status === 'Active').slice(0, 8));
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f14]">
        <div className="text-center text-slate-400 text-xl">
          Please log in to view your profile.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f14] text-white pt-24 pb-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header card */}
        <div className="relative rounded-2xl border border-white/10 bg-[#16161e] p-6 md:p-8 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl md:text-4xl font-bold text-white shadow-lg shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {user.name}
              </h1>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-lg text-sm font-medium ${
                  user.role === 'Admin'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {user.role}
              </span>
              <p className="mt-2 text-slate-400 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Sections grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account details */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#16161e] p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              Account details
            </h2>
            <dl className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <dt className="text-slate-400 font-medium">Email</dt>
                <dd className="text-white font-mono text-sm">{user.email}</dd>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <dt className="text-slate-400 font-medium">User ID</dt>
                <dd className="text-white font-mono text-xs truncate max-w-[200px]" title={user._id}>
                  {user._id}
                </dd>
              </div>
              <div className="flex justify-between items-center py-3">
                <dt className="text-slate-400 font-medium">Role</dt>
                <dd className="text-white font-medium">{user.role}</dd>
              </div>
            </dl>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-white/10 bg-[#16161e] p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              Quick actions
            </h2>
            <div className="space-y-3">
              <Link
                to="/"
                className="block w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-center hover:bg-white/10 hover:border-indigo-500/30 transition"
              >
                Browse products
              </Link>
              <Link
                to="/"
                className="block w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-medium text-center hover:bg-indigo-500 transition"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>

        {/* Featured products section */}
        <div className="rounded-2xl border border-white/10 bg-[#16161e] p-6 md:p-8 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
            Featured products
          </h2>
          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 h-48 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No products available yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {products.map((p) => (
                <Link
                  key={p._id}
                  to="/"
                  className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-indigo-500/30 hover:bg-white/10 transition"
                >
                  <div className="aspect-square flex items-center justify-center bg-white/5 p-4">
                    <img
                      src={resolveUploadUrl(p.image) || 'https://placehold.co/200?text=No+Image'}
                      alt={p.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/200?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-white text-sm line-clamp-1">{p.name}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{p.category}</p>
                    <p className="text-indigo-400 font-semibold mt-1">₹{p.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium text-sm"
            >
              View all products
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
