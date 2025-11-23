
import { useContext } from 'react';
import { SiteContentContext } from '../context/SiteContentContext';
import { SiteContent } from '../types';

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (context === undefined) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  if (context.loading || !context.siteContent) {
    // This provides a fallback for the initial render,
    // though components should ideally handle the loading state.
    return {
        siteContent: {
            siteName: "Loading...",
            hero: { title: "", subtitle: "", image: "" },
            contactInfo: { address: "", phone: "", email: "", hours: { week: "", saturday: "", sunday: "" }},
            socialHandles: { facebook: "#", twitter: "#", instagram: "#" },
            newArrivalsCarIds: [],
            bestDealsCarIds: [],
            trendingCarsCarIds: [],
            usedCarsCarIds: [],
            dealOfTheWeekCarId: null,
            dealOfTheWeekExpireDate: null,
            inventorySettings: {
                sortOptions: [],
                conditionFilters: [],
            },
            paymentSettings: [],
            faq: [],
            testimonials: [],
        } as SiteContent,
        loading: true,
        updateSiteContent: context.updateSiteContent
    };
  }
  return context;
};
