
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCars } from '../hooks/useCars';
import { FuelIcon, GaugeIcon, TransmissionIcon, ArrowLeftIcon, HeartIcon, ShieldCheckIcon, Spinner, ReceiptIcon } from '../components/IconComponents';
import { useUserData } from '../hooks/useUserData';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';
import { db } from '../firebase';
import { sendEmail } from '../services/emailService';

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { cars, verifyCar, loading: carsLoading } = useCars();
  const [car, setCar] = useState(cars.find(c => c.id === id));
  const [mainImage, setMainImage] = useState<string | undefined>(undefined);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isVerifyConfirmModalOpen, setIsVerifyConfirmModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addRecentlyViewed, scheduleTestDrive, addPurchase } = useUserData();

  useEffect(() => {
    const foundCar = cars.find(c => c.id === id);
    setCar(foundCar);
    if (foundCar) {
      setMainImage(foundCar.images?.[0]);
      addRecentlyViewed(foundCar.id);
    }
  }, [id, cars, addRecentlyViewed]);

  const handleToggleFavorite = async () => {
    if (!user || !car) return;
    const userFavoritesRef = db.ref(`users/${user.uid}/favorites`);
    const isCurrentlyFavorite = user.favorites?.includes(car.id) ?? false;

    await userFavoritesRef.transaction((currentData: string[] | null) => {
      if (currentData === null) {
        return isCurrentlyFavorite ? [] : [car.id];
      }
      const currentList = Array.isArray(currentData) ? currentData : [];
      if (isCurrentlyFavorite) {
        return currentList.filter(id => id !== car.id);
      } else {
        if (!currentList.includes(car.id)) {
          return [...currentList, car.id];
        }
        return currentList;
      }
    });
  };

  const isFavorite = user?.favorites?.includes(car?.id ?? '') ?? false;
  const canVerify = user && (user.role === 'dealer' || user.role === 'superadmin');
  const isRent = car?.listingType === 'Rent';

  const fetchDealerInfo = async (dealerId: string) => {
      try {
          const snapshot = await db.ref(`users/${dealerId}`).once('value');
          if (snapshot.exists()) {
              const data = snapshot.val();
              return { name: `${data.fname} ${data.lname}`, email: data.email };
          }
      } catch (e) {
          console.error("Error fetching dealer info", e);
      }
      return { name: 'AutoSphere Dealer', email: 'dealer@autosphere.com' }; // Fallback
  };

  const handleScheduleClick = async () => {
    if (!user) {
      navigate('/login', { state: { from: window.location } });
      return;
    }
    if (user.verificationStatus !== 'Verified') {
      setIsVerificationModalOpen(true);
      return;
    }
    
    if (!car) return;
    setProcessing(true);

    try {
        // 1. Create Test Drive Record
        const bookingDate = new Date().toISOString();
        await scheduleTestDrive({
            carId: car.id,
            bookingDate: bookingDate,
            location: 'Dealership Main Branch', // Default for now
            status: 'Pending'
        });

        // 2. Fetch Dealer Info
        const dealer = await fetchDealerInfo(car.dealerId);

        // 3. Send Email to User
        const userSubject = isRent ? "Rental Request Received" : "Test Drive Scheduled";
        const userBody = `Dear ${user.fname},\n\nYour request for a ${isRent ? 'rental' : 'test drive'} of the ${car.year} ${car.make} ${car.model} has been received.\n\nWe will review your request and contact you shortly to confirm the details.\n\nThank you,\nAutoSphere Team`;
        await sendEmail(user.email, userSubject, userBody);

        // 4. Send Email to Dealer
        const dealerSubject = isRent ? "New Rental Request" : "New Test Drive Request";
        const dealerBody = `Hello ${dealer.name},\n\nA new request has been made for your listing: ${car.year} ${car.make} ${car.model}.\n\nCustomer: ${user.fname} ${user.lname} (${user.email})\nType: ${isRent ? 'Rental' : 'Test Drive'}\n\nPlease check your dashboard for details.`;
        await sendEmail(dealer.email, dealerSubject, dealerBody);

        alert(`${isRent ? 'Rental request' : 'Test drive'} scheduled successfully! Check your email for confirmation.`);

    } catch (error) {
        console.error("Error scheduling:", error);
        alert("Failed to schedule. Please try again.");
    } finally {
        setProcessing(false);
    }
  };

  const handlePurchaseClick = () => {
      if (!user) {
          navigate('/login', { state: { from: window.location } });
          return;
      }
      if (user.verificationStatus !== 'Verified') {
          setIsVerificationModalOpen(true);
          return;
      }
      setIsPurchaseModalOpen(true);
  };

  const confirmPurchase = async () => {
      if (!user || !car) return;
      setProcessing(true);
      
      try {
          // 1. Fetch Dealer Info
          const dealer = await fetchDealerInfo(car.dealerId);

          // 2. Create Purchase Record
          await addPurchase({
              carId: car.id,
              purchaseDate: new Date().toISOString(),
              pricePaid: car.price,
              dealership: dealer.name
          });

          // 3. Send Email to User
          const userSubject = "Purchase Confirmation - AutoSphere";
          const userBody = `Dear ${user.fname},\n\nCongratulations on your purchase of the ${car.year} ${car.make} ${car.model}!\n\nPrice: ₦${car.price.toLocaleString()}\nTransaction ID: ${Date.now()}\n\nThe dealer (${dealer.name}) will contact you shortly to finalize the paperwork and delivery.\n\nThank you for choosing AutoSphere!`;
          await sendEmail(user.email, userSubject, userBody);

          // 4. Send Email to Dealer
          const dealerSubject = "Vehicle Sold! - New Purchase Order";
          const dealerBody = `Hello ${dealer.name},\n\nGreat news! Your listing ${car.year} ${car.make} ${car.model} has been sold.\n\nBuyer: ${user.fname} ${user.lname} (${user.email})\nPrice: ₦${car.price.toLocaleString()}\n\nPlease contact the buyer to arrange delivery.`;
          await sendEmail(dealer.email, dealerSubject, dealerBody);

          setIsPurchaseModalOpen(false);
          alert("Purchase successful! A confirmation email has been sent to you.");
          navigate('/profile'); // Redirect to profile/purchases

      } catch (error) {
          console.error("Purchase failed:", error);
          alert("An error occurred during the purchase. Please contact support.");
      } finally {
          setProcessing(false);
      }
  };

  const handleVerifyConfirm = () => {
    if (car) {
      verifyCar(car.id);
    }
    setIsVerifyConfirmModalOpen(false);
  };
  
  if (carsLoading) {
      return <div className="min-h-screen flex items-center justify-center"><Spinner className="h-16 w-16" /></div>;
  }

  if (!car) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl text-foreground">Car not found</h1>
        <Link to="/inventory" className="text-accent mt-4 inline-block">Back to Inventory</Link>
      </div>
    );
  }
  

  return (
    <>
      <div className="bg-background pt-12 pb-24 sm:pt-16 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to results</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <img src={mainImage || car.images?.[0]} alt="Main car view" className="w-full h-auto rounded-lg shadow-2xl object-cover mb-4" />
              <div className="grid grid-cols-3 gap-4">
                {(car.images || []).map((img, index) => (
                  <img 
                    key={index} 
                    src={img} 
                    alt={`Car view ${index + 1}`} 
                    className={`w-full h-24 object-cover rounded-md cursor-pointer transition-opacity duration-200 ${mainImage === img ? 'opacity-100 border-2 border-accent' : 'opacity-60 hover:opacity-100'}`}
                    onClick={() => setMainImage(img)}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${isRent ? 'bg-orange-500/10 text-orange-600' : 'bg-blue-500/10 text-blue-600'}`}>
                    {isRent ? 'For Rent' : 'For Sale'}
                </span>
                <h1 className="text-4xl font-bold text-foreground">{car.make} {car.model}</h1>
                {car.verificationStatus === 'Verified' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                        <ShieldCheckIcon className="h-5 w-5" />
                        Verified
                    </span>
                )}
              </div>
              <p className="text-xl text-muted-foreground mb-4">{car.year} - {car.condition}</p>
              <p className="text-4xl font-bold text-accent mb-6">
                  ₦{car.price.toLocaleString()}
                  {isRent && <span className="text-lg font-normal text-muted-foreground ml-1">/ {car.pricePeriod || 'Day'}</span>}
              </p>
              
              <div className="grid grid-cols-3 gap-4 text-center my-6 border-y border-border py-4">
                <div className="flex flex-col items-center"><FuelIcon className="h-7 w-7 text-muted-foreground mb-1" /><span className="text-md text-foreground">{car.fuelType}</span></div>
                <div className="flex flex-col items-center"><GaugeIcon className="h-7 w-7 text-muted-foreground mb-1" /><span className="text-md text-foreground">{car.mileage.toLocaleString()} mi</span></div>
                <div className="flex flex-col items-center"><TransmissionIcon className="h-7 w-7 text-muted-foreground mb-1" /><span className="text-md text-foreground">{car.transmission}</span></div>
              </div>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Description</h3>
              <p className="text-muted-foreground mb-6">{car.description}</p>
              
              {car.images && car.images[1] && (
                <img 
                  src={car.images[1]} 
                  alt={`${car.make} ${car.model} interior`} 
                  className="w-full h-auto rounded-lg shadow-xl my-8 object-cover" 
                />
              )}

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Key Features</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-8">
                {(car.features || []).map((feature, index) => <li key={index}>{feature}</li>)}
              </ul>

              <div className="space-y-4">
                <div className="flex space-x-4">
                    <button
                        onClick={handleScheduleClick}
                        disabled={processing}
                        className="w-full bg-secondary text-foreground border border-border font-bold py-4 px-6 rounded-lg hover:bg-secondary/80 transition-colors duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? 'Processing...' : (isRent ? 'Request Booking' : 'Schedule Test Drive')}
                    </button>
                    {user && (
                        <button
                            onClick={handleToggleFavorite}
                            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                            className={`p-4 rounded-lg transition-colors duration-200 border ${isFavorite ? 'bg-red-500/10 text-red-500 border-red-500' : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'}`}
                            aria-pressed={isFavorite}
                        >
                            <HeartIcon className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>
                {!isRent && (
                    <button
                        onClick={handlePurchaseClick}
                        disabled={processing}
                        className="w-full bg-primary text-primary-foreground font-bold py-4 px-6 rounded-lg hover:bg-primary/90 transition-colors duration-300 text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ReceiptIcon className="w-6 h-6" />
                        {processing ? 'Processing...' : 'Purchase Vehicle'}
                    </button>
                )}
              </div>

              {canVerify && car.verificationStatus === 'Unverified' && (
                <div className="mt-6 p-4 bg-secondary border border-border rounded-lg">
                    <h4 className="font-semibold text-foreground">Admin Action</h4>
                    <p className="text-sm text-muted-foreground mb-3">This listing has not been verified yet.</p>
                    <button
                        onClick={() => setIsVerifyConfirmModalOpen(true)}
                        className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Verify Listing
                    </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal 
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        title="Account Verification Required"
      >
        <div className="text-center">
            <ShieldCheckIcon className="h-16 w-16 mx-auto text-accent mb-4" />
            <p className="text-muted-foreground mb-6">
                To ensure the security of all transactions, you must verify your account before scheduling a test drive, booking a rental, or making a purchase.
            </p>
            <button
                onClick={() => {
                    setIsVerificationModalOpen(false);
                    navigate('/profile');
                }}
                className="w-full bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors"
            >
                Go to Verification
            </button>
        </div>
      </Modal>

       <Modal
        isOpen={isVerifyConfirmModalOpen}
        onClose={() => setIsVerifyConfirmModalOpen(false)}
        title="Confirm Listing Verification"
      >
        <div>
            <p className="text-muted-foreground mb-6">
                Are you sure you want to verify this listing for the {car.make} {car.model}? This action confirms that all details are accurate and the vehicle is available as described.
            </p>
            <div className="flex justify-end gap-3">
                <button onClick={() => setIsVerifyConfirmModalOpen(false)} className="bg-secondary text-secondary-foreground font-bold py-2 px-4 rounded-lg hover:bg-border">
                    Cancel
                </button>
                <button onClick={handleVerifyConfirm} className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg hover:bg-primary/90">
                    Yes, Verify
                </button>
            </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="Confirm Purchase"
      >
        <div className="text-center">
            <div className="bg-accent/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                <ReceiptIcon className="w-10 h-10 text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{car.make} {car.model}</h3>
            <p className="text-3xl font-bold text-primary mb-6">₦{car.price.toLocaleString()}</p>
            
            <p className="text-muted-foreground mb-6 text-sm">
                By clicking confirm, you are initiating a binding agreement to purchase this vehicle. 
                The dealer will be notified immediately, and a confirmation email will be sent to your registered address <strong>({user?.email})</strong>.
            </p>

            <div className="flex gap-4">
                <button 
                    onClick={() => setIsPurchaseModalOpen(false)} 
                    disabled={processing}
                    className="flex-1 bg-secondary text-foreground font-bold py-3 rounded-lg hover:bg-border transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={confirmPurchase} 
                    disabled={processing}
                    className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                    {processing && <Spinner className="w-5 h-5" />}
                    {processing ? 'Processing...' : 'Confirm Purchase'}
                </button>
            </div>
        </div>
      </Modal>
    </>
  );
};

export default CarDetail;
