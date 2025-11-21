
import React, { useState, useEffect } from 'react';
import { Car } from '../types';
import { supabase } from '../supabase';
import { XCircleIcon, UploadIcon, Spinner } from './IconComponents';
import Swal from 'sweetalert2';

interface CarFormProps {
  initialData?: Car;
  onSubmit: (data: Omit<Car, 'id' | 'dealerId' | 'verificationStatus'>) => void;
  isEdit?: boolean;
  children?: React.ReactNode;
}

const CarForm: React.FC<CarFormProps> = ({ initialData, onSubmit, isEdit, children }) => {
  const [formData, setFormData] = useState<Partial<Car>>(() => ({
    make: initialData?.make || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    price: initialData?.price || 0,
    mileage: initialData?.mileage || 0,
    fuelType: initialData?.fuelType || 'Gasoline',
    transmission: initialData?.transmission || 'Automatic',
    engine: initialData?.engine || '',
    horsepower: initialData?.horsepower || 0,
    features: initialData?.features || [],
    images: initialData?.images || [],
    description: initialData?.description || '',
    condition: initialData?.condition || 'Used',
    tag: initialData?.tag || undefined,
    listingType: initialData?.listingType || 'Sale',
    pricePeriod: initialData?.pricePeriod || 'Day',
    vin: initialData?.vin || '',
  }));

  const [featuresInput, setFeaturesInput] = useState(() => 
    (initialData?.features && Array.isArray(initialData.features)) ? initialData.features.join(', ') : ''
  );
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFormData(prev => ({
        ...prev,
        features: featuresInput.split(',').map(f => f.trim()).filter(f => f !== '')
    }));
  }, [featuresInput]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'vin') {
        // Enforce uppercase and alphanumeric characters only
        const cleanValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        setFormData(prev => ({ ...prev, [name]: cleanValue }));
        return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'price' || name === 'mileage' || name === 'horsepower' 
        ? Number(value) 
        : value
    }));
    
    if (name === 'tag' && value === '') {
         setFormData(prev => {
             const newData = { ...prev };
             delete newData.tag;
             return newData;
         });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const files = Array.from(e.target.files);
    const newImages: string[] = [];

    try {
        for (const file of files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `cars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);
            
            newImages.push(data.publicUrl);
        }
        
        setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), ...newImages]
        }));
    } catch (error) {
        console.error('Error uploading images:', error);
        Swal.fire({
            title: 'Upload Failed',
            text: 'Failed to upload images.',
            icon: 'error',
            confirmButtonColor: '#2563EB'
        });
    } finally {
        setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
        ...prev,
        images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Deep copy to avoid mutating state directly and to allow key deletion
    const cleanData = JSON.parse(JSON.stringify(formData));
    
    // Ensure arrays are initialized
    cleanData.features = formData.features || [];
    cleanData.images = formData.images || [];

    // Remove undefined keys explicitly (JSON.stringify does this, but let's be safe for top-level optional props)
    if (cleanData.tag === undefined || cleanData.tag === '') {
        delete cleanData.tag;
    }

    onSubmit(cleanData);
  };

  const inputClass = "w-full bg-background border border-input rounded-md p-2 focus:ring-ring focus:border-ring text-foreground";

  return (
    <form onSubmit={handleSubmit} className="bg-secondary p-6 rounded-lg border border-border space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium mb-1">Make</label>
            <input type="text" name="make" value={formData.make} onChange={handleChange} className={inputClass} required placeholder="e.g. Toyota" />
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input type="text" name="model" value={formData.model} onChange={handleChange} className={inputClass} required placeholder="e.g. Camry" />
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input type="number" name="year" value={formData.year} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select name="condition" value={formData.condition} onChange={handleChange} className={inputClass}>
                <option value="New">New</option>
                <option value="Used">Used</option>
            </select>
        </div>
      </div>

      {/* VIN & Listing Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium mb-1">VIN</label>
            <input 
                type="text" 
                name="vin" 
                value={formData.vin || ''} 
                onChange={handleChange} 
                className={inputClass} 
                placeholder="17-character VIN"
                maxLength={17}
                pattern="[A-Z0-9]{17}"
                title="VIN must be exactly 17 alphanumeric characters"
            />
            {formData.vin && formData.vin.length > 0 && formData.vin.length < 17 && (
                <p className="text-xs text-yellow-500 mt-1">Standard VINs are 17 characters.</p>
            )}
        </div>
         <div>
            <label className="block text-sm font-medium mb-1">Listing Type</label>
            <select name="listingType" value={formData.listingType} onChange={handleChange} className={inputClass}>
                <option value="Sale">For Sale</option>
                <option value="Rent">For Rent</option>
            </select>
        </div>
      </div>

      {/* Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium mb-1">Price (₦)</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} className={inputClass} required min="0" />
        </div>
        {formData.listingType === 'Rent' && (
            <div>
                <label className="block text-sm font-medium mb-1">Price Period</label>
                <select name="pricePeriod" value={formData.pricePeriod} onChange={handleChange} className={inputClass}>
                    <option value="Day">Per Day</option>
                    <option value="Week">Per Week</option>
                    <option value="Month">Per Month</option>
                </select>
            </div>
        )}
      </div>

      {/* Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
            <label className="block text-sm font-medium mb-1">Mileage</label>
            <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} className={inputClass} required min="0" />
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Fuel Type</label>
            <select name="fuelType" value={formData.fuelType} onChange={handleChange} className={inputClass}>
                <option value="Gasoline">Gasoline</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Transmission</label>
            <select name="transmission" value={formData.transmission} onChange={handleChange} className={inputClass}>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Horsepower</label>
            <input type="number" name="horsepower" value={formData.horsepower} onChange={handleChange} className={inputClass} required min="0" />
        </div>
      </div>

      <div>
          <label className="block text-sm font-medium mb-1">Engine</label>
          <input type="text" name="engine" value={formData.engine} onChange={handleChange} className={inputClass} required placeholder="e.g. 3.5L V6" />
      </div>

      {/* Tag */}
      <div>
            <label className="block text-sm font-medium mb-1">Tag (Optional)</label>
            <select name="tag" value={formData.tag || ''} onChange={handleChange} className={inputClass}>
                <option value="">None</option>
                <option value="Best Deal">Best Deal</option>
                <option value="New Arrival">New Arrival</option>
                <option value="Trending">Trending</option>
            </select>
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-medium mb-1">Features (comma separated)</label>
        <textarea 
            value={featuresInput} 
            onChange={(e) => setFeaturesInput(e.target.value)} 
            className={inputClass} 
            rows={3}
            placeholder="Bluetooth, Backup Camera, Leather Seats..." 
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} className={inputClass} rows={4} required />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium mb-2">Images</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {(formData.images || []).map((img, index) => (
                <div key={index} className="relative group">
                    <img src={img} alt={`Car ${index}`} className="w-full h-24 object-cover rounded-md" />
                    <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <XCircleIcon className="w-4 h-4" />
                    </button>
                </div>
            ))}
             <label className="cursor-pointer bg-background border-2 border-dashed border-border rounded-lg h-24 flex flex-col items-center justify-center hover:border-accent transition-colors">
                {uploading ? (
                    <Spinner className="h-6 w-6 text-muted-foreground" />
                ) : (
                    <UploadIcon className="h-6 w-6 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground mt-1">{uploading ? 'Uploading...' : 'Add Image'}</span>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
            </label>
        </div>
      </div>

      {children}

      <button 
        type="submit" 
        className="w-full bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        disabled={uploading}
      >
        {isEdit ? 'Update Vehicle' : 'Add Vehicle'}
      </button>
    </form>
  );
};

export default CarForm;
