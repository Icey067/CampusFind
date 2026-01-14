import React, { useState, useRef, useEffect } from 'react';
import { Camera, ChevronRight, Loader2, MapPin, Upload, X } from 'lucide-react';
import { analyzeImageWithGemini } from '../services/geminiService';
import { uploadImage } from '../services/firebase';
import MapContainer from './MapContainer';
import { AIAnalysisResult, GeoLocation, ItemType, LostFoundItem } from '../types';
import { CATEGORIES } from '../constants';

interface ReportFormProps {
  userId: string;
  onSubmit: (item: Omit<LostFoundItem, 'id'>) => Promise<void>;
  onCancel: () => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ userId, onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Form State
  const [type, setType] = useState<ItemType>('lost');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [location, setLocation] = useState<GeoLocation>({ lat: 37.7749, lng: -122.4194 }); // Default
  const [locationName, setLocationName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        runAIAnalysis(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAIAnalysis = async (base64: string) => {
    setAnalyzing(true);
    try {
      const result = await analyzeImageWithGemini(base64);
      setAnalysis(result);
      // Auto-fill form
      setTitle(result.title);
      setDescription(result.description);
      if (CATEGORIES.includes(result.category)) {
        setCategory(result.category);
      }
    } catch (err) {
      console.error("AI failed", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !imagePreview) return;
    setLoading(true);

    try {
      const imageUrl = await uploadImage(imagePreview);

      const newItem: Omit<LostFoundItem, 'id'> = {
        type,
        title,
        description,
        category,
        imageUrl,
        location,
        locationName: locationName || "Pinned Location",
        date: new Date().toISOString(),
        status: 'open',
        userId,
        keywords: analysis?.keywords || []
      };

      await onSubmit(newItem);
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to report item. Please try again.");
      setLoading(false);
    }
  };

  // Steps Rendering
  return (
    <div className="bg-white md:rounded-3xl shadow-xl w-full max-w-2xl mx-auto overflow-hidden flex flex-col min-h-[90vh] md:min-h-0 md:h-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 backdrop-blur">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Report Item</h2>
          <p className="text-xs text-gray-500">Step {step} of 3</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full transition">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 overflow-y-auto">

        {/* Step 1: Type & Image */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Type Selector */}
            <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-2xl">
              <button
                onClick={() => setType('lost')}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${type === 'lost' ? 'bg-white shadow-sm text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                I Lost Something
              </button>
              <button
                onClick={() => setType('found')}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${type === 'found' ? 'bg-white shadow-sm text-campus-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                I Found Something
              </button>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Upload Photo (Required)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${imagePreview ? 'border-campus-500 bg-campus-50' : 'border-gray-300 hover:border-campus-400 hover:bg-gray-50'}`}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-xl z-10" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20 rounded-xl">
                      <span className="text-white font-medium flex items-center"><Camera size={18} className="mr-2" /> Change Photo</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview(null);
                        setAnalysis(null);
                        setTitle('');
                        setDescription('');
                        setCategory('Other');
                      }}
                      className="absolute top-2 right-2 z-30 bg-white/90 hover:bg-white text-red-500 p-1.5 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-12 h-12 bg-campus-100 text-campus-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">Our system will suggest details based on the photo</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* AI Status */}
              {analyzing && (
                <div className="flex items-center space-x-3 bg-indigo-50 text-indigo-700 p-4 rounded-xl border border-indigo-100">
                  <Loader2 size={20} className="animate-spin" />
                  <div className="text-sm">
                    <p className="font-semibold">Gemini AI is analyzing...</p>
                    <p className="text-xs opacity-80">Detecting object type, color, and category.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Details Review */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-campus-500 focus:ring-2 focus:ring-campus-200 outline-none transition-all font-medium"
                  placeholder="e.g. Blue Hydroflask"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-campus-500 focus:ring-2 focus:ring-campus-200 outline-none transition-all text-sm"
                  placeholder="Detailed description..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${category === cat
                        ? 'bg-campus-600 text-white border-campus-600 shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-campus-400'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
            <div className="flex-1 min-h-[300px] rounded-2xl overflow-hidden border border-gray-200 relative">
              <MapContainer location={location} onLocationSelect={setLocation} />
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                <MapPin size={16} className="text-red-500" />
                <span className="text-xs font-semibold text-gray-700">Pin exact location</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Location Name (Optional)</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm"
                placeholder="e.g. 3rd Floor Library, near printers"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <div className="flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!imagePreview || analyzing}
              className={`flex items-center space-x-2 px-8 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-campus-500/30 transition-all ${(!imagePreview || analyzing) ? 'bg-gray-300 cursor-not-allowed' : 'bg-campus-600 hover:bg-campus-700 active:scale-95'}`}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 px-8 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30 active:scale-95 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <span>Post Report</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportForm;
