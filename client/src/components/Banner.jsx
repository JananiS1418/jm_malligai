import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import LandingHero from './LandingHero';
import ServiceCards from './ServiceCards';
import HorizontalScrollSection from './HorizontalScrollSection';
import Card from './Card';
import CountContext from '../context/CountContext';

const API_BASE = '/api';

function getAvailableWeights(product) {
  if (product.weightOptions && product.weightOptions.length > 0) {
    const available = product.weightOptions.filter((o) => o.available !== false);
    if (available.length > 0) return available;
  }
  return [{ weight: 1, label: '1 kg' }];
}

const Banner = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [loadingProd, setLoadingProd] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState({});
  const { addToCart } = useContext(CountContext);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data.filter((c) => c.catstatus === 'Active'));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCat(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.filter((p) => p.status === 'Active'));
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoadingProd(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <div className="pt-20 pb-4 bg-gray-50">
        <LandingHero />
        <ServiceCards />
      </div>

      {/* Shop by category - horizontal scroll */}
      <div className="bg-white border-t border-gray-100">
        <HorizontalScrollSection
          title="Shop groceries on JM Maligai"
          subtitle="Browse by category"
        >
          {loadingCat ? (
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-36 h-44 rounded-xl bg-gray-100 animate-pulse"
              />
            ))
          ) : categories.length === 0 ? (
            <div className="shrink-0 w-full py-8 text-center text-gray-500">
              No categories yet.
            </div>
          ) : (
            categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/?category=${encodeURIComponent(cat.catname)}`}
                className="shrink-0 w-36 flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition hover:border-green-200"
              >
                <div className="h-28 bg-gray-50 flex items-center justify-center p-2">
                  <span className="text-4xl">🥬</span>
                </div>
                <p className="p-3 text-center text-sm font-medium text-gray-800 line-clamp-2">
                  {cat.catname}
                </p>
              </Link>
            ))
          )}
        </HorizontalScrollSection>
      </div>

      {/* Featured products - horizontal scroll */}
      <div className="bg-gray-50 border-t border-gray-100">
        <HorizontalScrollSection
          title="Discover best products"
          subtitle="Fresh picks for you"
        >
          {loadingProd ? (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-48 md:w-56 h-64 rounded-xl bg-gray-200 animate-pulse"
              />
            ))
          ) : products.length === 0 ? (
            <div className="shrink-0 w-full py-8 text-center text-gray-500">
              No products yet. Add categories and products in the Admin Panel.
            </div>
          ) : (
            products.slice(0, 12).map((p) => {
              const weights = getAvailableWeights(p);
              const allClosed = weights.length === 0;
              const currentWeight = selectedWeight[p._id] ?? (weights[0]?.weight ?? 1);
              return (
                <div
                  key={p._id}
                  className="shrink-0 w-48 md:w-56 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition group"
                >
                  <div className="h-36 bg-gray-50 flex items-center justify-center p-2 overflow-hidden">
                    <img
                      src={p.image || 'https://placehold.co/200?text=No+Image'}
                      alt={p.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/200?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{p.name}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{p.category}</p>
                    <div className="mt-2 flex flex-col gap-1.5">
                      <span className="text-green-600 font-bold">₹{p.price}/kg</span>
                      {allClosed ? (
                        <span className="text-amber-600 text-xs">Out of stock</span>
                      ) : (
                        <>
                          <select
                            value={currentWeight}
                            onChange={(e) => setSelectedWeight((prev) => ({ ...prev, [p._id]: Number(e.target.value) }))}
                            className="text-xs border border-gray-200 rounded px-2 py-1 w-full"
                          >
                            {weights.map((w) => (
                              <option key={w.weight} value={w.weight}>{w.label}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => addToCart(p, currentWeight)}
                            className="text-xs font-medium text-orange-500 hover:text-orange-600"
                          >
                            Add
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </HorizontalScrollSection>
      </div>

      {/* Products by category - one row per category */}
      {!loadingCat && !loadingProd && categories.length > 0 && products.length > 0 && (
        <div className="bg-white border-t border-gray-100">
          {categories.map((cat) => {
            const catProducts = products.filter(
              (p) => p.category && p.category.toLowerCase() === cat.catname.toLowerCase()
            );
            if (catProducts.length === 0) return null;
            return (
              <HorizontalScrollSection
                key={cat._id}
                title={`Shop ${cat.catname}`}
                subtitle={`${catProducts.length} product${catProducts.length !== 1 ? 's' : ''}`}
              >
                {catProducts.map((p) => (
                  <Link
                    key={p._id}
                    to={`/?category=${encodeURIComponent(cat.catname)}`}
                    className="shrink-0 w-48 md:w-56 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition group"
                  >
                    <div className="h-36 bg-gray-50 flex items-center justify-center p-2 overflow-hidden">
                      <img
                        src={p.image || 'https://placehold.co/200?text=No+Image'}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/200?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{p.name}</h3>
                      <p className="text-green-600 font-bold mt-1">₹{p.price}</p>
                    </div>
                  </Link>
                ))}
              </HorizontalScrollSection>
            );
          })}
        </div>
      )}

      {/* Full product grid (filtered by ?category= when set) + offers */}
      <Card />
    </>
  );
};

export default Banner;
