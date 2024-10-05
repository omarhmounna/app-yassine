import React, { useState, useContext, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import TrackingOrdersDashboard from '@/components/TrackingOrders';
import EnhancedCityDataCards from '@/components/Top10City';
import { GlobalContext } from '@/contexts/GlobalContext';
import axios from 'axios';
import { ArrowUp, ArrowDown, TrendingDown, TrendingUp } from 'lucide-react';




const QuickStatCard = ({ title, value, gradientFrom, gradientTo }) => {
  const formatValue = (title, value) => {
    if (title === "Taux de Livraison %") {
      return `${value}%`;
    } else {
      return `${parseFloat(value).toLocaleString()} Dhs`;
    }
  };

  return (
    <div 
      className="rounded-lg p-4 shadow-sm border-2 transition-all duration-300 transform hover:scale-105"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      <h3 className="text-sm font-medium text-white text-center">{title}</h3>
      <div className="flex items-baseline mt-1 justify-center">
        <p className="text-xl font-semibold text-center text-white">{formatValue(title, value)}</p>
      </div>
    </div>
  );
}

const QuickStats = ({ confirmedCost, deliveredCost, deliveryRate, netProfit, facturesPayees, versementsLivCasa, dailyNetProfit }) => {
  const [moneyComingCasa, setMoneyComingCasa] = useState('0');

  useEffect(() => {
    axios.get('https://yassine.anaqamaghribiya.com/Ispayed.php')
      .then(response => {
        setMoneyComingCasa(response.data.total_price);
      })
      .catch(error => {
        console.error('Error fetching Money Coming Casa:', error);
        setMoneyComingCasa('Error');
      });
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 mt-4">
      <QuickStatCard title="Confirmed Cost / DH" value={confirmedCost} gradientFrom="#FFA500" gradientTo="#FFC300" />
      <QuickStatCard title="Delivered Cost / DH" value={deliveredCost} gradientFrom="#4B79A1" gradientTo="#283E51" />
      <QuickStatCard title="Taux de Livraison %" value={deliveryRate} gradientFrom="#56ab2f" gradientTo="#a8e063" />
      <QuickStatCard title="💲 Net Profit 💲" value={netProfit} gradientFrom="#FF416C" gradientTo="#FF4B2B" />
      <QuickStatCard title="Factures Payées" value={facturesPayees} gradientFrom="#8E2DE2" gradientTo="#4A00E0" />
      <QuickStatCard title="Versements LivCasa" value={versementsLivCasa} gradientFrom="#3A1C71" gradientTo="#D76D77" />
      <QuickStatCard title="Money Coming Casa" value={moneyComingCasa} gradientFrom="#11998e" gradientTo="#38ef7d" />
      <QuickStatCard title="💲Daily Net Profit💲" value={dailyNetProfit} gradientFrom="#FF9966" gradientTo="#FF5E62" />
    </div>
  );
};


const StyledTable = ({ title, data, valueColor }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 border-2 w-full">
    <div className="bg-yellow-300 p-2">
      <h2 className="text-center font-bold text-lg">{title}</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
              <td className="p-2 font-semibold">{item.period}</td>
              <td className={`p-2 font-bold ${valueColor}`}>{item.amount}DH</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MoneyManagementChart = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState<number[]>([]);
  const [filteredData, setFilteredData] = useState<{ date: Date; argent_restant: number; month: string }[]>([]);

  useEffect(() => {
    const uniqueYears: number[] = Array.from(new Set<number>(data.map(item => new Date(item.date).getFullYear())));
    setYears(uniqueYears.sort((a, b) => b - a));
    if (uniqueYears.length > 0) {
      setSelectedYear(uniqueYears[0]);
    }
  }, [data]);

  useEffect(() => {
    const yearData = data.filter(item => new Date(item.date).getFullYear() === selectedYear);
    const aggregatedData = aggregateDataByMonth(yearData);
    setFilteredData(aggregatedData);
  }, [selectedYear, data]);

  const aggregateDataByMonth = (yearData) => {
    const monthlyData: { [key: string]: { date: Date; argent_restant: number; month: string } } = yearData.reduce((acc, item) => {
      const date = new Date(item.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = { 
          date: date, 
          argent_restant: 0, 
          month: date.toLocaleString('default', { month: 'short' })
        };
      }
      
      acc[monthYear].argent_restant = parseFloat(item.argent_restant);
      
      return acc;
    }, {});
  
    return Object.values(monthlyData).sort((a, b) => a.date.getTime() - b.date.getTime());
  };
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust this breakpoint as needed
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold" style={{ color: '#7257b3' }}>💸 Money Management 💸</h2>
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="p-2 border rounded"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              height={40}
            />
            <YAxis 
              width={isMobile? 20 : 80}
              tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => new Intl.NumberFormat('en-US').format(parseFloat(value as string)).toString() + ' Dhs'}
              labelFormatter={(label) => `${label} ${selectedYear}`}
            />
            <Line 
              type="monotone" 
              dataKey="argent_restant" 
              stroke="#8884d8" 
              strokeWidth={2} 
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};



const packageStatuses = [
  'Processing', '✅ Livré', 'In Site', 'Pas de réponse', 'Confirmed',
  '♻ Change Livré', '🕐 Reporté', 'Demande de Change', 'Hors Zone',
  'Rembourssement', 'Expedié', 'Injoignable', 'Casa Sheets',
  'Ramassé', '⛔ Retouré - Annulé', '⛔ Retouré - Refusé', 'Confirmed Et Reporté One',
  'Mise en distribution', 'En Att Change address', 'Pas de réponse+Sms'
];

const revenueStatuses = [
  'En Att Change address', '🕐 Reporté', 'Expedié', 'Pas de réponse', 'Injoignable',
  'Ramassé', 'Casa Sheets', '✅ Livré', '♻ Change Livré', '⛔ Retouré - Refusé',
  '⛔ Retouré - Annulé', 'Mise en distribution', 'Rembourssement', 'Hors Zone', 'Demande de Change'
];

const SmallCard = ({ title, amount, gradientFrom, gradientTo, trend = 'up' }) => {
  return (
    <div 
      className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      <div className="p-3 text-white text-center">
        <div className="flex items-center justify-center mb-1">
          <p className="text-xs font-medium opacity-90 truncate pr-2">
            {title}
          </p>
        </div>
        <p className="text-lg font-bold truncate">
          {parseFloat(amount).toLocaleString()} Dhs
        </p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-20" />
    </div>
  );
};

const MiniCard = ({ status, count }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-gradient-to-r from-[#ff9900] to-[#ffcc66] border-none text-yellow-900';
case '✅ Livré': return 'bg-gradient-to-r from-[#00b11f] to-[#66d17f] border-none text-green-900';
case 'In Site': return 'bg-gradient-to-r from-[#b7e1cd] to-[#e6f7f1] border-none text-blue-900';
case 'Pas de réponse': return 'bg-gradient-to-r from-[#6aa84f] to-[#a8d3a0] border-none text-green-900';
case 'Confirmed': return 'bg-gradient-to-r from-[#00b11f] to-[#66ff99] border-none text-green-900';
case 'Mise en distribution': return 'bg-gradient-to-r from-[#25a0d7] to-[#69c5f0] border-none text-blue-900';
case '🕐 Reporté': return 'bg-gradient-to-r from-[#00ffff] to-[#66ffff] border-none text-cyan-900';
case 'Pas de réponse+Sms': return 'bg-gradient-to-r from-[#e69138] to-[#ffb347] border-none text-pink-800';
case 'Hors Zone': return 'bg-gradient-to-r from-[#af6660] to-[#d99a96] border-none text-gray-900';
case 'En Att Change address': return 'bg-gradient-to-r from-[#c3ad00] to-[#dfd866] border-none text-teal-900';
case 'Expedié': return 'bg-gradient-to-r from-[#0000ff] to-[#6666ff] border-none text-blue-900';
case 'Injoignable': return 'bg-gradient-to-r from-[#ff00ff] to-[#ff99ff] border-none text-rose-900';
case 'Casa Sheets': return 'bg-gradient-to-r from-[#b4a7d6] to-[#e2d9f3] border-none text-cyan-900';
case 'Ramassé': return 'bg-gradient-to-r from-[#b7b7b7] to-[#e0e0e0] border-none text-gray-900';
case 'Confirmed Et Reporté One': return 'bg-gradient-to-r from-[#cbdf51] to-[#e8f27f] border-none text-violet-900';
case '⛔ Retouré - Refusé': return 'bg-gradient-to-r from-[#ff0000] to-[#ff6666] border-none text-red-900';
case '⛔ Retouré - Annulé': return 'bg-gradient-to-r from-[#ff0000] to-[#ff7f7f] border-none text-red-900';
case '♻ Change Livré': return 'bg-gradient-to-r from-[#00b11f] to-[#33cc33] border-none text-green-900';
case 'Rembourssement': return 'bg-gradient-to-r from-[#e484e0] to-[#f5b8f2] border-none text-pink-900';
case 'Demande de Change': return 'bg-gradient-to-r from-[#45818e] to-[#89c2d4] border-none text-blue-900';

      default: return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };
  const isLargeCard = ['Confirmed Et Reporté One', 'Mise en distribution', 'En Att Change address', 'Pas de réponse+Sms'].includes(status);

  const colorClass = getStatusColor(status);

  return (
    <div className={`flex items-center justify-between px-1.5 py-2 rounded border ${colorClass} text-xs ${isLargeCard ? 'col-span-2' : ''}`}>
      <span className="font-medium truncate max-w-[70%]" title={status}>{status}</span>
      <span className="font-bold">{count}</span>
    </div>
  );
};

const deliveryData = [
  { month: 'Aug', Livré: 2, 'En cours': 0, Retourné: 0 },
  { month: 'Sep', Livré: 5, 'En cours': 0, Retourné: 0 },
  { month: 'Oct', Livré: 145, 'En cours': 4, Retourné: 36 },
  { month: 'Nov', Livré: 250, 'En cours': 5, Retourné: 116 },
  { month: 'Dec', Livré: 80, 'En cours': 0, Retourné: 45 },
  { month: 'Jan', Livré: 2, 'En cours': 0, Retourné: 70 },
  { month: 'Feb', Livré: 132, 'En cours': 3, Retourné: 89 },
  { month: 'Mar', Livré: 168, 'En cours': 9, Retourné: 74 },
  { month: 'Apr', Livré: 168, 'En cours': 9, Retourné: 72 },
  { month: 'May', Livré: 246, 'En cours': 3, Retourné: 131 },
  { month: 'Jun', Livré: 80, 'En cours': 0, Retourné: 41 },
  { month: 'Jul', Livré: 135, 'En cours': 3, Retourné: 62 },
].reverse();

const DeliveryStatisticsChart = () => {
  const [chartData, setChartData] = useState<{ month: string; year: number; Livré: number; 'En cours': number; Retourné: number; }[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    axios.get('https://yassine.anaqamaghribiya.com/Statistiquescolis.php')
      .then(response => {
        const data = response.data;
        
        // Extract unique years from the data
        const uniqueYears: number[] = Array.from(new Set(data.map((item: { month: string }) => new Date(item.month).getFullYear())));
        setYears(uniqueYears.sort((a: number, b: number) => b - a));

        // Set the most recent year as default
        if (uniqueYears.length > 0) {
          setSelectedYear(uniqueYears[0] as number);
        }

        // Transform all data
        const transformedData = data.map((item: { month: string; delivered_count: string; en_cours_count: string; returned_count: string; }) => ({
          month: new Date(item.month).toLocaleString('default', { month: 'short' }),
          year: new Date(item.month).getFullYear(),
          Livré: parseInt(item.delivered_count),
          'En cours': parseInt(item.en_cours_count),
          Retourné: parseInt(item.returned_count)
        }));

        setChartData(transformedData);
      })
      .catch(error => console.error('Error fetching statistics:', error));
  }, []);

  const filteredData = chartData
    .filter(item => item.year === selectedYear)
    .sort((a, b) => new Date(a.year, new Date(`${a.month} 1`).getMonth()).getTime() - new Date(b.year, new Date(`${b.month} 1`).getMonth()).getTime());

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return (
    <div className="bg-white border-2 rounded-xl p-4 md:p-6 shadow-sm w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold" style={{ color: '#7257b3' }}>Statistics Last 12 Months</h2>
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="p-2 border rounded"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barSize={6}
            barGap={1}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e0e0e0" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666', fontSize: 12 }}
            />
            <YAxis 
              width={isMobile ? 20 : 80}
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666', fontSize: 12 }}
              tickCount={7}
            />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              formatter={(value, name, props) => [`${value}`, name]}
              labelFormatter={(label) => `${label} ${selectedYear}`}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="Livré" fill="#abd47c" />
            <Bar dataKey="En cours" fill="#ffc470" />
            <Bar dataKey="Retourné" fill="#ee3c26" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const calculateTotalRetraitForAchatDeProduits = (moneyManagement) => {
  return moneyManagement
    .filter(item => item.noter === 'Achat de Produits')
    .reduce((total, item) => total + parseFloat(item.retrait), 0);
};

const calculateTotalRetraitForAds = (moneyManagement) => {
  const adCategories = [
    'Facebook Ads',
    'TikTok Ads',
    'Youtube Ads',
    'Google Ads',
    'Solde Payoneer'
  ];

  return moneyManagement
    .filter(item => adCategories.includes(item.noter))
    .reduce((total, item) => total + parseFloat(item.retrait), 0);
};

const calculateTotalRetraitForPhoneRecharge = (moneyManagement) => {
  return moneyManagement
    .filter(item => item.noter === 'Abonnement Téléphone')
    .reduce((total, item) => total + parseFloat(item.retrait), 0);
};

const calculateTotalRetraitForSiteFees = (moneyManagement) => {
  const siteFeeCategories = [
    'Frais de Boutique',
    'Domane Name'
  ];

  return moneyManagement
    .filter(item => siteFeeCategories.includes(item.noter))
    .reduce((total, item) => total + parseFloat(item.retrait), 0);
};

const calculateTotalRetraitForSalary = (moneyManagement) => {
  return moneyManagement
    .filter(item => item.noter === 'Salaire Omar')
    .reduce((total, item) => total + parseFloat(item.retrait), 0);
};

const calculateTotalRetraitForOtherExpenses = (moneyManagement) => {
  const otherExpenseCategories = [
    'Cash Back',
    'Other',
    'Frais de Bank'
  ];

  return moneyManagement
    .filter(item => otherExpenseCategories.includes(item.noter))
    .reduce((total, item) => total + parseFloat(item.retrait), 0);
};

const calculateTotalDepotForInvestment = (moneyManagement) => {
  return moneyManagement
    .filter(item => item.noter === 'New Investment')
    .reduce((total, item) => total + parseFloat(item.depot), 0);
};

const calculateTotalDepotForFacturesPayees = (moneyManagement) => {
  const factureCategories = [
    'Ozon Express',
    'Onessta Express'
  ];

  return moneyManagement
    .filter(item => factureCategories.includes(item.noter))
    .reduce((total, item) => total + parseFloat(item.depot), 0);
};

const calculateTotalDepotForVersementsLivCasa = (moneyManagement) => {
  return moneyManagement
    .filter(item => item.noter === 'Versement Livreur Casablanca')
    .reduce((total, item) => total + parseFloat(item.depot), 0);
};

const calculateConfirmedCost = (orders, adsSpending) => {
  const statuses = [
    'Mise en distribution', 'Expedié', '✅ Livré', '🕐 Reporté', 'Injoignable',
    'In Site', 'Casa Sheets', 'Pas de réponse', 'Hors Zone', 'Ramassé',
    'Confirmed', 'En Att Change address', '⛔ Retouré - Refusé', '⛔ Retouré - Annulé',
    'Demande de Change', 'Rembourssement', '♻ Change Livré', 'Confirmed Et Reporté One'
  ];

  const totalCases = orders.filter(order => statuses.includes(order.status)).length;
  if (totalCases === 0) return '0.00';

  return (adsSpending / totalCases).toFixed(2);
};

const calculateDeliveredCost = (orders, adsSpending) => {
  const totalDelivered = orders.filter(order => order.status === '✅ Livré').length;
  if (totalDelivered === 0) return '0.00';

  return (adsSpending / totalDelivered).toFixed(2);
};

const calculateDeliveryRate = (orders) => {
  const relevantStatuses = [
    'En Att Change address', '🕐 Reporté', 'Expedié', 'Pas de réponse', 'Injoignable',
    'Ramassé', 'Casa Sheets', '✅ Livré', '⛔ Retouré - Refusé', '⛔ Retouré - Annulé',
    'Mise en distribution', 'Rembourssement', 'Hors Zone', 'Demande de Change'
  ];

  const totalRelevantOrders = orders.filter(order => relevantStatuses.includes(order.status)).length;
  const totalDelivered = orders.filter(order => order.status === '✅ Livré').length;

  if (totalRelevantOrders === 0) return '0.00';

  return ((totalDelivered / totalRelevantOrders) * 100).toFixed(2);
};

const calculateNetProfit = (facturesPayees, versementsLivCasa, achatProduits, adsSpending, phoneRecharge, siteFees, otherExpenses) => {
  return (
    facturesPayees +
    versementsLivCasa -
    achatProduits -
    adsSpending -
    phoneRecharge -
    siteFees -
    otherExpenses
  ).toFixed(2);
};

const calculateDaysSinceFirstEntry = (moneyManagement) => {
  if (moneyManagement.length === 0) return 0; // إرجاع 0 بدلاً من 1 لأننا نحسب الأيام بتدقيق
  
  const firstEntryDate = new Date(Math.min(...moneyManagement.map(entry => new Date(entry.date))));
  const currentDate = new Date();
  const diffTime = Number(currentDate) - Number(firstEntryDate); // الفرق بالميلي ثانية
  const daysDifference = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // تحويل الفرق إلى أيام صحيحة

  return daysDifference; // إرجاع الفرق كعدد أيام كامل
};



const calculateDailyNetProfit = (netProfit, daysSinceFirstEntry) => {
  return (netProfit / daysSinceFirstEntry).toFixed(2);
};

const calculateDailyAdSpending = (totalAdsSpending, daysSinceFirstEntry) => {
  return (totalAdsSpending / daysSinceFirstEntry).toFixed(2);
};

const Dashboard = ({ setIsDashboard, setIsMenu }) => {
  const { Orders, MoneyManagement } = useContext(GlobalContext);


const calculateChiffreDaffaire = () => {
  if (!Orders) {
    return 0;
  }
  // تحويل التاريخ 2023-10-04 إلى طابع زمني Unix (بالثواني)
  const startTimestamp = 1696464000; // يمثل 2023-10-04 00:00:00 UTC
  
  const revenueOrders = Orders.filter(order => {
    // نفترض أن order.date هو طابع زمني Unix بالثواني
    return revenueStatuses.includes(order.status) && parseInt(order.orderDate) >= startTimestamp;
  });
  const totalRevenue = revenueOrders.reduce((acc, order) => acc + parseFloat(order.price), 0);
  return totalRevenue;
};


  const totalAchatDeProduits = calculateTotalRetraitForAchatDeProduits(MoneyManagement);
  const totalAdsSpending = calculateTotalRetraitForAds(MoneyManagement);
  const totalPhoneRecharge = calculateTotalRetraitForPhoneRecharge(MoneyManagement);
  const totalSiteFees = calculateTotalRetraitForSiteFees(MoneyManagement);
  const totalSalary = calculateTotalRetraitForSalary(MoneyManagement);
  const totalOtherExpenses = calculateTotalRetraitForOtherExpenses(MoneyManagement);
  const totalInvestment = calculateTotalDepotForInvestment(MoneyManagement);
  const totalFacturesPayees = calculateTotalDepotForFacturesPayees(MoneyManagement);
  const totalVersementsLivCasa = calculateTotalDepotForVersementsLivCasa(MoneyManagement);
  const confirmedCost = calculateConfirmedCost(Orders, totalAdsSpending);
  const deliveredCost = calculateDeliveredCost(Orders, totalAdsSpending);
  const deliveryRate = calculateDeliveryRate(Orders);
  const netProfit = calculateNetProfit(
    totalFacturesPayees,
    totalVersementsLivCasa,
    totalAchatDeProduits,
    totalAdsSpending,
    totalPhoneRecharge,
    totalSiteFees,
    totalOtherExpenses
  );

  const daysSinceFirstEntry = calculateDaysSinceFirstEntry(MoneyManagement);
  const dailyNetProfit = calculateDailyNetProfit(netProfit, daysSinceFirstEntry);
  const dailyAdSpending = calculateDailyAdSpending(totalAdsSpending, daysSinceFirstEntry);

  function formatNumber(num) {
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const netProfitStats = [
  { period: 'Daily', amount: formatNumber(dailyNetProfit) },
  { period: 'Weekly', amount: formatNumber(Number(dailyNetProfit) * 7) },
  { period: 'Monthly', amount: formatNumber(Number(dailyNetProfit) * 30) },
  { period: 'Annually', amount: formatNumber(Number(dailyNetProfit) * 365) },
];

const advertisingSpending = [
  { period: 'Daily', amount: formatNumber(dailyAdSpending) },
  { period: 'Weekly', amount: formatNumber(Number(dailyAdSpending) * 7) },
  { period: 'Monthly', amount: formatNumber(Number(dailyAdSpending) * 30) },
  { period: 'Annually', amount: formatNumber(Number(dailyAdSpending) * 365) },
];

  const [dailyData ,setDailyData]=useState([]);
  useEffect(() => {
    axios.get('https://yassine.anaqamaghribiya.com/moneyManagementChart.php')
        .then(response => {
          console.log('Noter options:', response.data);
          setDailyData(response.data);
        })
        .catch(error => console.error('Error fetching noter options:', error));
  }, []);

  return (
    <div className="bg-gray-100 h-full overflow-y-auto">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-green-500 text-white p-2 shadow-md">
        <button 
          className="p-1 rounded hover:bg-blue-600 transition duration-300"
          onClick={() => setIsMenu(true)}
        >
          <span className="text-xl">☰</span>
        </button>
        <span className="text-base font-semibold">📈 Statistiques Général 📈</span>
        <div className="w-4 h-4"></div>
      </div>
      
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-2 p-2">
        <SmallCard title="💰 Chiffre d'affaire 💰" amount={calculateChiffreDaffaire().toFixed(2)} gradientFrom="#02aab0" gradientTo="#00cdac" />
        <SmallCard title="🛒 Achat de Produits 🛒" amount={totalAchatDeProduits.toFixed(2)} gradientFrom="#14B8A6" gradientTo="#0F766E" />
        <SmallCard title="📢 Les Publicités 📢" amount={totalAdsSpending.toFixed(2)} gradientFrom="#ff6a00" gradientTo="#ee0979" />
        <SmallCard title="🧐 Recharge Téléphone 🧐" amount={totalPhoneRecharge.toFixed(2)} gradientFrom="#f46b45" gradientTo="#eea849" />
        <SmallCard title="🌐 Frais de Site 🌐" amount={totalSiteFees.toFixed(2)} gradientFrom="#667eea" gradientTo="#764ba2" />
        <SmallCard title="💸 Salaire 💸" amount={totalSalary.toFixed(2)} gradientFrom="#ff6a00" gradientTo="#ee0979" />
        <SmallCard title="💸 Autres Dépenses 💸" amount={totalOtherExpenses.toFixed(2)} gradientFrom="#f46b45" gradientTo="#eea849" />
        <SmallCard title="🏦 Investment 🏦" amount={totalInvestment.toFixed(2)} gradientFrom="#667eea" gradientTo="#764ba2" />
      </div>
      
      <div className="rounded-xl p-2 shadow-sm border-2 px-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-2">
          {packageStatuses.map((status, index) => (
            <MiniCard key={index} status={status} count={Orders?.filter(order => order.status === status).length} />
          ))}
        </div>
      </div>

      <DeliveryStatisticsChart />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            <StyledTable 
              title="💲 Net Profit Statistics 💲" 
              data={netProfitStats} 
              valueColor="text-green-600"
            />
            <StyledTable 
              title="📢 Advertising Spending 📢" 
              data={advertisingSpending} 
              valueColor="text-red-600"
            />
          </div>
          <QuickStats 
            confirmedCost={confirmedCost}
            deliveredCost={deliveredCost}
            deliveryRate={deliveryRate}
            netProfit={netProfit}
            facturesPayees={totalFacturesPayees.toFixed(2)}
            versementsLivCasa={totalVersementsLivCasa.toFixed(2)}
            dailyNetProfit={dailyNetProfit}
          />
        </div>
        <MoneyManagementChart data={dailyData} />
      </div>
      <TrackingOrdersDashboard />
      
    </div>
  );
};

export default Dashboard;