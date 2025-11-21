
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { useCars } from '../../hooks/useCars';
import { SearchIcon } from '../../components/IconComponents';

const SalesHistory: React.FC = () => {
  const { user } = useAuth();
  const { purchases } = useUserData();
  const { cars } = useCars();
  const [searchTerm, setSearchTerm] = useState('');

  const dealerCarIds = useMemo(() => 
    cars.filter(car => car.dealerId === user?.uid).map(car => car.id), 
    [cars, user]
  );

  const sales = useMemo(() => {
    const carMap = new Map(cars.map(car => [car.id, car]));
    return purchases
      .filter(purchase => dealerCarIds.includes(purchase.carId))
      .map(purchase => ({
        ...purchase,
        car: carMap.get(purchase.carId)
      }))
      .filter(sale => sale.car !== undefined)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }, [purchases, dealerCarIds, cars]);
  
  const filteredSales = useMemo(() => 
    sales.filter(sale => 
      sale.car && `${sale.car.make} ${sale.car.model}`.toLowerCase().includes(searchTerm.toLowerCase())
    ), [sales, searchTerm]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-foreground">Sales History</h1>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
                type="text"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-background border border-input rounded-md pl-10 pr-4 py-2 focus:ring-ring focus:border-ring text-foreground"
            />
        </div>
      </div>

      <div className="bg-secondary rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background">
              <tr>
                <th className="p-4 font-semibold">Vehicle</th>
                <th className="p-4 font-semibold">Purchase Date</th>
                <th className="p-4 font-semibold">Price Paid</th>
                <th className="p-4 font-semibold">Payment Method</th>
                <th className="p-4 font-semibold">Dealership Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length > 0 ? (
                filteredSales.map(sale => {
                  if (!sale.car) return null;
                  return (
                    <tr key={sale.id} className="border-t border-border">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <img src={sale.car.images[0]} alt={sale.car.make} className="w-20 h-14 object-cover rounded-md" />
                          <div>
                            <p className="font-bold text-foreground">{sale.car.make} {sale.car.model}</p>
                            <p className="text-xs text-muted-foreground">{sale.car.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{new Date(sale.purchaseDate).toLocaleDateString()}</td>
                      <td className="p-4 font-semibold text-foreground">₦{sale.pricePaid.toLocaleString()}</td>
                      <td className="p-4 text-muted-foreground">{sale.paymentMethod || 'N/A'}</td>
                      <td className="p-4 text-muted-foreground">{sale.dealership}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-muted-foreground">
                    {searchTerm ? `No sales found for "${searchTerm}".` : "You have no recorded sales yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;