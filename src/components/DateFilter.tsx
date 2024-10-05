import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, Calendar, ChevronDown } from 'lucide-react';

interface DateFilterProps {
  onFilterChange: (startDate: string, endDate: string) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ onFilterChange }) => {
  const [dateRange, setDateRange] = useState<[Date | undefined, Date | undefined]>([undefined, undefined]);
  const [startDate, endDate] = dateRange;
  const [isMobile, setIsMobile] = useState(false);
  const [isQuickFilterOpen, setIsQuickFilterOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const applyQuickFilter = (filter: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (filter) {
      case 'Today':
        end = today;
        break;
      case 'Yesterday':
        start.setDate(today.getDate() - 1);
        end = start;
        break;
      case 'This Week':
        start.setDate(today.getDate() - today.getDay());
        break;
      case '15 Days':
        start.setDate(today.getDate() - 14);
        break;
      case 'Last Month':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'This Year':
        start = new Date(today.getFullYear(), 0, 1);
        break;
    }

    setDateRange([start, end]);
    onFilterChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
    setIsQuickFilterOpen(false);
  };

  const buttonClass = "px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 min-h-[40px] flex items-center justify-center";
  const dateInputClass = "border-2 w-full md:w-64 border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm min-h-[40px] pl-10";

  const quickFilters = ['Today', 'Yesterday', 'This Week', '15 Days', 'Last Month', 'This Year'];

  return (
    <div className="p-2 px-2">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {isMobile ? (
          <div className="w-full">
            <button
              onClick={() => setIsQuickFilterOpen(!isQuickFilterOpen)}
              className={`${buttonClass} w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white`}
            >
              <span>Filter By Date</span>
              <ChevronDown className="ml-2" size={16} />
            </button>
            {isQuickFilterOpen && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {quickFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => applyQuickFilter(filter)}
                    className={`${buttonClass} w-full bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white`}
                  >
                    {filter}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setIsDatePickerOpen(true);
                    setIsQuickFilterOpen(false);
                  }}
                  className={`${buttonClass} w-full col-span-2 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white`}
                >
                  Custom Date
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => applyQuickFilter(filter)}
                  className={`${buttonClass} bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
              <div className="relative">
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update: [Date | null, Date | null]) => {
                    setDateRange(update ? [update[0] ?? undefined, update[1] ?? undefined] : [undefined, undefined]);
                  }}
                  className={dateInputClass}
                  placeholderText="Select date range"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <button 
                onClick={() => {
                  if (startDate && endDate) {
                    onFilterChange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
                  }
                }}
                className={`${buttonClass} w-full md:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white`}
              >
                Apply Filter
              </button>
            </div>
          </>
        )}
      </div>
      {isMobile && isDatePickerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Select Date Range</h2>
              <button
                onClick={() => setIsDatePickerOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update: [Date | null, Date | null]) => {
                setDateRange(update ? [update[0] ?? undefined, update[1] ?? undefined] : [undefined, undefined]);
              }}
              inline
              className="w-full"
            />
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsDatePickerOpen(false)}
                className={`${buttonClass} bg-gray-200 text-gray-800 hover:bg-gray-300`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsDatePickerOpen(false);
                  if (startDate && endDate) {
                    onFilterChange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
                  }
                }}
                className={`${buttonClass} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white`}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilter;