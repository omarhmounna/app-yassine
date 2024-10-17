import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface ProductVariant {
  id: string;
  name: string;
  color: string;
  size: string;
}

interface Product {
  id: string;
  name: string;
  variants: ProductVariant[];
}

interface OrderData {
  product: string;
  delivered: number;
  returned: number;
  inProgress: number;
  changeLivre: number;
  totalOrders: number;
  rateDelivery: string;
  history: { date: string; value: number }[];
}

interface ProductCounts {
  [key: string]: {
    delivered: number;
    returned: number;
    inProgress: number;
    changeLivre: number;
    totalOrders: number;
  };
}

const generateHistory = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    date: `2023-05-${i + 1}`,
    value: Math.floor(Math.random() * 100)
  }));
};

const TrackingOrdersDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [productCounts, setProductCounts] = useState<ProductCounts>({});
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, countsResponse] = await Promise.all([
          fetch('https://api.anaqamaghribiya.store/products.php'),
          fetch('https://api.anaqamaghribiya.store/productscount.php')
        ]);

        if (!productsResponse.ok || !countsResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const productsData: { id: string; name: string }[] = await productsResponse.json();
        const countsData: { status: string; data: ProductCounts } = await countsResponse.json();

        const groupedProducts: { [key: string]: Product } = {};
        productsData.forEach(item => {
          const parts = item.name.split(' ');
          const productName = parts[0];
          const color = parts[1] || '';
          const size = parts[2] || '';
          
          if (!groupedProducts[productName]) {
            groupedProducts[productName] = {
              id: productName,
              name: productName,
              variants: []
            };
          }
          
          groupedProducts[productName].variants.push({
            id: item.id,
            name: item.name,
            color: color,
            size: size
          });
        });
        
        const processedProducts = Object.values(groupedProducts);
        setProducts(processedProducts);
        setProductCounts(countsData.data);
        
        if (processedProducts.length > 0) {
          const firstProduct = processedProducts[0];
          setSelectedProduct(firstProduct);
          setOrderData(generateOrderData(firstProduct.id, firstProduct.name, countsData.data[firstProduct.id]));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const generateOrderData = (productId: string, productName: string, counts: { delivered: number; returned: number; inProgress: number; changeLivre: number; totalOrders: number }): OrderData => {
    const delivered = counts?.delivered || 0;
    const returned = counts?.returned || 0;
    const inProgress = counts?.inProgress || 0;
    const changeLivre = counts?.changeLivre || 0;
    const totalOrders = counts?.totalOrders || 0;
    
    return {
      product: productName,
      delivered: delivered,
      returned: returned,
      inProgress: inProgress,
      changeLivre: changeLivre,
      totalOrders: totalOrders,
      rateDelivery: totalOrders > 0 ? `${((delivered / totalOrders) * 100).toFixed(2)}%` : '0.00%',
      history: generateHistory()
    };
  };

  const filteredProducts = query === ''
    ? products
    : products.filter((product) =>
        product.name
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(query.toLowerCase().replace(/\s+/g, ''))
      );

  const handleProductChange = (product: Product) => {
    setSelectedProduct(product);
    const counts = productCounts[product.id] || { delivered: 0, returned: 0, inProgress: 0, changeLivre: 0, totalOrders: 0 };
    setOrderData(generateOrderData(product.id, product.name, counts));
    setIsOpen(false);
    setQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleInputClick = () => {
    setIsOpen(true);
  };

  if (isLoading) {
    return <div className="loader"></div>;
  }

  if (!orderData) {
    return <div>No product data available</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="header">
          <h2 className="dashboard-title">Order Tracking</h2>
          <div className="w-48 relative" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={isOpen ? query : (selectedProduct?.name || '')}
                onChange={handleInputChange}
                onClick={handleInputClick}
                placeholder="Select a product"
              />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute inset-y-0 right-0 flex items-center pr-2"
              >
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                  <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            {isOpen && (
              <ul className="absolute z-10 mt-1 w-48 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {filteredProducts.length === 0 ? (
                  <li className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9">
                    No products found
                  </li>
                ) : (
                  filteredProducts.map((product) => (
                    <li
                      key={product.id}
                      className={`${
                        selectedProduct?.id === product.id ? 'bg-blue-100' : ''
                      } text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-blue-50`}
                      onClick={() => handleProductChange(product)}
                    >
                      <div className="flex items-center">
                        <span className="font-normal block truncate">{product.name}</span>
                        {selectedProduct?.id === product.id && (
                          <span className="text-blue-600 absolute inset-y-0 right-0 flex items-center pr-4">
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
        
        <div className="metrics">
          {[
            { label: 'Delivered', value: orderData.delivered, icon: '📦', color: '#4CAF50' },
            { label: 'Returned', value: orderData.returned, icon: '↩️', color: '#F44336' },
            { label: 'In Progress', value: orderData.inProgress, icon: '🚚', color: '#2196F3' },
            { label: 'Total Orders', value: orderData.totalOrders, icon: '📊', color: '#FF9800' },
            { label: 'Delivery Rate', value: orderData.rateDelivery, icon: '📈', color: '#9C27B0' },
            { label: 'Change Livré', value: orderData.changeLivre, icon: '♻️', color: '#00BCD4' },
          ].map((item, index) => (
            <div key={item.label} className="metric-card" style={{'--card-color': item.color} as React.CSSProperties}>
              <div className="metric-icon">{item.icon}</div>
              <div className="metric-details">
                <div className="metric-value">
                  {typeof item.value === 'number' && item.label === 'Change Livré' 
                    ? (item.value > 0 ? '+' : '') + item.value
                    : item.value}
                </div>
                <div className="metric-label">{item.label}</div>
              </div>
              <div className="metric-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={orderData.history}>
                    <Line type="monotone" dataKey="value" stroke={item.color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .dashboard {
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          margin: 0px !important;
        }

        .dashboard-content {
          background: white;
          border-radius: 12px;
          padding: 15px;
          width: 100%;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .dashboard-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .metric-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          cursor: pointer;
          overflow: hidden;
          position: relative;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }

        .metric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--card-color);
        }

        .metric-icon {
          font-size: 18px;
          margin-bottom: 5px;
        }

        .metric-details {
          flex-grow: 1;
        }

        .metric-value {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .metric-label {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        .metric-chart {
          height: 30px;
          margin-top: 5px;
        }

        .loader {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: #333;
          animation: spin 1s ease-in-out infinite;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        @keyframes spin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @media (min-width: 480px) {
          .dashboard-content {
            padding: 20px;
          }

          .metrics {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 768px) {
          .metrics {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .metrics {
            grid-template-columns: repeat(6, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default TrackingOrdersDashboard;