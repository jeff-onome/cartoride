
export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Automatic' | 'Manual';
  engine: string;
  horsepower: number;
  features: string[];
  images: string[];
  description: string;
  condition: 'New' | 'Used';
  tag?: 'Best Deal' | 'New Arrival' | 'Trending';
  verificationStatus: 'Verified' | 'Unverified';
  dealerId: string; // This will be the UID of the dealer user
  listingType: 'Sale' | 'Rent';
  pricePeriod?: 'Day' | 'Week' | 'Month';
  vin?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  location: string;
  avatar: string;
  rating: number;
}

export interface User {
  uid: string;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  role: 'customer' | 'dealer' | 'superadmin';
  status: 'Active' | 'Blocked';
  address: {
    street: string;
    city: string;
    zip: string;
  } | null;
  verificationStatus: 'Unverified' | 'Pending' | 'Verified' | 'Rejected';
  kycDocument: {
    type: 'NIN' | 'DriversLicense' | 'Passport';
    front: string; // Firebase Storage URL
    back?: string; // Firebase Storage URL
  } | null;
  // User-specific data
  favorites?: string[]; // Array of car IDs
  recentlyViewed?: string[];
  compareItems?: string[];
}

export interface TestDrive {
  id: string;
  carId: string;
  userId: string;
  bookingDate: string; // ISO string
  location: string;
  status: 'Approved' | 'Pending' | 'Completed' | 'Cancelled';
}

export interface Purchase {
  id: string;
  carId: string;
  userId: string;
  purchaseDate: string; // ISO string
  pricePaid: number;
  dealership: string;
}

export interface ThemeSettings {
  primaryColor: string; // Hex code
  secondaryColor: string; // Hex code
  accentColor: string; // Hex code
}

export interface SiteContent {
  siteName: string;
  hero: {
    title: string;
    subtitle: string;
    image: string;
  };
  newArrivalsCarIds: string[];
  bestDealsCarIds: string[];
  trendingCarsCarIds: string[];
  usedCarsCarIds: string[];
  dealOfTheWeekCarId: string | null;
  dealOfTheWeekExpireDate: string | null;
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    hours: {
      week: string;
      saturday: string;
      sunday: string;
    };
  };
  socialHandles: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
  inventorySettings: {
    sortOptions: string[];
    conditionFilters: string[];
  };
  faq: FaqItem[];
  testimonials: Testimonial[];
  themeSettings?: ThemeSettings;
}