import React, { useState } from 'react';
import { MapPin, Package, DollarSign, ArrowUpDown } from 'lucide-react';

type CityData = {
  name: string;
  totalOrders: number;
  totalValue: number;
};

const data: CityData[] = [
  { name: 'New York', totalOrders: 1000, totalValue: 183650 },
  { name: 'Los Angeles', totalOrders: 800, totalValue: 146920 },
  { name: 'Chicago', totalOrders: 600, totalValue: 110190 },
  { name: 'Houston', totalOrders: 500, totalValue: 91825 },
  { name: 'Phoenix', totalOrders: 400, totalValue: 73460 },
];

const UltraStylishCompactTable: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a[sortColumn as keyof CityData];
    const bValue = b[sortColumn as keyof CityData];
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className="w-full md:w-1/2 pt-2 pb-2 px-2 rounded-3xl">
      <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.3)] relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
        <div className="text-center py-2 bg-gray-700">
          <h2 className="text-xl font-bold text-gray-200">Top 5 City By Orders Livré</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700 text-gray-200">
              {['name', 'totalOrders', 'totalValue'].map((column) => (
                <th 
                  key={column}
                  className="px-3 py-4 text-left cursor-pointer hover:bg-gray-600 transition-all duration-300"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm font-medium">
                      {column === 'name' && <MapPin size={14} className="mr-1 text-blue-400" />}
                      {column === 'totalOrders' && <Package size={14} className="mr-1 text-green-400" />}
                      {column === 'totalValue' && <DollarSign size={14} className="mr-1 text-purple-400" />}
                      {column === 'name' ? 'City' : column === 'totalOrders' ? 'Orders' : 'Value'}
                    </div>
                    <ArrowUpDown size={14} className={`transition-transform duration-300 ${sortColumn === column ? 'text-yellow-400' : 'text-gray-400'}`} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((city, index) => (
              <tr 
                key={city.name} 
                className="group hover:bg-gray-700/50 transition-all duration-300 ease-in-out"
              >
                <td className="px-3 py-3 border-b border-gray-700">
                  <span className="font-medium text-blue-400 text-sm group-hover:text-blue-400 transition-colors duration-300">{city.name}</span>
                </td>
                <td className="px-3 py-3 border-b border-gray-700">
                  <div className="flex items-center place-content-center md:place-content-start">
                    <div >
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 rounded-full transition-all duration-500 ease-out group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        style={{ width: `${(city.totalOrders / 1000) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-green-400 group-hover:text-green-400 transition-colors duration-300">{city.totalOrders.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-3 py-3 border-b border-gray-700">
                  <div className="flex items-center place-content-center md:place-content-start">
                    <div >
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-pink-500 h-1.5 rounded-full transition-all duration-500 ease-out group-hover:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                        style={{ width: `${(city.totalValue / 183650) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-purple-400 group-hover:text-purple-400 transition-colors duration-300">{city.totalValue.toLocaleString()} Dhs</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UltraStylishCompactTable;