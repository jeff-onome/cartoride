import React, { useMemo, useState } from 'react';
import { useUserData } from '../../hooks/useUserData';
import { useCars } from '../../hooks/useCars';
import { useUserManagement } from '../../hooks/useUserManagement';
import { CarIcon, UsersIcon, ReceiptIcon, SearchIcon } from '../../components/IconComponents';
import type { User, Car, Purchase } from '../../types';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-secondary p-6 rounded-lg border border-border flex items-center gap-4">
    <div className="bg-accent/10 p-3 rounded-full text-accent">
        {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  </div>
);

type DealerWithStats = User & { salesCount: number; totalValue: number; };
type EnrichedSale = Purchase & { car: Car, dealer: User };

const SalesAnalytics: React.FC = () => {
    const { purchases } = useUserData();
    const { cars } = useCars();
    const { users } = useUserManagement();
    const [searchTerm, setSearchTerm] = useState('');

    const dealers = useMemo(() => users.filter(u => u.role === 'dealer'), [users]);

    const salesData = useMemo(() => {
        const carMap = new Map<string, Car>(cars.map(car => [car.id, car]));
        const dealerMap = new Map<string, DealerWithStats>(dealers.map(dealer => [dealer.uid, { ...dealer, salesCount: 0, totalValue: 0 }]));

        let totalRevenue = 0;
        const recentSales: EnrichedSale[] = [];

        for (const purchase of purchases) {
            const car = carMap.get(purchase.carId);
            if (car && car.dealerId) {
                const dealer = dealerMap.get(car.dealerId);
                if (dealer) {
                    dealer.salesCount += 1;
                    dealer.totalValue += purchase.pricePaid;
                    totalRevenue += purchase.pricePaid;
                    recentSales.push({ ...purchase, car, dealer });
                }
            }
        }
        
        const dealerPerformance: DealerWithStats[] = Array.from(dealerMap.values());
        
        return {
            totalRevenue,
            totalSalesCount: purchases.length,
            topDealersBySales: [...dealerPerformance].sort((a, b) => b.salesCount - a.salesCount),
            topDealersByValue: [...dealerPerformance].sort((a, b) => b.totalValue - a.totalValue),
            recentSales: recentSales.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
        };
    }, [purchases, cars, dealers]);

    const filteredRecentSales = useMemo(() => 
        salesData.recentSales.filter(sale => 
            `${sale.car.make} ${sale.car.model} ${sale.dealer.fname} ${sale.dealer.lname}`.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5), 
    [salesData.recentSales, searchTerm]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-foreground mb-6">Sales Analytics</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard 
                    title="Total Revenue" 
                    value={`₦${(salesData.totalRevenue / 1_000_000).toFixed(2)}M`} 
                    icon={<ReceiptIcon className="w-6 h-6" />}
                />
                 <StatCard 
                    title="Total Cars Sold" 
                    value={salesData.totalSalesCount} 
                    icon={<CarIcon className="w-6 h-6" />}
                />
                 <StatCard 
                    title="Active Dealers" 
                    value={dealers.length} 
                    icon={<UsersIcon className="w-6 h-6" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-secondary p-6 rounded-lg border border-border">
                    <h2 className="text-xl font-bold text-foreground mb-4">Top Selling Dealers (by Units)</h2>
                    <ul className="space-y-3">
                        {salesData.topDealersBySales.slice(0, 5).map(dealer => (
                            <li key={dealer.uid} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold text-foreground">{dealer.fname} {dealer.lname}</p>
                                    <p className="text-xs text-muted-foreground">{dealer.email}</p>
                                </div>
                                <p className="font-bold text-foreground">{dealer.salesCount} units</p>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="bg-secondary p-6 rounded-lg border border-border">
                    <h2 className="text-xl font-bold text-foreground mb-4">Top Selling Dealers (by Value)</h2>
                    <ul className="space-y-3">
                        {salesData.topDealersByValue.slice(0, 5).map(dealer => (
                            <li key={dealer.uid} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold text-foreground">{dealer.fname} {dealer.lname}</p>
                                    <p className="text-xs text-muted-foreground">{dealer.email}</p>
                                </div>
                                <p className="font-bold text-foreground">₦{(dealer.totalValue / 1_000_000).toFixed(1)}M</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <h2 className="text-xl font-bold text-foreground">Recent Transactions</h2>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search transactions..."
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
                                <th className="p-4 font-semibold">Dealer</th>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Amount</th>
                            </tr>
                            </thead>
                            <tbody>
                                {filteredRecentSales.length > 0 ? filteredRecentSales.map(sale => (
                                    <tr key={sale.id} className="border-t border-border">
                                        <td className="p-4 font-bold text-foreground">{sale.car.make} {sale.car.model}</td>
                                        <td className="p-4 text-muted-foreground">{sale.dealer.fname} {sale.dealer.lname}</td>
                                        <td className="p-4 text-muted-foreground">{new Date(sale.purchaseDate).toLocaleDateString()}</td>
                                        <td className="p-4 font-semibold text-foreground">₦{sale.pricePaid.toLocaleString()}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center p-8 text-muted-foreground">
                                            No recent transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesAnalytics;