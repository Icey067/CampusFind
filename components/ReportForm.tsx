import React, { useState, useRef } from 'react';
import { ChevronRight, Loader2, MapPin, Upload, X, Sparkles, CheckCircle } from 'lucide-react';
import { uploadImage } from '../services/firebase';
import MapContainer from './MapContainer';
import { GeoLocation, ItemType, LostFoundItem } from '../types';
import { CATEGORIES } from '../constants';
import { SherlockAgent } from './SherlockAgent'; 

interface ReportFormProps {
  userId: string;
  onSubmit: (item: Omit<LostFoundItem, 'id'>) => Promise<void>;
  onCancel: () => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ userId, onSubmit, onCancel }) => {
  // Steps: 1=Upload, 2=Sherlock, 3=Review & Location
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [type, setType] = useState<ItemType>('lost');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [location, setLocation] = useState<GeoLocation>({ lat: 37.7749, lng: -122.4194 });
  const [locationName, setLocationName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSherlockComplete = (summary: string) => {
    setDescription(summary);
    if (!title) setTitle(type === 'found' ? 'Found Item' : 'Lost Item');
    setStep(3); 
  };

  const handleSubmit = async () => {
    if (!title) {
        alert("Please enter a title for the item.");
        return;
    }
    if (!imagePreview) return;
    
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
        keywords: description.split(' '), 
      };

      await onSubmit(newItem);
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to report item. Please try again.");
      setLoading(false);
    }
  };

  return (
    /* FIX: Changed h-[800px] to max-h-[90vh] so it fits on laptops */
    <div className="bg-white md:rounded-3xl shadow-xl w-full max-w-2xl mx-auto overflow-hidden flex flex-col h-[100dvh] md:h-auto md:max-h-[90vh]">
      
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 backdrop-blur shrink-0 z-20">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-800">
            {step === 2 ? 'Sherlock Analysis' : 'Report Item'}
          </h2>
          <div className="flex items-center space-x-2 mt-1">
            <div className={`h-1 w-6 md:h-1.5 md:w-8 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`h-1 w-6 md:h-1.5 md:w-8 rounded-full transition-colors ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
            <div className={`h-1 w-6 md:h-1.5 md:w-8 rounded-full transition-colors ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`} />
            <span className="text-xs text-gray-400 ml-2">Step {step}/3</span>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full transition">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Body - Scrollable Area */}
      <div className="p-4 md:p-6 flex-1 overflow-y-auto custom-scrollbar relative">

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setType('lost')}
                className={`py-3 rounded-lg text-sm font-semibold transition-all ${type === 'lost' ? 'bg-white shadow-sm text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                I Lost Something
              </button>
              <button
                onClick={() => setType('found')}
                className={`py-3 rounded-lg text-sm font-semibold transition-all ${type === 'found' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                I Found Something
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Upload Photo (Required)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-video rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles size={24} />
                  </div>
                  <p className="font-bold text-gray-900">Click to upload photo</p>
                  <p className="text-xs text-gray-500 mt-1">Sherlock AI will analyze it automatically</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Sherlock */}
        {step === 2 && imageFile && (
          <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-3 mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100 shrink-0">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                 <img src={imagePreview!} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-purple-900 text-sm">Sherlock is Investigating</h3>
                <p className="text-xs text-purple-700">Helping you write a perfect report...</p>
              </div>
            </div>

            <div className="flex-1 min-h-[300px]">
              <SherlockAgent 
                imageFile={imageFile} 
                onSummaryReady={handleSherlockComplete} 
              />
            </div>

            <button 
              onClick={() => {
                if (!title) setTitle(type === 'found' ? 'Found Item' : 'Lost Item');
                setStep(3);
              }} 
              className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline text-center w-full shrink-0"
            >
              Skip AI Analysis
            </button>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 font-bold border-b border-green-100 pb-2">
                <CheckCircle size={18} />
                <span>Review Details</span>
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none font-medium"
                  placeholder="e.g. Blue Hydroflask"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase text-gray-500">Description</label>
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">AI Generated</span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${category === cat
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
               <div className="flex items-center gap-2 text-red-500 font-bold border-b border-red-50 pb-2">
                <MapPin size={18} />
                <span>Confirm Location</span>
              </div>

              <div className="h-[200px] rounded-xl overflow-hidden border border-gray-200 relative shadow-sm">
                <MapContainer location={location} onLocationSelect={setLocation} />
              </div>

              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm"
                placeholder="e.g. 3rd Floor Library"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls - Always Visible */}
      <div className="p-4 md:p-6 border-t border-gray-100 bg-white shrink-0 z-20">
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

          {step === 3 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex items-center space-x-2 px-8 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all ${
                loading ? 'bg-green-700 cursor-wait' : 'bg-green-600 hover:bg-green-700 active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <span>Post Report</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportForm;