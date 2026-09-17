import React, { useState, useEffect } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { PRESET_IMAGE_OPTIONS } from '../data/initialProducts';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id'>) => void;
  initialProduct?: Product | null;
}

const CATEGORIES: ProductCategory[] = [
  'Pastries',
  'Savory Snacks',
  'Sweet Treats',
  'Drinks & Sides',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Pastries');
  const [price, setPrice] = useState<string>('15.00');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGE_OPTIONS[0].url);
  const [inStock, setInStock] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [preparationTime, setPreparationTime] = useState('Ready');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setCategory(initialProduct.category);
      setPrice(initialProduct.price.toString());
      setDescription(initialProduct.description);
      setImageUrl(initialProduct.imageUrl);
      setInStock(initialProduct.inStock);
      setIsPopular(initialProduct.isPopular ?? false);
      setPreparationTime(initialProduct.preparationTime || 'Ready');
    } else {
      setName('');
      setCategory('Pastries');
      setPrice('15.00');
      setDescription('');
      setImageUrl(PRESET_IMAGE_OPTIONS[0].url);
      setInStock(true);
      setIsPopular(false);
      setPreparationTime('Ready');
    }
    setError(null);
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product name is required');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid price in Cedis');
      return;
    }

    onSave({
      name: name.trim(),
      category,
      price: parsedPrice,
      description: description.trim() || 'Delicious freshly prepared snack.',
      imageUrl: imageUrl.trim() || PRESET_IMAGE_OPTIONS[0].url,
      inStock,
      isPopular,
      preparationTime,
      orderCount: initialProduct?.orderCount ?? 0,
    });

    onClose();
  };

  return (
    <div
      id="product-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden my-6 border border-stone-200 animate-scale-in">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 bg-amber-50/60 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-base font-['Outfit',sans-serif]">
              {initialProduct ? 'Edit Snack / Pastry' : 'Add New Snack to Menu'}
            </h3>
            <p className="text-xs text-stone-500">
              Set name, price in Ghana Cedis (GH₵), and inventory availability
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Snack Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-product-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Spicy Meat Pie"
                className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Category
              </label>
              <select
                id="select-product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Prep time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Price in Cedis (GH₵) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-stone-500">
                  GH₵
                </span>
                <input
                  id="input-product-price"
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="15.00"
                  className="w-full pl-12 pr-3 py-2 text-xs font-bold font-['Outfit',sans-serif] bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Preparation / Serving Time
              </label>
              <input
                id="input-product-prep-time"
                type="text"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                placeholder="e.g. Ready, 5 mins, Chilled"
                className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Description
            </label>
            <textarea
              id="input-product-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Flaky pastry filled with seasoned minced beef, potatoes and spices..."
              className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Image Presets or Custom URL */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Select Preset Photo or Enter URL
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
              {PRESET_IMAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setImageUrl(opt.url)}
                  className={`p-1 rounded-xl border text-center transition-all ${
                    imageUrl === opt.url
                      ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-600'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <img
                    src={opt.url}
                    alt={opt.label}
                    className="w-full h-10 object-cover rounded-lg mb-1"
                  />
                  <p className="text-[9px] font-semibold text-stone-700 truncate">
                    {opt.label}
                  </p>
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                <ImageIcon className="w-3.5 h-3.5" />
              </span>
              <input
                id="input-product-image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden truncate"
              />
            </div>
          </div>

          {/* Stock & Popularity Toggles */}
          <div className="pt-2 border-t border-stone-200 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="checkbox-in-stock"
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-stone-800">
                In Stock (Available for ordering)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="checkbox-is-popular"
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Highlight as Popular Snack
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-product"
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs"
            >
              {initialProduct ? 'Save Changes' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
