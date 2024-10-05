import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "./Icons";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import StatusStyling from "@/utils/StatusStyling";
import moment from "moment";

function CustomDropdown({ label, options, value, onChange, isMulti = false }) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const filteredOptions = options.filter(option => option.toLowerCase().includes(search.toLowerCase()));

    const handleSelectOption = (option) => {
        if (isMulti) {
            const newValue = value.includes(option) ? value.filter(v => v !== option) : [...value, option];
            onChange(newValue);
        } else {
            onChange(option);
            setIsOpen(false);
            setSearch('');
        }
    };
    return (
        <div ref={dropdownRef} className="relative w-full sm">
            <button
                type="button"
                className="border border-gray-300 rounded-md p-2 w-full flex justify-between items-center text-left shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-indigo-500"
                onClick={() => setIsOpen(!isOpen)}
            >
                {label}: {isMulti ? value.join(', ') || 'All' : value || 'All'}
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
                    <div className="flex items-center p-2 border-b border-gray-300">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full p-2 focus:outline-none"
                            placeholder={`Search ${label.toLowerCase()}`}
                        />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                        {isMulti && (
                            <div className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => { onChange([]); setIsOpen(false); setSearch(''); }}>
                                Clear All
                            </div>
                        )}
                        {!isMulti && (
                            <div className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }}>
                                Clear All
                            </div>
                        )}
                        {filteredOptions.map((option, index) => (
                            <div
                                key={index}
                                className={`p-2 hover:bg-gray-100 cursor-pointer ${value.includes(option) ? 'bg-gray-200' : ''}`}
                                onClick={() => handleSelectOption(option)}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DataTable({ IsBatchOperation, selectedElements, setSelectedElements, IsCasa, IsSearch, headers, data, tableClass = '', headerClass = '', containerClass = '', pageCount, page, setSelected = (item, index) => { }, setFilteredData }) {
    const [SelectedPage, setSelectedPage] = useState(page);
    const [PageCount, setPageCount] = useState(pageCount);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [cityFilter, setCityFilter] = useState('');
    const [isPayedFilter, setIsPayedFilter] = useState('');

    useEffect(() => {
        if (IsSearch) {
            setSelectedPage(1);
        }
    }, [data]);

    const filteredData = data.filter(item =>
        (statusFilter.length > 0 ? statusFilter.some(status => item.status.toLowerCase() === status.toLowerCase()) : true) &&
        (cityFilter ? item.city.toLowerCase() === cityFilter.toLowerCase() : true) &&
        (isPayedFilter ? item.isPayed === isPayedFilter : true)
    );

    useEffect(() => {
        setFilteredData(filteredData);
    }, [statusFilter, cityFilter, isPayedFilter, setFilteredData]);

    const uniqueStatuses = Array.from(new Set(data.map(item => item.status)));
    const uniqueCities = Array.from(new Set(data.map(item => item.city)));
    const uniqueIsPayed = ['✅ Payé', '🕐 En attente Payé', '⛔ Non Payé'];

    // Create a frequency map for phone numbers in the full data (not just filtered data)
    const phoneFrequencyMap = new Map();
    data.forEach((item) => {
        if (phoneFrequencyMap.has(item.phoneNumber)) {
            phoneFrequencyMap.set(item.phoneNumber, phoneFrequencyMap.get(item.phoneNumber) + 1);
        } else {
            phoneFrequencyMap.set(item.phoneNumber, 1);
        }
    });

    function isDuplicate(phoneNumber) {
        return phoneFrequencyMap.get(phoneNumber) > 1;
    }

    function changeSelection(e, id) {
        if (e.target.checked) {
            setSelectedElements([...selectedElements, id]);
        } else {
            setSelectedElements(selectedElements.filter((el) => el !== id));
        }
    }

    return (
        <div className={`${containerClass} w-full flex-col flex flex-1 relative overflow-hidden`}>
            <style jsx>{`
                .hidden-on-mobile {
                    display: table-cell;
                }

                @media (max-width: 768px) {
                    .hidden-on-mobile {
                        display: none;
                    }
                }

                .header {
                    background: linear-gradient(to right, #3b82f6, #10b981);
                }

                .header-text {
                    color: white;
                }
            `}</style>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-2 space-y-2 sm:space-y-0">
                <CustomDropdown
                    label="Status"
                    options={uniqueStatuses}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    isMulti={true}
                />
                <CustomDropdown
                    label="City"
                    options={uniqueCities}
                    value={cityFilter}
                    onChange={setCityFilter}
                />
                <CustomDropdown
                    label="Is Payed"
                    options={uniqueIsPayed}
                    value={isPayedFilter}
                    onChange={setIsPayedFilter}
                />
            </div>
            <div className="flex flex-1 overflow-y-scroll max-h-full overscroll-contain md:scroll">
                <table className={`${tableClass} w-full h-fit border-collapse border-spacing-0 bg-white shadow-lg rounded-lg`}>
                    <thead className={`sticky top-0 -left-1 before:flex before:absolute before:-top-[2px] before:w-full before:h-[4px] ${IsCasa ? 'before:from-blue-500 to-green-500 shadow-lg' : 'before:from-blue-500 to-green-500 shadow-lg'} header`}>
                        <tr className={`${IsCasa ? 'from-blue-500 to-green-500 shadow-lg' : 'from-blue-500 to-green-500 shadow-lg'} text-white`}>
                            {IsBatchOperation && <th className={` border-l border-b border-black/20 p-1.5 text-center text-xs`}>
                                <input checked={selectedElements.length == filteredData.length} type="checkbox" onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedElements(filteredData.map((el) => el.orderId));
                                    } else {
                                        setSelectedElements([]);
                                    }
                                }} />
                            </th>}
                            {headers.map(h => (
                                <th key={`k-${h.for}`} className={`${headerClass} p-1 text-nowrap text-center text-xs header-text ${h.for === 'city' || h.for === 'orderId' || h.for === 'orderDate' || h.for === 'price' || h.for === 'product' || h.for === 'upSellProduct' || h.for === 'Address' || h.for === 'quantity' || h.for === 'source' ? 'hidden md:table-cell' : ''}`}>
                                    {h.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(pageCount)].map((v, i) => i < (filteredData.length - ((SelectedPage - 1) * pageCount)) && (
                            <tr key={`order-${i}`} className="hover:bg-gray-100">
                                {IsBatchOperation && <td key={"ch" + (((SelectedPage - 1) * pageCount) + i)} className={` border-l border-b border-black/20 p-1.5 text-center text-xs`}>
                                    <input checked={selectedElements.includes(filteredData[i + ((SelectedPage - 1) * pageCount)].orderId)} type="checkbox" onChange={(e) => changeSelection(e, filteredData[i + ((SelectedPage - 1) * pageCount)].orderId)} />
                                </td>}
                                {headers.map((h, hi) => (
                                    <>
                                        <td
                                            onClick={() => setSelected({ isDuplicated: isDuplicate(filteredData[i + ((SelectedPage - 1) * pageCount)].phoneNumber), ...filteredData[i + ((SelectedPage - 1) * pageCount)] }, ((SelectedPage - 1) * pageCount) + i)}
                                            key={`o-${h.for}`}
                                            className={`${headerClass}
                                        ${isDuplicate(filteredData[i + ((SelectedPage - 1) * pageCount)].phoneNumber) && h.for === 'phoneNumber' ? 'bg-orange-300 text-black font-semibold' : ''}
                                        ${h.for === 'status' ? 'font-semibold' : ''}
                                        cursor-pointer
                                        ${hi !== 0 ? 'border-l' : ''}
                                        border-b
                                        text-center
                                        border-black/20
                                        p-1.5
                                        ${h.for !== 'phoneNumber' ? 'text-nowrap' : ''}
                                        ${h.for === 'city' ? 'hidden md:table-cell font-semi' : ''}
                                        ${h.for === 'Address' ? 'hidden md:table-cell font-normal' : ''}
                                        ${['orderId', 'orderDate', 'price'].includes(h.for) ? 'hidden md:table-cell font-semibold' : ''}
                                        ${['product', 'upSellProduct', 'quantity', 'source'].includes(h.for) ? 'hidden md:table-cell font-semi' : ''}
                                        ${h.class}
                                        text-xs`}
                                            style={h.for === 'orderId' ? { color: '#ff6d01' } : h.for === 'price' ? { color: '#0000ff' } : { color: h.for === 'orderDate' ? '#ea4335' : StatusStyling[filteredData[i + ((SelectedPage - 1) * pageCount)][h.for]] }}
                                        >
                                            {h.for === 'orderDate' ? moment.unix(filteredData[i + ((SelectedPage - 1) * pageCount)][h.for]).format('DD/MM/YYYY HH:mm') : h.for === 'price' ? `${filteredData[i + ((SelectedPage - 1) * pageCount)][h.for]} DH` : filteredData[i + ((SelectedPage - 1) * pageCount)][h.for]}
                                        </td>
                                    </>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center bg-white p-2 pb-0">
                <div className="flex">
                    <button onClick={() => setSelectedPage(1)} className="p-2 mx-2"><ChevronsLeftIcon className="h-5 w-5" /></button>
                    <button onClick={() => SelectedPage > 1 ? setSelectedPage(SelectedPage - 1) : () => { }} className="p-2 mx-2"><ChevronLeftIcon className="h-5 w-5" /></button>
                </div>
                <div className="flex text-xs">
                    {SelectedPage} / {Math.floor(filteredData.length / pageCount) + 1}
                </div>
                <div className="flex">
                    <button onClick={() => SelectedPage < (Math.floor(filteredData.length / pageCount) + 1) ? setSelectedPage(SelectedPage + 1) : () => { }} className="p-2 mx-2"><ChevronRightIcon className="h-5 w-5" /></button>
                    <button onClick={() => setSelectedPage(Math.floor(filteredData.length / pageCount) + 1)} className="p-2 mx-2"><ChevronsRightIcon className="h-5 w-5" /></button>
                </div>
            </div>
            <div className="bg-white px-2 text-right text-xs font-semibold">
                <p>Rows: {filteredData.length}</p>
            </div>
        </div>
    );
}
