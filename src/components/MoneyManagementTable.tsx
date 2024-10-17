import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import { MenuIcon, MaterialSymbolsPersonAddOutlineRounded, RefreshIcon } from './Icons';
import { useGlobalContext } from '@/contexts/GlobalContext';
import { CloseIcon, SearchIcon } from "@/components/Select/components/Icons";
import SearchInput from './Select/components/SearchInput';
import Select from './Select';
import { Option, SelectValue } from './Select/components/type';

const MoneyManagementTable = ({ setIsMenu, data, setData }) => {
    const { Refresh } = useGlobalContext();
    const [IsSearch, setIsSearch] = useState(false);
    const [noterVal, setNoterVal] = useState<SelectValue>(null);
    const [searchItem, setSearchItem] = useState('');
    const SearchRef = useRef(null);
    const [batchOperation, setBatchOperation] = useState(false);
    const [selectedElements, setSelectedElements] = useState([]);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [newRow, setNewRow] = useState({
        date: moment().format('YYYY-MM-DD'),
        noter: '',
        retrait: '',
        depot: '',
        argent_restant: ''
    });
    const [noterOptions, setNoterOptions] = useState([]);

    const getListOptions = (list) => list.map((p) => ({
        label: p.name,
        value: p.name
    }));

    useEffect(() => {
        axios.get('https://api.anaqamaghribiya.store/api.php')
            .then(response => setNoterOptions(response.data))
            .catch(error => console.error('Error fetching noter options:', error));
    }, []);

    const calculateArgentRestant = () => {
        const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastArgentRestant = sortedData.length > 0 ? parseFloat(sortedData[0].argent_restant) : 0;
        const newArgentRestant = lastArgentRestant - (parseFloat(newRow.retrait) || 0) + (parseFloat(newRow.depot) || 0);
        return newArgentRestant;
    };

    useEffect(() => {
        const newArgentRestant = calculateArgentRestant();
        setNewRow((prevRow) => ({ ...prevRow, argent_restant: newArgentRestant.toString() }));
    }, [newRow.retrait, newRow.depot, data]);

    const handleSearch = (e) => {
        setSearchItem(e.target.value);
    };

    const handleSelectChange = (v) => {
        setNewRow({ ...newRow, noter: v });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRow({ ...newRow, [name]: value });
    };

    const handleSave = () => {
        axios.post('https://api.anaqamaghribiya.store/add_data.php', newRow)
            .then(response => {
                if (response.data.success) {
                    const updatedData = [newRow, ...data];
                    const sortedData = updatedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    setData(sortedData);
                    handleClosePopup();
                } else {
                    console.error('Error saving data:', response.data.message);
                }
            })
            .catch(error => console.error('Error saving data:', error));
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setNewRow({
            date: moment().format('YYYY-MM-DD'),
            noter: '',
            retrait: '',
            depot: '',
            argent_restant: ''
        });
        setNoterVal(null);
    };

    const filteredData = data.filter(item =>
        item.date.includes(searchItem) ||
        item.noter.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.retrait.toString().includes(searchItem) ||
        item.depot.toString().includes(searchItem) ||
        item.argent_restant.toString().includes(searchItem)
    );

    return (
        <div className="w-full h-full flex flex-col">
            <style jsx>{`
                .hidden-on-mobile {
                    display: table-cell;
                }

                @media (max-width: 768px) {
                    .hidden-on-mobile {
                        display: none;
                    }
                }

                .date-column {
                    color: #ff6d01;
                    font-weight: 600;
                }

                .retrait-column {
                    color: #ff0000;
                    font-weight: 600;
                }

                .depot-column {
                    color: #17e917;
                    font-weight: 600;
                }

                .argent-restant-column {
                    color: #0000ff;
                    font-weight: 600;
                }

                .noter-column {
                    font-weight: 500;
                }
            `}</style>
            <div className="text-white font-semibold p-1 w-full flex items-center bg-gradient-to-r from-blue-500 to-green-500 shadow-lg">
                <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={() => setIsMenu(true)}>
                    <MenuIcon className="h-5 w-5 text-white" strokeWidth={3} />
                </button>
                {!IsSearch && <span className="ml-2">Money Management</span>}
                <div className="px-2 flex-1">
                    {IsSearch && (
                        <SearchInput 
                            placeholder="Search ..."
                            value={searchItem}
                            onChange={handleSearch}
                            name="search"
                            ref={SearchRef}
                        />
                    )}
                </div>
                <div className="flex">
                    <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={() => { if (IsSearch) { setSearchItem(""); } setIsSearch(!IsSearch); }}>
                        {!IsSearch && <SearchIcon className="h-5 w-5 text-white" />}
                        {IsSearch && <CloseIcon className="mx-2 h-5 w-5 text-white" />}
                    </button>
                    {!IsSearch && !batchOperation && (
                        <button className="p-2 py-3 rounded hover:bg-green-600 transition duration-300" onClick={() => {
                            setShowPopup(true);
                            const newArgentRestant = calculateArgentRestant();
                            setNewRow((prevRow) => ({
                                ...prevRow,
                                argent_restant: newArgentRestant.toString()
                            }));
                        }}>
                            <MaterialSymbolsPersonAddOutlineRounded className="h-5 w-5 text-white" strokeWidth={3} />
                        </button>
                    )}
                    {!IsSearch && !batchOperation && (
                        <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={() => Refresh && Refresh(true)}>
                            <RefreshIcon className="h-5 w-5 text-white" strokeWidth={3} />
                        </button>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-auto md:scroll">
                <table className="min-w-full border-separate border-spacing-0 bg-white shadow-lg rounded-lg">
                    <thead className="sticky top-0 bg-gradient-to-r from-blue-500 to-green-500 text-white">
                        <tr>
                            <th className="p-1 text-center text-xs hidden-on-mobile">Date</th>
                            <th className="p-1 text-center text-xs">Noter</th>
                            <th className="p-1 text-center text-xs">Retrait</th>
                            <th className="p-1 text-center text-xs">Depot</th>
                            <th className="p-1 text-center text-xs">Argent Restant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-100 transition duration-300">
                                <td className="border p-1 text-center text-xs hidden-on-mobile date-column">{moment(item.date).format('YYYY-MM-DD')}</td>
                                <td className="border p-1 text-center text-xs noter-column">{item.noter}</td>
                                <td className="border p-1 text-center text-xs retrait-column">{item.retrait ? `${item.retrait}DH` : ''}</td>
                                <td className="border p-1 text-center text-xs depot-column">{item.depot ? `${item.depot}DH` : ''}</td>
                                <td className="border p-1 text-center text-xs argent-restant-column">{item.argent_restant ? `${item.argent_restant}DH` : ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showPopup && (
                <>
                    <div className="fixed z-40 bg-black/30 w-screen h-screen flex justify-center items-center rounded" onClick={handleClosePopup}></div>
                    <div className="fixed z-40 bg-black/30 w-screen h-screen flex justify-center items-center rounded pointer-events-none">
                        <div className="w-[80%] max-w-md overflow-hidden bg-white flex flex-col pointer-events-auto rounded-lg shadow-xl">
                        <div className="text-white bg-gradient-to-r from-blue-500 to-green-500 text-base font-semibold px-4 py-2 text-center">Add New Note</div>
                            <div className="flex flex-col text-sm h-80 mx-h-80 min-h-80 overflow-y-scroll">
                                <div className="p-4">
                                    <label className="block mb-1">Date</label>
                                    <input 
                                        type="date" 
                                        name="date" 
                                        value={newRow.date} 
                                        onChange={handleInputChange} 
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                    />
                                </div>
                                <div className="pl-4 pr-4">
                                    <label className="block">Noter</label>
                                    <div className="flex-1 flex flex-col">
                                        <span className="flex justify-between text-xs text-black font-semibold">
                                        </span>
                                        <Select
                                            accentClass={'bg-blue-600 text-white'}
                                            selectClass="text-black text-xs"
                                            selecetedLabelClass="text-black text-sm"
                                            containerClass="mt-1"
                                            title="Select a Note"
                                            isSearchable={true}
                                            classNames={{ searchContainer: 'relative pb-4 lg:p-2', listItemClass: 'text-black text-sm', searchBox: 'w-full py-2 pl-8 bg-gray-100 border border-gray-200 rounded focus:border-gray-200 focus:ring-0 focus:outline-none text-black text-xs' }}
                                            value={noterVal}
                                            isMultiple={false}
                                            options={getListOptions(noterOptions)}
                                            onChange={(v) => {if(v){setNoterVal(v); handleSelectChange((v as Option).value)} }}
                                            primaryColor="neutral" />
                                    </div>
                                </div>
                                <div className="pl-4 pr-4 pt-4">
                                    <label className="block mb-1">Retrait</label>
                                    <input 
                                        type="number" 
                                        name="retrait" 
                                        value={newRow.retrait} 
                                        onChange={handleInputChange} 
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                    />
                                </div>
                                <div className="pl-4 pr-4 pt-4">
                                    <label className="block mb-1">Depot</label>
                                    <input 
                                        type="number" 
                                        name="depot" 
                                        value={newRow.depot} 
                                        onChange={handleInputChange} 
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                    />
                                </div>
                                <div className="p-4">
                                    <label className="block mb-1">Argent Restant</label>
                                    <input 
                                        type="number" 
                                        name="argent_restant" 
                                        value={newRow.argent_restant} 
                                        readOnly
                                        className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed focus:outline-none"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="p-4 py-2 flex justify-between items-center">
                                <button onClick={handleClosePopup} className="bg-gray-100 hover:bg-gray-200 font-semibold rounded text-sm p-2 px-4 transition duration-300">Cancel</button>
                                <button onClick={handleSave} className="text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 font-semibold rounded text-sm p-2 px-4 transition duration-300 shadow-lg">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MoneyManagementTable;