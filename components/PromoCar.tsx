
import React from 'react';
import { Link } from 'react-router-dom';
import type { Car } from '../types';
import { useCountdown } from '../hooks/useCountdown';
import { useCars } from '../hooks/useCars';
import { useSiteContent } from '../hooks/useSiteContent';

interface PromoCarProps {
    car: Car;
}

const CountdownDisplay: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center">
        <span className="text-4xl font-bold text-foreground">{String(value).padStart(2, '0')}</span>
        <span className="text-xs text-muted-foreground uppercase">{label}</span>
    </div>
);

const PromoCar: React.FC<PromoCarProps> = ({ car }) => {
    const { siteContent } = useSiteContent();
    const { cars } = useCars();
    
    // Use configured expiration date or default to 24h from now if invalid
    const expireDateString = siteContent?.dealOfTheWeekExpireDate;
    const promoEndDate = expireDateString 
        ? new Date(expireDateString) 
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { days, hours, minutes, seconds, isExpired } = useCountdown(promoEndDate);
    
    const promoCar = cars.find(c => c.id === car.id);

    if (!promoCar) {
        return null;
    }

    return (
        <div className="bg-secondary py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="order-2 lg:order-1">
                        <h2 className="text-sm font-bold uppercase text-accent tracking-widest mb-2">Deal of the Week</h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{promoCar.make} {promoCar.model}</h3>
                        <p className="text-lg text-muted-foreground mb-8">
                            Experience unparalleled performance and luxury. For a limited time, get this exceptional vehicle at an exclusive price. Don't miss out!
                        </p>
                         <p className="text-2xl font-bold text-accent mb-6">
                             Special Offer: ₦{promoCar.price.toLocaleString()}
                             {promoCar.listingType === 'Rent' && <span className="text-sm font-normal text-muted-foreground ml-1">/ {promoCar.pricePeriod || 'Day'}</span>}
                         </p>

                        {isExpired ? (
                             <div className="text-center text-2xl font-bold text-red-500 py-4">Offer Expired!</div>
                        ) : (
                            <div className="flex justify-center sm:justify-start space-x-6 sm:space-x-10 my-8">
                                <CountdownDisplay value={days} label="Days" />
                                <CountdownDisplay value={hours} label="Hours" />
                                <CountdownDisplay value={minutes} label="Mins" />
                                <CountdownDisplay value={seconds} label="Secs" />
                            </div>
                        )}
                        
                        <Link 
                            to={`/car/${promoCar.id}`} 
                            className="inline-block bg-accent text-accent-foreground font-bold py-4 px-10 rounded-lg hover:bg-accent/90 transition-transform duration-300 transform hover:scale-105 text-lg"
                        >
                            View Deal
                        </Link>
                    </div>
                    <div className="order-1 lg:order-2">
                         <img 
                            src={promoCar.images[0]} 
                            alt={`${promoCar.make} ${promoCar.model}`} 
                            className="w-full h-auto object-cover rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromoCar;