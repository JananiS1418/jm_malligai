import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import LandingHero from './LandingHero';
import ServiceCards from './ServiceCards';
import HorizontalScrollSection from './HorizontalScrollSection';
import Card from './Card';
import CountContext from '../context/CountContext';

import { API_BASE, resolveUploadUrl } from '../utils/api';

// Distinct icon per category – add new entries here for new categories
const CATEGORY_ICONS = {
  vegetable: '🥕',
  vegetables: '🥕',
  fruits: '🍎',
  fruit: '🍎',
  dairy: '🧀',
  snacks: '🍿',
  beverages: '🥤',
  groceries: '🛒',
  staples: '🌾',
  cereals: '🌾',
  spices: '🧂',
  bakery: '🥖',
  frozen: '🧊',
  pulses: '🫘',
};

function getCategoryIcon(catname) {
  if (!catname) return '🛒';
  const key = String(catname).toLowerCase().trim();
  if (CATEGORY_ICONS[key]) return CATEGORY_ICONS[key];
  // For any new category: pick a consistent but different icon from a fallback set
  const fallbacks = ['🥬', '🍊', '🥦', '🍇', '🥔', '🍋', '🌽', '🍓', '🥒', '🍑', '🫑', '🍒'];
  const index = key.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % fallbacks.length;
  return fallbacks[index];
}

function getAvailableWeights(product) {
  if (product.weightOptions && product.weightOptions.length > 0) {
    const available = product.weightOptions.filter((o) => o.available !== false);
    if (available.length > 0) return available;
  }
  return [{ weight: 1, label: '1 kg' }];
}

const ProductCard = ({ product, selectedWeight, setSelectedWeight, addToCart }) => {
  const weights = getAvailableWeights(product);
  const allClosed = weights.length === 0;
  const currentWeight =
    selectedWeight[product._id] ?? (weights[0]?.weight ?? 1);

  return (
    <div
      key={product._id}
      className="shrink-0 w-56 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition group"
    >
      <div className="relative h-36 bg-slate-50 flex items-center justify-center p-3 overflow-hidden">
        <img
          src={
            resolveUploadUrl(product.image) ||
            'https://placehold.co/200?text=No+Image'
          }
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/200?text=No+Image';
          }}
        />
        {product.category && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur text-[10px] font-semibold text-slate-600 border border-slate-100">
            {product.category}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-emerald-600 font-bold">
            ₹{product.price}
            <span className="text-xs font-medium text-slate-500">/kg</span>
          </span>
          {allClosed ? (
            <span className="text-amber-700 text-xs font-medium">
              Out of stock
            </span>
          ) : (
            <span className="text-xs text-slate-500">In stock</span>
          )}
        </div>
        {!allClosed && (
          <div className="mt-3 flex items-center gap-2">
            <select
              value={currentWeight}
              onChange={(e) =>
                setSelectedWeight((prev) => ({
                  ...prev,
                  [product._id]: Number(e.target.value),
                }))
              }
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {weights.map((w) => (
                <option key={w.weight} value={w.weight}>
                  {w.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => addToCart(product, currentWeight)}
              className="shrink-0 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

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
                className="shrink-0 w-40 flex flex-col rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition hover:-translate-y-0.5"
              >
                <div className="h-24 bg-slate-50 flex items-center justify-center">
                  <span className="text-4xl drop-shadow-sm" role="img" aria-label={cat.catname}>
                    {getCategoryIcon(cat.catname)}
                  </span>
                </div>
                <div className="p-3 text-center">
                  <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                  {cat.catname}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Shop now</p>
                </div>
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
            products.slice(0, 12).map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                selectedWeight={selectedWeight}
                setSelectedWeight={setSelectedWeight}
                addToCart={addToCart}
              />
            ))
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
                subtitle={`${catProducts.length} product${
                  catProducts.length !== 1 ? 's' : ''
                }`}
              >
                {catProducts.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    selectedWeight={selectedWeight}
                    setSelectedWeight={setSelectedWeight}
                    addToCart={addToCart}
                  />
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
