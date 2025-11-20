import React from 'react';
import { Link } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { useCars } from '../hooks/useCars';
import { StarIcon, QuoteIcon, Spinner } from '../components/IconComponents';
import type { Car, Testimonial } from '../types';
import PromoCar from '../components/PromoCar';
import { useSiteContent } from '../hooks/useSiteContent';

const Hero: React.FC = () => {
    const { siteContent, loading } = useSiteContent();
    if (loading || !siteContent) return <div className="h-96 flex items-center justify-center"><Spinner className="h-12 w-12" /></div>;

    return (
        <div className="relative bg-secondary text-foreground py-20 lg:py-32">
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-20" 
                style={{backgroundImage: `url('${siteContent.hero.image}')`}}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
            <div className="container mx-auto px-6 text-center relative z-10">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">{siteContent.hero.title}</h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    {siteContent.hero.subtitle}
                </p>
                <Link 
                    to="/inventory" 
                    className="bg-accent text-accent-foreground font-bold py-3 px-8 rounded-full hover:bg-accent/90 transition-transform duration-300 transform hover:scale-105 text-lg"
                >
                    Browse Inventory
                </Link>
            </div>
        </div>
    );
};

interface CarHighlightSectionProps {
  title: string;
  carIds: string[];
  allCars: Car[];
}

const CarHighlightSection: React.FC<CarHighlightSectionProps> = ({ title, carIds, allCars }) => {
  if (!carIds || carIds.length === 0) return null;
  const cars = carIds.map(id => allCars.find(car => car.id === id)).filter((c): c is Car => !!c);
  if (cars.length === 0) return null;

  return (
     <div className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map(car => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </div>
  )
}

const TestimonialCard: React.FC<{testimonial: Testimonial}> = ({ testimonial }) => (
    <div className="bg-secondary p-8 rounded-lg shadow-lg flex flex-col h-full border border-border">
        <QuoteIcon className="w-10 h-10 text-accent mb-4"/>
        <p className="text-muted-foreground flex-grow mb-6">"{testimonial.quote}"</p>
        <div className="flex items-center mt-auto">
            <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full mr-4 object-cover"/>
            <div>
                <p className="font-bold text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                 <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-500'}`} />
                    ))}
                </div>
            </div>
        </div>
    </div>
);


const Testimonials: React.FC = () => {
    const { siteContent } = useSiteContent();
    if (!siteContent?.testimonials?.length) return null;

    return (
    <div className="py-16 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground">What Our Customers Say</h2>
                <p className="mt-4 text-lg text-muted-foreground">Real stories from satisfied drivers.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {siteContent.testimonials.map((testimonial, index) => (
                    <TestimonialCard key={index} testimonial={testimonial} />
                ))}
            </div>
        </div>
    </div>
)};


const WhyChooseUs: React.FC = () => (
    <div className="py-16 sm:py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground">Why Choose AutoSphere?</h2>
                <p className="mt-4 text-lg text-muted-foreground">The premier destination for luxury and performance vehicles.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6 bg-background rounded-lg border border-border">
                    <h3 className="text-xl font-semibold text-accent">Quality Inspected</h3>
                    <p className="mt-2 text-muted-foreground">Every vehicle undergoes a rigorous multi-point inspection to ensure it meets our highest standards.</p>
                </div>
                 <div className="p-6 bg-background rounded-lg border border-border">
                    <h3 className="text-xl font-semibold text-accent">Transparent Pricing</h3>
                    <p className="mt-2 text-muted-foreground">No hidden fees. We believe in honest, straightforward pricing for a stress-free buying experience.</p>
                </div>
                 <div className="p-6 bg-background rounded-lg border border-border">
                    <h3 className="text-xl font-semibold text-accent">Expert Service</h3>
                    <p className="mt-2 text-muted-foreground">Our knowledgeable team is here to guide you every step of the way, from test drive to financing.</p>
                </div>
            </div>
        </div>
    </div>
);


const Home: React.FC = () => {
  const { cars, loading: carsLoading } = useCars();
  const { siteContent, loading: contentLoading } = useSiteContent();

  const promoCarData = cars.find(car => car.id === siteContent?.dealOfTheWeekCarId);
  
  if (carsLoading || contentLoading || !siteContent) {
      return <div className="min-h-screen flex items-center justify-center"><Spinner className="h-16 w-16" /></div>;
  }

  return (
    <div>
      <Hero />
      <CarHighlightSection title="New Arrivals" carIds={siteContent.newArrivalsCarIds} allCars={cars} />
      <CarHighlightSection title="Best Deals" carIds={siteContent.bestDealsCarIds} allCars={cars} />
      <CarHighlightSection title="Trending Cars" carIds={siteContent.trendingCarsCarIds} allCars={cars} />
      <CarHighlightSection title="Quality Pre-Owned" carIds={siteContent.usedCarsCarIds} allCars={cars} />
      {promoCarData && <PromoCar car={promoCarData} />}
      <Testimonials />
      <WhyChooseUs />
    </div>
  );
};

export default Home;