
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import { useCars } from '../hooks/useCars';
import CarCard from '../components/CarCard';
import Modal from '../components/Modal';
import type { Car, TestDrive, Purchase, User } from '../types';
import { 
    CalendarIcon, CheckCircleIcon, ClockIcon, XCircleIcon, CompareIcon, HeartIcon,
    SettingsIcon, KeyIcon, ShieldCheckIcon, BellIcon, LogOutIcon, GoogleIcon, FacebookIcon, ReceiptIcon,
    MenuIcon, XIcon, InformationCircleIcon, UploadIcon, MapPinIcon, SearchIcon, Spinner, GiftIcon
} from '../components/IconComponents';
import { COUNTRIES_WITH_STATES } from '../data/locationData';
import { supabase } from '../supabase';
import Swal from 'sweetalert2';


type Tab = 'garage' | 'compare' | 'drives' | 'purchases' | 'verification' | 'settings' | 'loyalty';

// Helper Components (moved outside UserProfile)

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8 last:mb-0">
    <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>
    <div>{children}</div>
  </div>
);

const CarGrid: React.FC<{ cars: Car[] }> = ({ cars }) => {
    if (cars.length === 0) {
        return <p className="text-muted-foreground">No vehicles to display.</p>;
    }
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cars.map(car => <CarCard key={car.id} car={car} />)}
        </div>
    );
};

const CompareRow: React.FC<{ label: string; items: (string | number | React.ReactNode)[]; isBold?: boolean }> = ({ label, items, isBold }) => (
    <tr className="border-b border-border last:border-b-0">
        <td className={`p-3 font-semibold text-foreground ${isBold ? 'text-lg' : ''}`}>{label}</td>
        {items.map((item, index) => (
            <td key={index} className={`p-3 text-muted-foreground ${isBold ? 'font-bold text-foreground' : ''}`}>{item}</td>
        ))}
    </tr>
);

const StatusBadge: React.FC<{status: 'Approved' | 'Pending' | 'Completed' | 'Cancelled'}> = ({ status }) => {
    const statusStyles = {
        Approved: { text: 'text-green-500', bg: 'bg-green-500/10', icon: <CheckCircleIcon className="w-4 h-4" /> },
        Pending: { text: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: <ClockIcon className="w-4 h-4" /> },
        Completed: { text: 'text-blue-500', bg: 'bg-blue-500/10', icon: <CheckCircleIcon className="w-4 h-4" /> },
        Cancelled: { text: 'text-red-500', bg: 'bg-red-500/10', icon: <XCircleIcon className="w-4 h-4" /> },
    };
    const style = statusStyles[status];
    return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${style.bg} ${style.text}`}>{style.icon} {status}</span>
};

const TestDriveItem: React.FC<{
  drive: TestDrive;
  car?: Car;
  onCancel: (id: string) => void;
  onReschedule: (id: string, newDate: string) => void;
}> = ({ drive, car, onCancel, onReschedule }) => {
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [newDate, setNewDate] = useState(drive.bookingDate.split('T')[0]);

    const handleReschedule = () => {
        onReschedule(drive.id, new Date(newDate).toISOString());
        setIsRescheduling(false);
    };

    return (
        <div className="bg-card p-4 rounded-lg border border-border flex flex-col sm:flex-row gap-4">
            <img src={car?.images[0]} alt={car?.make} className="w-full sm:w-32 h-24 object-cover rounded-md" />
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-foreground">{car?.make} {car?.model}</h3>
                        <p className="text-sm text-muted-foreground">{new Date(drive.bookingDate).toLocaleString()}</p>
                    </div>
                    <StatusBadge status={drive.status} />
                </div>
                 <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{drive.location}</span>
                </div>
                {drive.status === 'Approved' && !isRescheduling && (
                     <div className="mt-3 flex gap-2">
                        <button onClick={() => setIsRescheduling(true)} className="text-xs px-3 py-1 rounded bg-accent/20 text-accent font-semibold hover:bg-accent/30">Reschedule</button>
                        <button onClick={() => onCancel(drive.id)} className="text-xs px-3 py-1 rounded bg-red-500/20 text-red-500 font-semibold hover:bg-red-500/30">Cancel</button>
                    </div>
                )}
                {isRescheduling && (
                    <div className="mt-3 flex gap-2 items-center">
                        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="bg-background border border-input rounded-md p-1 text-sm"/>
                        <button onClick={handleReschedule} className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground font-semibold">Save</button>
                        <button onClick={() => setIsRescheduling(false)} className="text-xs px-3 py-1 rounded bg-secondary text-secondary-foreground font-semibold">Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
};


const PurchaseItem: React.FC<{ purchase: Purchase, car?: Car }> = ({ purchase, car }) => (
    <div className="bg-card p-4 rounded-lg border border-border flex flex-col sm:flex-row gap-4">
        <img src={car?.images[0]} alt={car?.make} className="w-full sm:w-32 h-24 object-cover rounded-md" />
        <div className="flex-grow">
            <h3 className="font-bold text-foreground">{car?.make} {car?.model}</h3>
            <div className="flex justify-between items-start">
                <div>
                     <p className="text-sm text-muted-foreground">Purchased on: {new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                     <p className="text-sm text-muted-foreground mt-1">Method: <span className="font-medium text-foreground">{purchase.paymentMethod || 'Standard'}</span></p>
                </div>
                <p className="text-lg font-semibold text-accent">₦{purchase.pricePaid.toLocaleString()}</p>
            </div>
             <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                <span>Dealership: {purchase.dealership}</span>
            </div>
        </div>
    </div>
);

const CompareTable: React.FC<{ cars: Car[] }> = ({ cars }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <tbody>
                <CompareRow label="Vehicle" items={cars.map(c => <Link to={`/car/${c.id}`} className="font-bold text-accent hover:underline">{c.make} {c.model}</Link>)} isBold />
                <CompareRow label="Price" items={cars.map(c => `₦${c.price.toLocaleString()}`)} />
                <CompareRow label="Year" items={cars.map(c => c.year)} />
                <CompareRow label="Mileage" items={cars.map(c => `${c.mileage.toLocaleString()} mi`)} />
                <CompareRow label="Engine" items={cars.map(c => c.engine)} />
                <CompareRow label="Fuel Type" items={cars.map(c => c.fuelType)} />
                <CompareRow label="Transmission" items={cars.map(c => c.transmission)} />
            </tbody>
        </table>
    </div>
);

const LoyaltyContent: React.FC<{ user: User }> = ({ user }) => {
    const points = user.loyaltyPoints || 0;
    const tier = user.tier || 'Bronze';
    const referrals = user.referrals || 0;
    
    const tierColors = {
        Bronze: 'from-orange-400 to-orange-600',
        Silver: 'from-gray-300 to-gray-500',
        Gold: 'from-yellow-400 to-yellow-600',
        Platinum: 'from-slate-300 to-slate-500 border-2 border-purple-500',
    };

    const nextTierThreshold = tier === 'Bronze' ? 500 : tier === 'Silver' ? 1500 : tier === 'Gold' ? 3000 : 10000;
    const progress = Math.min((points / nextTierThreshold) * 100, 100);

    const copyReferral = () => {
        if (user.referralCode) {
            navigator.clipboard.writeText(user.referralCode);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Copied!',
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Status Card */}
            <div className={`bg-gradient-to-r ${tierColors[tier]} rounded-xl p-8 text-white shadow-lg relative overflow-hidden`}>
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                    <GiftIcon className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Current Tier</h3>
                            <h2 className="text-4xl font-extrabold">{tier} Member</h2>
                        </div>
                        <div className="text-right">
                            <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Total Points</h3>
                            <h2 className="text-4xl font-extrabold">{points.toLocaleString()}</h2>
                        </div>
                    </div>

                    {tier !== 'Platinum' && (
                        <div>
                            <div className="flex justify-between text-xs font-semibold mb-1 opacity-90">
                                <span>Progress to Next Tier</span>
                                <span>{points} / {nextTierThreshold}</span>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-2">
                                <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Benefits */}
                <div className="bg-secondary p-6 rounded-lg border border-border">
                    <h3 className="text-xl font-bold text-foreground mb-4">Your Rewards</h3>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                            <span>Earn points on every service booking & purchase</span>
                        </li>
                        {tier !== 'Bronze' && (
                             <li className="flex items-center gap-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                <span>5% Discount on Service Bookings (Silver+)</span>
                            </li>
                        )}
                         {(tier === 'Gold' || tier === 'Platinum') && (
                             <li className="flex items-center gap-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                <span>10% Discount on Service Bookings (Gold+)</span>
                            </li>
                        )}
                         {tier === 'Platinum' && (
                             <li className="flex items-center gap-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                <span>Priority Support & Concierge Service</span>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Referral */}
                <div className="bg-secondary p-6 rounded-lg border border-border">
                    <h3 className="text-xl font-bold text-foreground mb-4">Refer & Earn</h3>
                    <p className="text-muted-foreground mb-4">Share your code with friends. You get 500 points when they buy a car!</p>
                    
                    <div className="flex items-center gap-4 bg-background p-3 rounded-md border border-input mb-4">
                        <code className="flex-grow font-mono font-bold text-lg text-center tracking-wider text-accent">
                            {user.referralCode || 'Generating...'}
                        </code>
                        <button onClick={copyReferral} className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-bold hover:bg-primary/90">
                            Copy
                        </button>
                    </div>
                     <div className="text-center">
                         <p className="text-sm font-semibold text-muted-foreground">Total Referrals: <span className="text-foreground">{referrals}</span></p>
                     </div>
                </div>
            </div>
        </div>
    );
};

const GarageContent: React.FC<{favoriteCars: Car[], recentlyViewedCars: Car[]}> = ({ favoriteCars, recentlyViewedCars }) => (
    <div>
        <Section title="My Favorites">
            <CarGrid cars={favoriteCars} />
        </Section>
        <Section title="Recently Viewed">
            <CarGrid cars={recentlyViewedCars} />
        </Section>
    </div>
);

const CompareContent: React.FC<{compareCars: Car[], onClear: () => void}> = ({ compareCars, onClear }) => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">Compare Vehicles</h2>
            {compareCars.length > 0 && <button onClick={onClear} className="text-sm font-semibold text-accent hover:underline">Clear All</button>}
        </div>
        {compareCars.length > 0 ? <CompareTable cars={compareCars} /> : <p className="text-muted-foreground">Add cars from the inventory to compare.</p>}
    </div>
);

const DrivesContent: React.FC<{
    testDrives: TestDrive[],
    cars: Car[],
    onCancel: (id: string) => void,
    onReschedule: (id: string, newDate: string) => void,
}> = ({ testDrives, cars, onCancel, onReschedule }) => (
    <div className="space-y-4">
        {testDrives.length > 0 ? (
            testDrives.map(drive => {
                const car = cars.find(c => c.id === drive.carId);
                return <TestDriveItem key={drive.id} drive={drive} car={car} onCancel={onCancel} onReschedule={onReschedule} />;
            })
        ) : <p className="text-muted-foreground">You have no scheduled test drives.</p>}
    </div>
);

const PurchasesContent: React.FC<{purchases: Purchase[], cars: Car[]}> = ({ purchases, cars }) => (
    <div className="space-y-4">
        {purchases.length > 0 ? (
            purchases.map(purchase => {
                const car = cars.find(c => c.id === purchase.carId);
                return <PurchaseItem key={purchase.id} purchase={purchase} car={car} />;
            })
        ) : <p className="text-muted-foreground">You have not made any purchases.</p>}
    </div>
);

const KycUploadForm: React.FC<{user: User, onUpdateKyc: () => void}> = ({ user, onUpdateKyc }) => {
    const { updateUserContext } = useAuth();
    const [docType, setDocType] = useState<'NIN' | 'DriversLicense' | 'Passport'>(user.kycDocument?.type || 'NIN');
    const [frontImage, setFrontImage] = useState<File | null>(null);
    const [backImage, setBackImage] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `kyc/${user.uid}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);
            
        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!frontImage) {
            Swal.fire({
                title: 'Image Required',
                text: "Please select the required document image.",
                icon: 'warning',
                confirmButtonColor: '#2563EB'
            });
            return;
        }

        setIsUploading(true);
        try {
            const frontUrl = await handleUpload(frontImage);
            const backUrl = backImage ? await handleUpload(backImage) : undefined;
            
            const kycData = {
                type: docType,
                front: frontUrl,
                ...(backUrl && { back: backUrl }),
            };

            await updateUserContext({ kycDocument: kycData, verificationStatus: 'Pending' });
            onUpdateKyc();
            Swal.fire({
                title: 'Success!',
                text: "Documents submitted successfully for verification.",
                icon: 'success',
                confirmButtonColor: '#2563EB'
            });

        } catch (error: any) {
            console.error("KYC upload failed:", error);
            Swal.fire({
                title: 'Upload Failed',
                text: `An error occurred during upload: ${error.message || 'Unknown error'}`,
                icon: 'error',
                confirmButtonColor: '#2563EB'
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Document Type</label>
                <select value={docType} onChange={e => setDocType(e.target.value as any)} className="w-full bg-background border border-input rounded-md p-2">
                    <option value="NIN">National Identification Number (NIN)</option>
                    <option value="DriversLicense">Driver's License</option>
                    <option value="Passport">International Passport</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">{docType === 'DriversLicense' ? 'Front of Document' : 'Document Image'}</label>
                <input type="file" onChange={e => setFrontImage(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"/>
            </div>
             {docType === 'DriversLicense' && (
                <div>
                    <label className="block text-sm font-medium mb-1">Back of Document</label>
                    <input type="file" onChange={e => setBackImage(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"/>
                </div>
            )}
            <button type="submit" disabled={isUploading} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50">
                {isUploading ? 'Submitting...' : 'Submit for Verification'}
            </button>
        </form>
    );
};

const VerificationContent: React.FC<{user: User}> = ({ user }) => {
    const [showForm, setShowForm] = useState(false);
    const statusInfo = {
        Unverified: { color: 'gray', message: 'Your account is not verified. Please submit your documents to access all features.' },
        Pending: { color: 'yellow', message: 'Your documents are under review. This usually takes 1-2 business days.' },
        Verified: { color: 'green', message: 'Your account is verified! You have full access to all features.' },
        Rejected: { color: 'red', message: 'Your verification was unsuccessful. Please review your documents and resubmit.' },
    };
    const currentStatus = statusInfo[user.verificationStatus];
    
    return (
        <div className="bg-secondary p-6 rounded-lg border border-border">
            <div className={`p-4 rounded-md bg-${currentStatus.color}-500/10 text-${currentStatus.color}-500 flex items-start gap-3 mb-6`}>
                <InformationCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold">Status: {user.verificationStatus}</h3>
                    <p className="text-sm">{currentStatus.message}</p>
                </div>
            </div>
            
            {user.verificationStatus !== 'Verified' && !showForm && (
                <button onClick={() => setShowForm(true)} className="w-full bg-accent text-accent-foreground font-bold py-3 rounded-lg hover:bg-accent/90">
                    {user.verificationStatus === 'Unverified' || user.verificationStatus === 'Rejected' ? 'Start Verification' : 'Resubmit Documents'}
                </button>
            )}

            {showForm && <KycUploadForm user={user} onUpdateKyc={() => setShowForm(false)} />}
        </div>
    );
};

const PersonalInformationForm: React.FC<{user: User, onUpdate: () => void}> = ({ user, onUpdate }) => {
    const { updateUserContext } = useAuth();
    const [formData, setFormData] = useState({ fname: user.fname, lname: user.lname, phone: user.phone });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUserContext(formData);
        onUpdate();
        Swal.fire({
            title: 'Updated',
            text: "Personal information updated.",
            icon: 'success',
            confirmButtonColor: '#2563EB'
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">First Name</label><input type="text" name="fname" value={formData.fname} onChange={handleChange} className="w-full bg-background border border-input rounded-md p-2"/></div>
                <div><label className="block text-sm font-medium mb-1">Last Name</label><input type="text" name="lname" value={formData.lname} onChange={handleChange} className="w-full bg-background border border-input rounded-md p-2"/></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Phone Number</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-background border border-input rounded-md p-2"/></div>
            <div><button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold">Save Changes</button></div>
        </form>
    );
};

const AddressForm: React.FC<{user: User, onUpdate: () => void}> = ({ user, onUpdate }) => {
    const { updateUserContext } = useAuth();
    const [formData, setFormData] = useState({
        street: user.address?.street || '', city: user.address?.city || '', zip: user.address?.zip || '', country: user.country || '', state: user.state || ''
    });
    const [statesForCountry, setStatesForCountry] = useState<string[]>([]);
    
    useEffect(() => {
        if(formData.country) {
            setStatesForCountry(COUNTRIES_WITH_STATES[formData.country] || []);
        }
    }, [formData.country]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if(name === 'country') {
            setFormData(prev => ({...prev, state: ''}));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { country, state, ...address } = formData;
        updateUserContext({ address, country, state });
        onUpdate();
        Swal.fire({
            title: 'Updated',
            text: "Address information updated.",
            icon: 'success',
            confirmButtonColor: '#2563EB'
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Street Address</label><input type="text" name="street" value={formData.street} onChange={handleChange} className="w-full bg-background border border-input rounded-md p-2"/></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-background border border-input rounded-md p-2"/></div>
                <div><label className="block text-sm font-medium mb-1">ZIP / Postal Code</label><input type="text" name="zip" value={formData.zip} onChange={handleChange} className="w-full bg-background border border-input rounded-md p-2"/></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><label className="block text-sm font-medium mb-1">Country</label>
                    <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-background border border-input rounded-md p-2">
                        <option value="" disabled>Select Country</option>
                        {Object.keys(COUNTRIES_WITH_STATES).sort().map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">State/Province</label>
                    <select name="state" value={formData.state} onChange={handleChange} className="w-full bg-background border border-input rounded-md p-2" disabled={!formData.country}>
                        <option value="" disabled>Select State</option>
                        {statesForCountry.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div><button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold">Save Changes</button></div>
        </form>
    );
};

const AccountSettings: React.FC = () => (
    <div className="space-y-4">
        <Link to="/profile/change-password" className="text-accent font-semibold flex items-center gap-2"><KeyIcon className="w-5 h-5"/>Change Password</Link>
        <p className="text-sm text-muted-foreground">For security, you will be asked for your current password.</p>
        <hr className="border-border"/>
        <h3 className="text-lg font-bold text-red-500 pt-2">Delete Account</h3>
        <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
        <button className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold">Delete My Account</button>
    </div>
);


const NotificationSettings: React.FC = () => (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div>
                <h4 className="font-semibold">Promotional Emails</h4>
                <p className="text-sm text-muted-foreground">Receive news, special offers, and promotions.</p>
            </div>
            <input type="checkbox" className="toggle-checkbox" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
            <div>
                <h4 className="font-semibold">New Listing Alerts</h4>
                <p className="text-sm text-muted-foreground">Get notified when new cars match your interests.</p>
            </div>
            <input type="checkbox" className="toggle-checkbox" />
        </div>
    </div>
);

const SettingsContent: React.FC<{ user: User }> = ({ user }) => {
    const [editingSection, setEditingSection] = useState<'personal' | 'address' | null>(null);

    return (
        <div className="space-y-8">
            <Section title="Personal Information">
                {editingSection === 'personal' ? (
                    <PersonalInformationForm user={user} onUpdate={() => setEditingSection(null)} />
                ) : (
                    <div className="text-muted-foreground">
                        <p><strong>Name:</strong> {user.fname} {user.lname}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone:</strong> {user.phone}</p>
                        <button onClick={() => setEditingSection('personal')} className="text-accent font-semibold mt-2">Edit</button>
                    </div>
                )}
            </Section>
            <Section title="Address">
                 {editingSection === 'address' ? (
                    <AddressForm user={user} onUpdate={() => setEditingSection(null)} />
                ) : (
                    <div className="text-muted-foreground">
                        <p>{user.address ? `${user.address.street}, ${user.address.city}, ${user.address.zip}` : 'Not provided'}</p>
                        <p>{user.state}, {user.country}</p>
                        <button onClick={() => setEditingSection('address')} className="text-accent font-semibold mt-2">Edit</button>
                    </div>
                )}
            </Section>
            <Section title="Account Settings"><AccountSettings /></Section>
            <Section title="Notification Settings"><NotificationSettings /></Section>
        </div>
    );
};

const UserProfile: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('garage');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout, loading: authLoading } = useAuth();
    const { testDrives, purchases, loading: userDataLoading, cancelTestDrive, rescheduleTestDrive, clearCompare } = useUserData();
    const { cars, loading: carsLoading } = useCars();

    const loading = authLoading || userDataLoading || carsLoading;

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    const { favoriteCars, recentlyViewedCars, compareCars } = useMemo(() => {
        const carMap = new Map(cars.map(car => [car.id, car]));
        const favorites = user?.favorites?.map(id => carMap.get(id)).filter((c): c is Car => !!c) || [];
        const recent = user?.recentlyViewed?.map(id => carMap.get(id)).filter((c): c is Car => !!c) || [];
        const compare = user?.compareItems?.map(id => carMap.get(id)).filter((c): c is Car => !!c) || [];
        return { favoriteCars: favorites, recentlyViewedCars: recent, compareCars: compare };
    }, [user, cars]);

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner className="h-16 w-16" /></div>;
    }
    
    const tabs = [
        { id: 'garage', label: 'My Garage', icon: <HeartIcon className="w-5 h-5"/> },
        { id: 'compare', label: 'Compare', icon: <CompareIcon className="w-5 h-5"/> },
        { id: 'drives', label: 'Test Drives', icon: <CalendarIcon className="w-5 h-5"/> },
        { id: 'purchases', label: 'Purchases', icon: <ReceiptIcon className="w-5 h-5"/> },
        { id: 'loyalty', label: 'Loyalty Program', icon: <GiftIcon className="w-5 h-5"/> },
        { id: 'verification', label: 'Verification', icon: <ShieldCheckIcon className="w-5 h-5"/> },
        { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5"/> },
    ];
    
    const TabButton: React.FC<{tab: typeof tabs[0]}> = ({ tab }) => (
         <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as Tab); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
        >
            {tab.icon}
            <span>{tab.label}</span>
        </button>
    );

    return (
        <div className="bg-background min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="md:hidden flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">My Account</h1>
                     <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2">
                        {isMobileMenuOpen ? <XIcon className="w-6 h-6"/> : <MenuIcon className="w-6 h-6"/>}
                    </button>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-4 gap-8 ${isMobileMenuOpen ? 'block' : 'hidden md:grid'}`}>
                    <aside className="md:col-span-1">
                        <div className="bg-secondary p-4 rounded-lg border border-border">
                            <div className="text-center pb-4 mb-4 border-b border-border">
                                <h2 className="text-xl font-bold">{user.fname} {user.lname}</h2>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <nav className="space-y-2">
                               {tabs.map(tab => <TabButton key={tab.id} tab={tab}/>)}
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-secondary"
                                >
                                    <LogOutIcon className="w-5 h-5"/>
                                    <span>Logout</span>
                                </button>
                            </nav>
                        </div>
                    </aside>

                    <main className="md:col-span-3">
                        {activeTab === 'garage' && <GarageContent favoriteCars={favoriteCars} recentlyViewedCars={recentlyViewedCars} />}
                        {activeTab === 'compare' && <CompareContent compareCars={compareCars} onClear={clearCompare} />}
                        {activeTab === 'drives' && <DrivesContent testDrives={testDrives} cars={cars} onCancel={cancelTestDrive} onReschedule={rescheduleTestDrive}/>}
                        {activeTab === 'purchases' && <PurchasesContent purchases={purchases} cars={cars} />}
                        {activeTab === 'loyalty' && <LoyaltyContent user={user} />}
                        {activeTab === 'verification' && <VerificationContent user={user} />}
                        {activeTab === 'settings' && <SettingsContent user={user} />}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
