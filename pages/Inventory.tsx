
import React, { useState, useMemo, useEffect } from 'react';
import CarCard from '../components/CarCard';
import { useCars } from '../hooks/useCars';
import { useSiteContent } from '../hooks/useSiteContent';
import { Spinner } from '../components/IconComponents';

const sortLabels: Record<string, string> = {
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'year-desc': 'Year: Newest First',
  'mileage-asc': 'Mileage: Lowest First',
};

const Inventory: React.FC = () => {
  const { cars, loading: carsLoading } = useCars();
  const { siteContent, loading: contentLoading } = useSiteContent();
  const { sortOptions, conditionFilters } = siteContent?.inventorySettings || { sortOptions: [], conditionFilters: [] };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMake, setFilterMake] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [filterListingType, setFilterListingType] = useState('all'); // New state for listing type
  const [filterMileage, setFilterMileage] = useState('all');
  const [sortOrder, setSortOrder] = useState('price-asc');

  const makes = useMemo(() => ['all', ...Array.from(new Set(cars.map(car => car.make)))], [cars]);
  const conditions = useMemo(() => ['all', ...conditionFilters], [conditionFilters]);

  useEffect(() => {
    if (sortOptions.length > 0 && !sortOptions.includes(sortOrder)) {
      setSortOrder(sortOptions[0]);
    }
  }, [sortOptions, sortOrder]);

  useEffect(() => {
    if (!conditions.includes(filterCondition)) {
      setFilterCondition('all');
    }
  }, [conditions, filterCondition]);

  const filteredAndSortedCars = useMemo(() => {
    let filteredCars = cars.filter(car => 
        (car.make.toLowerCase().includes(searchTerm.toLowerCase()) || 
         car.model.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterMake === 'all' || car.make === filterMake) &&
        (filterCondition === 'all' || car.condition === filterCondition) &&
        (filterListingType === 'all' || (car.listingType || 'Sale') === filterListingType) &&
        (filterMileage === 'all' || car.mileage <= parseInt(filterMileage))
    );

    switch (sortOrder) {
      case 'price-asc':
        filteredCars.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filteredCars.sort((a, b) => b.price - a.price);
        break;
      case 'year-desc':
        filteredCars.sort((a, b) => b.year - a.year);
        break;
      case 'mileage-asc':
        filteredCars.sort((a, b) => a.mileage - b.mileage);
        break;
    }
    
    return filteredCars;

  }, [cars, searchTerm, filterMake, filterCondition, filterListingType, filterMileage, sortOrder]);

  const loading = carsLoading || contentLoading;

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground">Our Inventory</h1>
          <p className="mt-2 text-lg text-muted-foreground">Find the perfect vehicle to buy or rent.</p>
        </div>

        <div className="bg-secondary p-4 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-center">
          <input
            type="text"
            placeholder="Search by make or model..."
            className="w-full bg-background text-foreground border border-input rounded-md p-2 focus:ring-ring focus:border-ring"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="w-full bg-background text-foreground border border-input rounded-md p-2 focus:ring-ring focus:border-ring"
            onChange={(e) => setFilterListingType(e.target.value)}
            value={filterListingType}
          >
            <option value="all">All Types</option>
            <option value="Sale">For Sale</option>
            <option value="Rent">For Rent</option>
          </select>
          <select 
            className="w-full bg-background text-foreground border border-input rounded-md p-2 focus:ring-ring focus:border-ring"
            onChange={(e) => setFilterMake(e.target.value)}
            value={filterMake}
          >
            {makes.map(make => (
              <option key={make} value={make}>{make === 'all' ? 'All Makes' : make}</option>
            ))}
          </select>
          <select 
            className="w-full bg-background text-foreground border border-input rounded-md p-2 focus:ring-ring focus:border-ring"
            onChange={(e) => setFilterCondition(e.target.value)}
            value={filterCondition}
          >
            {conditions.map(condition => (
              <option key={condition} value={condition}>{condition === 'all' ? 'All Conditions' : condition}</option>
            ))}
          </select>
          <select 
            className="w-full bg-background text-foreground border border-input rounded-md p-2 focus:ring-ring focus:border-ring"
            onChange={(e) => setFilterMileage(e.target.value)}
            value={filterMileage}
          >
            <option value="all">Any Mileage</option>
            <option value="10000">Under 10,000 mi</option>
            <option value="30000">Under 30,000 mi</option>
            <option value="50000">Under 50,000 mi</option>
            <option value="80000">Under 80,000 mi</option>
            <option value="100000">Under 100,000 mi</option>
            <option value="150000">Under 150,000 mi</option>
            <option value="200000">Under 200,000 mi</option>
          </select>
          {sortOptions.length > 0 && (
            <select 
              className="w-full bg-background text-foreground border border-input rounded-md p-2 focus:ring-ring focus:border-ring"
              onChange={(e) => setSortOrder(e.target.value)}
              value={sortOrder}
            >
              {sortOptions.map(option => (
                <option key={option} value={option}>{sortLabels[option]}</option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
            <div className="flex justify-center items-center py-16">
                <Spinner className="h-12 w-12" />
            </div>
        ) : filteredAndSortedCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedCars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl text-foreground">No cars found</h2>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria, or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;