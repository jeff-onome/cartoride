
import React, { useState, useEffect } from 'react';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useCars } from '../../hooks/useCars';
import type { SiteContent, PaymentMethod, FaqItem } from '../../types';
import { UploadIcon, Spinner, ReceiptIcon } from '../../components/IconComponents';
import { supabase } from '../../supabase';
import Swal from 'sweetalert2';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-12 last:mb-0">
    <h2 className="text-2xl font-bold text-foreground border-b border-border pb-3 mb-6">{title}</h2>
    <div className="bg-secondary p-6 rounded-lg border border-border">
        {children}
    </div>
  </div>
);

const allSortOptions: Record<string, string> = {
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
    'year-desc': 'Year: Newest First',
    'mileage-asc': 'Mileage: Lowest First',
};

const allConditionFilters = ['New', 'Used'];

const SiteContent: React.FC = () => {
    const { siteContent, updateSiteContent } = useSiteContent();
    const { cars } = useCars();
    const [formData, setFormData] = useState<SiteContent>(siteContent);
    const [isUploadingHero, setIsUploadingHero] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (siteContent) {
            setFormData(prev => ({
                ...siteContent,
                // Ensure defaults if missing
                themeSettings: siteContent.themeSettings || {
                    primaryColor: '#2563EB',
                    secondaryColor: '#F3F4F6',
                    accentColor: '#2563EB',
                },
                paymentSettings: siteContent.paymentSettings || [
                    { id: 'card', label: 'Credit/Debit Card', enabled: true },
                    { id: 'pod', label: 'Pay on Delivery', enabled: true },
                    { id: 'bank_transfer', label: 'Bank Transfer', enabled: true }
                ],
                faq: siteContent.faq || []
            }));
        }
    }, [siteContent]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        if (keys.length > 1) {
            setFormData(prev => {
                const newFormState = { ...prev };
                let current: any = newFormState;
                for (let i = 0; i < keys.length - 1; i++) {
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
                return newFormState;
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleResetBackgroundColor = () => {
       setFormData(prev => {
           if (!prev.themeSettings) return prev;
           return {
               ...prev,
               themeSettings: {
                   ...prev.themeSettings,
                   backgroundColor: null // Use null to delete property in Firebase
               }
           };
       });
    };
    
    const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, options } = e.target;
        const value = Array.from(options)
            .filter(option => option.selected)
            .map(option => option.value);
        
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleSingleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value || null}));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploadingHero(true);
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `site_content/${fileName}`;
            
            try {
                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('images')
                    .getPublicUrl(filePath);

                setFormData(prev => ({...prev, hero: {...prev.hero, image: data.publicUrl }}));
            } catch (error: any) {
                console.error("Image upload failed", error);
                Swal.fire({
                    title: 'Upload Failed',
                    text: `Failed to upload image: ${error.message || 'Unknown error'}`,
                    icon: 'error',
                    confirmButtonColor: '#2563EB'
                });
            } finally {
                setIsUploadingHero(false);
            }
        }
    };
    
    const handleCheckboxChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      category: 'sortOptions' | 'conditionFilters'
    ) => {
        const { name, checked } = e.target;
        setFormData(prev => {
            const currentOptions = prev.inventorySettings[category];
            const newOptions = checked
                ? [...currentOptions, name]
                : currentOptions.filter(option => option !== name);
            return {
                ...prev,
                inventorySettings: {
                    ...prev.inventorySettings,
                    [category]: newOptions,
                },
            };
        });
    };

    const handlePaymentMethodChange = (index: number, field: keyof PaymentMethod, value: any) => {
        setFormData(prev => {
            const newMethods = [...prev.paymentSettings];
            newMethods[index] = { ...newMethods[index], [field]: value };
            return { ...prev, paymentSettings: newMethods };
        });
    };

    // FAQ Handlers
    const handleFaqChange = (index: number, field: keyof FaqItem, value: string) => {
        setFormData(prev => {
            const newFaq = [...prev.faq];
            newFaq[index] = { ...newFaq[index], [field]: value };
            return { ...prev, faq: newFaq };
        });
    };

    const handleAddFaq = () => {
        setFormData(prev => ({
            ...prev,
            faq: [...prev.faq, { question: '', answer: '' }]
        }));
    };

    const handleDeleteFaq = (index: number) => {
        setFormData(prev => ({
            ...prev,
            faq: prev.faq.filter((_, i) => i !== index)
        }));
    };


    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateSiteContent(formData);
            Swal.fire({
                title: 'Success!',
                text: 'Content saved successfully!',
                icon: 'success',
                confirmButtonColor: '#2563EB'
            });
        } catch (error) {
            console.error("Failed to save site content:", error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to save changes. Please try again.',
                icon: 'error',
                confirmButtonColor: '#2563EB'
            });
        } finally {
            setIsSaving(false);
        }
    }

    const inputClass = "w-full bg-background border border-input rounded-md p-2 focus:ring-ring focus:border-ring text-foreground";
    const carOptions = cars.map(car => <option key={car.id} value={car.id}>{car.make} {car.model} ({car.year})</option>);

    return (
        <div>
            <h1 className="text-3xl font-bold text-foreground mb-6">Manage Site Content</h1>

            <form onSubmit={handleSave}>
                <Section title="Theme & Branding">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Primary Color</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    name="themeSettings.primaryColor" 
                                    value={formData.themeSettings?.primaryColor || '#2563EB'} 
                                    onChange={handleInputChange} 
                                    className="h-10 w-16 p-1 bg-background border border-input rounded cursor-pointer"
                                />
                                <span className="text-sm text-muted-foreground uppercase">{formData.themeSettings?.primaryColor}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Used for buttons, active states, and links.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Accent Color</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    name="themeSettings.accentColor" 
                                    value={formData.themeSettings?.accentColor || '#2563EB'} 
                                    onChange={handleInputChange} 
                                    className="h-10 w-16 p-1 bg-background border border-input rounded cursor-pointer"
                                />
                                <span className="text-sm text-muted-foreground uppercase">{formData.themeSettings?.accentColor}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Used for highlights and featured elements.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Secondary Color</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    name="themeSettings.secondaryColor" 
                                    value={formData.themeSettings?.secondaryColor || '#F3F4F6'} 
                                    onChange={handleInputChange} 
                                    className="h-10 w-16 p-1 bg-background border border-input rounded cursor-pointer"
                                />
                                <span className="text-sm text-muted-foreground uppercase">{formData.themeSettings?.secondaryColor}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Used for card backgrounds and subtle UI elements.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Background Color</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    name="themeSettings.backgroundColor" 
                                    value={formData.themeSettings?.backgroundColor || '#FFFFFF'} 
                                    onChange={handleInputChange} 
                                    className="h-10 w-16 p-1 bg-background border border-input rounded cursor-pointer"
                                />
                                <button 
                                    type="button" 
                                    onClick={handleResetBackgroundColor}
                                    className="text-xs bg-secondary hover:bg-border border border-input px-2 py-1 rounded"
                                    title="Reset to default"
                                >
                                    Reset
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Overrides the main background.</p>
                        </div>
                    </div>
                </Section>

                <Section title="Payment Settings">
                    <div className="space-y-6">
                        <p className="text-sm text-muted-foreground mb-4">
                            Enable or disable payment methods available during checkout. Customize instructions for manual payment types.
                        </p>
                        {formData.paymentSettings?.map((method, index) => (
                            <div key={method.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center border-b border-border pb-4 last:border-0">
                                <div className="flex items-center h-full pt-2 sm:pt-0">
                                    <input
                                        type="checkbox"
                                        id={`payment-${method.id}`}
                                        checked={method.enabled}
                                        onChange={(e) => handlePaymentMethodChange(index, 'enabled', e.target.checked)}
                                        className="h-5 w-5 rounded border-border text-accent focus:ring-ring"
                                    />
                                </div>
                                <div className="flex-grow w-full sm:w-auto">
                                    <div className="flex items-center gap-2 mb-1">
                                         <label htmlFor={`payment-${method.id}`} className="font-bold text-foreground cursor-pointer">
                                            {method.label}
                                        </label>
                                        {method.id === 'card' && <ReceiptIcon className="w-4 h-4 text-muted-foreground"/>}
                                    </div>
                                    <input
                                        type="text"
                                        value={method.instructions || ''}
                                        onChange={(e) => handlePaymentMethodChange(index, 'instructions', e.target.value)}
                                        placeholder="Enter payment instructions (e.g. Bank Account details)"
                                        className={`${inputClass} text-sm`}
                                        disabled={!method.enabled}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="General Settings">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Site Name</label>
                            <input type="text" name="siteName" value={formData.siteName} onChange={handleInputChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Facebook URL</label>
                            <input type="text" name="socialHandles.facebook" value={formData.socialHandles.facebook} onChange={handleInputChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Twitter URL</label>
                            <input type="text" name="socialHandles.twitter" value={formData.socialHandles.twitter} onChange={handleInputChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Instagram URL</label>
                            <input type="text" name="socialHandles.instagram" value={formData.socialHandles.instagram} onChange={handleInputChange} className={inputClass} />
                        </div>
                    </div>
                </Section>
            
                <Section title="Homepage Management">
                    <div className="space-y-6">
                        <h3 className="font-semibold text-lg text-foreground">Hero Section</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Hero Title</label>
                            <input type="text" name="hero.title" value={formData.hero.title} onChange={handleInputChange} className={inputClass} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Hero Subtitle</label>
                            <textarea name="hero.subtitle" value={formData.hero.subtitle} onChange={handleInputChange} className={inputClass} rows={2} />
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-1">Hero Background Image</label>
                             <div className="flex items-center gap-4">
                                <img src={formData.hero.image} alt="Hero preview" className="w-40 h-24 object-cover rounded-md border border-border" />
                                <label className="cursor-pointer bg-background border-2 border-dashed border-border rounded-lg p-4 text-center flex-grow flex flex-col items-center justify-center">
                                     {isUploadingHero ? (
                                         <>
                                            <Spinner className="h-6 w-6 mb-1 text-muted-foreground"/>
                                            <span className="text-sm text-muted-foreground">Uploading...</span>
                                         </>
                                     ) : (
                                         <>
                                            <UploadIcon className="h-6 w-6 mx-auto mb-1 text-muted-foreground"/>
                                            <span className="text-sm text-muted-foreground">Change Image</span>
                                         </>
                                     )}
                                     <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingHero} />
                                 </label>
                             </div>
                        </div>
                        
                        <hr className="border-border"/>
                        
                        <h3 className="font-semibold text-lg text-foreground">Featured Car Sections</h3>
                        <p className="text-xs text-muted-foreground -mt-4">Hold Ctrl (or Cmd on Mac) to select multiple cars.</p>
                        <div>
                            <label className="block text-sm font-medium mb-1">New Arrivals (Max 3)</label>
                            <select name="newArrivalsCarIds" multiple value={formData.newArrivalsCarIds} onChange={handleMultiSelectChange} className={inputClass + " h-32"}>
                                {carOptions}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Best Deals (Max 3)</label>
                            <select name="bestDealsCarIds" multiple value={formData.bestDealsCarIds} onChange={handleMultiSelectChange} className={inputClass + " h-32"}>
                                {carOptions}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Trending Cars (Max 3)</label>
                            <select name="trendingCarsCarIds" multiple value={formData.trendingCarsCarIds} onChange={handleMultiSelectChange} className={inputClass + " h-32"}>
                                {carOptions}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Quality Pre-Owned (Max 3)</label>
                            <select name="usedCarsCarIds" multiple value={formData.usedCarsCarIds} onChange={handleMultiSelectChange} className={inputClass + " h-32"}>
                                {cars.filter(c => c.condition === 'Used').map(car => <option key={car.id} value={car.id}>{car.make} {car.model} ({car.year})</option>)}
                            </select>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Deal of the Week</label>
                                <select name="dealOfTheWeekCarId" value={formData.dealOfTheWeekCarId || ''} onChange={handleSingleSelectChange} className={inputClass}>
                                    <option value="">None</option>
                                    {carOptions}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Deal Expiration Date</label>
                                <input 
                                    type="datetime-local" 
                                    name="dealOfTheWeekExpireDate" 
                                    value={formData.dealOfTheWeekExpireDate || ''} 
                                    onChange={handleInputChange} 
                                    className={inputClass} 
                                />
                            </div>
                        </div>
                    </div>
                </Section>
            
                 <Section title="Contact Page Settings">
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium mb-1">Address</label><input type="text" name="contactInfo.address" value={formData.contactInfo.address} onChange={handleInputChange} className={inputClass} /></div>
                        <div><label className="block text-sm font-medium mb-1">Phone</label><input type="text" name="contactInfo.phone" value={formData.contactInfo.phone} onChange={handleInputChange} className={inputClass} /></div>
                        <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" name="contactInfo.email" value={formData.contactInfo.email} onChange={handleInputChange} className={inputClass} /></div>
                        <h3 className="font-semibold text-lg text-foreground pt-2">Business Hours</h3>
                        <div><label className="block text-sm font-medium mb-1">Monday - Friday</label><input type="text" name="contactInfo.hours.week" value={formData.contactInfo.hours.week} onChange={handleInputChange} className={inputClass} /></div>
                        <div><label className="block text-sm font-medium mb-1">Saturday</label><input type="text" name="contactInfo.hours.saturday" value={formData.contactInfo.hours.saturday} onChange={handleInputChange} className={inputClass} /></div>
                        <div><label className="block text-sm font-medium mb-1">Sunday</label><input type="text" name="contactInfo.hours.sunday" value={formData.contactInfo.hours.sunday} onChange={handleInputChange} className={inputClass} /></div>
                    </div>
                </Section>
                
                 <Section title="Inventory Page Settings">
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg text-foreground">Available Sort Options</h3>
                            <p className="text-sm text-muted-foreground mb-2">Select which options are available for users.</p>
                            {Object.entries(allSortOptions).map(([value, label]) => (
                                <div key={value} className="flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        id={`sort-${value}`}
                                        name={value}
                                        checked={formData.inventorySettings.sortOptions.includes(value)}
                                        onChange={(e) => handleCheckboxChange(e, 'sortOptions')}
                                        className="h-4 w-4 rounded border-border text-accent focus:ring-ring"
                                    />
                                    <label htmlFor={`sort-${value}`} className="ml-3 block text-sm font-medium text-foreground">
                                        {label}
                                    </label>
                                </div>
                            ))}
                        </div>
                         <div>
                            <h3 className="font-semibold text-lg text-foreground">Available Condition Filters</h3>
                            <p className="text-sm text-muted-foreground mb-2">Select which conditions users can filter by.</p>
                            {allConditionFilters.map((value) => (
                                <div key={value} className="flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        id={`filter-${value}`}
                                        name={value}
                                        checked={formData.inventorySettings.conditionFilters.includes(value)}
                                        onChange={(e) => handleCheckboxChange(e, 'conditionFilters')}
                                        className="h-4 w-4 rounded border-border text-accent focus:ring-ring"
                                    />
                                    <label htmlFor={`filter-${value}`} className="ml-3 block text-sm font-medium text-foreground">
                                        {value}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* FAQ Management Section */}
                <Section title="Frequently Asked Questions">
                    <div className="space-y-4">
                        {formData.faq && formData.faq.map((item, index) => (
                            <div key={index} className="flex flex-col gap-2 border-b border-border pb-4 last:border-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-sm text-muted-foreground">Question {index + 1}</h4>
                                    <button 
                                        type="button" 
                                        onClick={() => handleDeleteFaq(index)}
                                        className="text-red-500 hover:text-red-700 text-xs font-bold"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <input 
                                    type="text" 
                                    value={item.question} 
                                    onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                    placeholder="Question"
                                    className={inputClass}
                                />
                                <textarea 
                                    value={item.answer} 
                                    onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                    placeholder="Answer"
                                    className={inputClass}
                                    rows={2}
                                />
                            </div>
                        ))}
                        <button 
                            type="button" 
                            onClick={handleAddFaq}
                            className="w-full bg-accent/10 text-accent font-bold py-2 rounded-lg border border-accent/20 hover:bg-accent/20 transition-colors"
                        >
                            + Add New Question
                        </button>
                    </div>
                </Section>

                <div className="mt-8">
                    <button 
                        type="submit" 
                        className="w-full bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        disabled={isSaving || isUploadingHero}
                    >
                        {isSaving ? (
                            <>
                                <Spinner className="h-5 w-5" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            'Save All Changes'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SiteContent;
