
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { db } from '../firebase';
import { SiteContent, FaqItem, Testimonial, PaymentMethod } from '../types';

interface SiteContentContextType {
  siteContent: SiteContent | null;
  loading: boolean;
  updateSiteContent: (newContent: Partial<SiteContent>) => Promise<void>;
}

export const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);


const FAQ_DATA: FaqItem[] = [
    { question: "What financing options do you offer?", answer: "We partner with a variety of trusted lenders to offer flexible financing options." },
    { question: "Can I trade in my current vehicle?", answer: "Absolutely! We offer competitive trade-in values for all types of vehicles." },
    { question: "Do your used cars come with a warranty?", answer: "Yes, many of our certified pre-owned vehicles come with a comprehensive limited warranty." },
];

const TESTIMONIALS: Testimonial[] = [
    { quote: "The team at AutoSphere made my car buying experience incredibly smooth.", author: "Tunde Adebayo", location: "Lagos, Nigeria", avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=100&q=80", rating: 5 },
    { quote: "I was impressed with the quality of their inventory and the professionalism of the staff.", author: "Fatima Aliyu", location: "Abuja, Nigeria", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80", rating: 5 },
];

const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
    { id: 'card', label: 'Credit/Debit Card', enabled: true, instructions: 'Secure payment via Stripe/Paystack.' },
    { id: 'pod', label: 'Pay on Delivery', enabled: true, instructions: 'Pay via cash or transfer upon vehicle delivery.' },
    { id: 'bank_transfer', label: 'Bank Transfer', enabled: true, instructions: 'Transfer to: AutoSphere Ltd, Bank: Zenith Bank, Account: 1234567890' },
];

const INITIAL_SITE_CONTENT: SiteContent = {
    siteName: "AutoSphere",
    hero: {
        title: "Find Your Next Dream Car",
        subtitle: "Explore our curated selection of high-quality new and pre-owned vehicles.",
        image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1725&auto=format&fit=crop",
    },
    newArrivalsCarIds: [],
    bestDealsCarIds: [],
    trendingCarsCarIds: [],
    usedCarsCarIds: [],
    dealOfTheWeekCarId: null,
    dealOfTheWeekExpireDate: null,
    contactInfo: {
        address: "123 Auto Drive, Velocity City, 45678",
        phone: "(555) 123-4567",
        email: "contact@autosphere.com",
        hours: { week: "9:00 AM - 7:00 PM", saturday: "10:00 AM - 6:00 PM", sunday: "Closed" },
    },
    socialHandles: { facebook: "#", twitter: "#", instagram: "#" },
    inventorySettings: {
        sortOptions: ['price-asc', 'price-desc', 'year-desc', 'mileage-asc'],
        conditionFilters: ['New', 'Used'],
    },
    paymentSettings: INITIAL_PAYMENT_METHODS,
    faq: FAQ_DATA,
    testimonials: TESTIMONIALS,
    themeSettings: {
        primaryColor: '#2563EB', // Default Blue
        secondaryColor: '#F3F4F6', // Default Gray-100 (Light mode backgroundish)
        accentColor: '#2563EB', // Default Blue
    }
};

export const SiteContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const contentRef = db.ref('siteContent/config');
        const unsubscribe = contentRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Ensure new fields exist when fetching old data
                const content = data as SiteContent;
                if (!content.themeSettings) {
                    content.themeSettings = INITIAL_SITE_CONTENT.themeSettings;
                }
                if (!content.paymentSettings) {
                    content.paymentSettings = INITIAL_SITE_CONTENT.paymentSettings;
                }
                setSiteContent(content);
            } else {
                // If content doesn't exist, use the local initial data as a fallback.
                console.warn("Site content not found in database. Using local fallback.");
                setSiteContent(INITIAL_SITE_CONTENT);
            }
            setLoading(false);
        });
        return () => contentRef.off('value', unsubscribe);
    }, []);

    const updateSiteContent = async (newContent: Partial<SiteContent>) => {
        const contentRef = db.ref('siteContent/config');
        await contentRef.update(newContent);
    };
    
    return (
        <SiteContentContext.Provider value={{ siteContent, loading, updateSiteContent }}>
            {!loading && children}
        </SiteContentContext.Provider>
    );
};