import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { MenuIcon, TablerColumnInsertLeft, RefreshIcon, EditIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, SaveIcon, TablerRowInsertTop } from './Icons';
import { useGlobalContext } from '@/contexts/GlobalContext';
import { CloseIcon, SearchIcon } from "@/components/Select/components/Icons";
import SearchInput from './Select/components/SearchInput';

const StockTable = ({ setIsMenu }) => {
    const { Refresh } = useGlobalContext();
    const [IsSearch, setIsSearch] = useState(false);
    const [Inserted, setInserted] = useState(false);
    const [searchItem, setSearchItem] = useState('');
    const SearchRef = useRef(null);
    const [data, setData] = useState<any[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [selectedPage, setSelectedPage] = useState(1);
    const [columns, setColumns] = useState<string[]>([]);
    const [newColumnName, setNewColumnName] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const pageSize = 3;

    const fetchData = () => {
        axios.get('https://api.anaqamaghribiya.store/stock.php')
            .then(response => {
                const nonNullData = response.data.filter((item) => item !== null);
                setData(nonNullData);

                if (nonNullData.length > 0) {
                    setColumns(Object.keys(nonNullData[0]).filter(key => key !== 'id'));
                }
            })
            .catch(error => console.error('Error fetching stock data:', error));
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!Inserted) {
            fetchData();
        }
    }, [Inserted]);

    const handleSearch = (e) => {
        setSearchItem(e.target.value);
    };

    const filteredData = data.filter(item =>
        columns.some(column => (item[column] as string).toLowerCase().includes(searchItem.toLowerCase()))
    );

    const handleSave = () => {
        axios.post('https://api.anaqamaghribiya.store/stock.php', filteredData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.data.status === 1) {
                    setEditMode(false);
                    setInserted(false);
                    console.log('Data saved successfully');
                } else {
                    console.error('Error saving data:', response.data.status_message);
                }
            })
            .catch(error => console.error('Error saving data:', error));
    };

    const handleAdd = () => {
        setInserted(true);
        const newProduct = columns.reduce((obj, col) => ({ ...obj, [col]: '' }), {});
        const updatedData = [...filteredData, newProduct];
        setData(updatedData);
    };

    const handleEditModeToggle = () => {
        setEditMode(!editMode);
    };

    const handleAddColumn = () => {
        if (newColumnName) {
            axios.get(`https://api.anaqamaghribiya.store/Add-culomn-stock.php?column_name=${newColumnName}`)
                .then(response => {
                    if (response.status === 200) {
                        setColumns([...columns, newColumnName]);
                        setData(data.map(row => ({ ...row, [newColumnName]: '' })));
                        setShowPopup(false); // إخفاء popup بعد إضافة العمود بنجاح
                        setNewColumnName('');
                        setSuccessMessage('تمت إضافة العمود بنجاح');
                        setTimeout(() => setSuccessMessage(''), 3000);
                    } else {
                        console.error('Error adding column:', response.data.status_message);
                    }
                })
                .catch(error => console.error('Error adding column:', error));
        }
    };

    const paginatedColumns = columns.slice((selectedPage - 1) * pageSize, selectedPage * pageSize);
    const totalPages = Math.ceil(columns.length / pageSize);

    const handleRefresh = () => {
        fetchData();
        setInserted(false);
    };

    const removeSuffix = (text: string) => {
        if (text.endsWith('-- Out')) {
            return text.replace('-- Out', '').trim();
        }
        if (text.endsWith('-- En Att')) {
            return text.replace('-- En Att', '').trim();
        }
        if (text.endsWith('-- Casa')) {
            return text.replace('-- Casa', '').trim();
        }
        return text;
    };

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

                .n33-column {
                    color: #ff6d01;
                    font-weight: 600;
                }

                .stock-column {
                    font-weight: 500;
                }

                .cell-border {
                    border: 0px solid #ccc;
                }

                .cell-no-border {
                    border: none;
                }

                .out-background {
                    background-color: #00ffff;
                }

                .en-att-background {
                    background-color: #00ff00;
                }

                .casa-background {
                    background-color: #ff00ff;
                }

                .header {
                    background: linear-gradient(to right, #3b82f6, #10b981);
                }

                .header-text {
                    color: white;
                }
            `}</style>
            <div className="text-white font-semibold p-1 w-full flex items-center header shadow-lg">
                <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={() => setIsMenu(true)}>
                    <MenuIcon className="h-5 w-5 text-white" strokeWidth={3} />
                </button>
                {!IsSearch && <span className="ml-2 header-text">Stock Management</span>}
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
                    {!editMode && (
                        <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={() => { if (IsSearch) { setSearchItem(""); } setIsSearch(!IsSearch); }}>
                            {!IsSearch && <SearchIcon className="h-5 w-5 text-white" />}
                            {IsSearch && <CloseIcon className="mx-2 h-5 w-5 text-white" />}
                        </button>
                    )}
                    <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={handleEditModeToggle}>
                        <EditIcon className="h-5 w-5 text-white" />
                    </button>
                    {editMode && (
                        <button className="p-2 py-3 rounded hover:bg-green-600 transition duration-300" onClick={handleSave}>
                            <SaveIcon className="h-5 w-5 text-white" />
                        </button>
                    )}
                    {editMode && (
                        <>
                            <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={handleAdd}>
                                <TablerRowInsertTop className="h-5 w-5 text-white" />
                            </button>
                            <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={() => setShowPopup(true)}>
                                <TablerColumnInsertLeft className="h-5 w-5 text-white" />
                            </button>
                        </>
                    )}
                    {!editMode && (
                        <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={handleRefresh}>
                            <RefreshIcon className="h-5 w-5 text-white" strokeWidth={3} />
                        </button>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-auto md:scroll">
                <table className="min-w-full border-separate border-spacing-0 bg-white shadow-lg rounded-lg">
                    <thead className="sticky top-0 header header-text">
                        <tr>
                            {columns.map((column, index) => (
                                <th 
                                    key={column} 
                                    className={`p-1 text-center text-xs ${index >= (selectedPage - 1) * pageSize && index < selectedPage * pageSize ? '' : 'hidden-on-mobile'}`}
                                >
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-100 transition duration-300">
                                {columns.map((column, colIndex) => (
                                    <td 
                                        className={`${item[column]?.endsWith('-- Out') ? 'out-background' : ''} ${item[column]?.endsWith('-- En Att') ? 'en-att-background' : ''} ${item[column]?.endsWith('-- Casa') ? 'casa-background' : ''} ${item[column] || editMode ? 'cell-border' : 'cell-no-border'} p-1 text-center text-xs stock-column ${colIndex >= (selectedPage - 1) * pageSize && colIndex < selectedPage * pageSize ? '' : 'hidden-on-mobile'}`}
                                        key={column}
                                    >
                                        {editMode ? (
                                            <input
                                                type="text"
                                                value={item[column]}
                                                onChange={(e) => {
                                                    const updatedRow = { ...item, [column]: e.target.value };
                                                    const updatedData = [...filteredData];
                                                    updatedData[index] = updatedRow;
                                                    setData(updatedData);
                                                }}
                                                className="w-full p-2 border rounded"
                                            />
                                        ) : (
                                            removeSuffix(item[column])
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center bg-white p-2 pb-0">
                <div className="flex">
                    <button onClick={() => setSelectedPage(1)} className="p-2 mx-2"><ChevronsLeftIcon className="h-5 w-5" /></button>
                    <button onClick={() => selectedPage > 1 ? setSelectedPage(selectedPage - 1) : null} className="p-2 mx-2"><ChevronLeftIcon className="h-5 w-5" /></button>
                </div>
                <div className="flex text-xs">
                    {selectedPage} / {totalPages}
                </div>
                <div className="flex">
                    <button onClick={() => selectedPage < totalPages ? setSelectedPage(selectedPage + 1) : null} className="p-2 mx-2"><ChevronRightIcon className="h-5 w-5" /></button>
                    <button onClick={() => setSelectedPage(totalPages)} className="p-2 mx-2"><ChevronsRightIcon className="h-5 w-5" /></button>
                </div>
            </div>
            {showPopup && (
                <>
                    <div className="fixed z-40 bg-black/30 w-screen h-screen flex justify-center items-center rounded" onClick={() => setShowPopup(false)}></div>
                    <div className="fixed z-40 bg-black/30 w-screen h-screen flex justify-center items-center rounded pointer-events-none">
                        <div className="w-[80%] max-w-md overflow-hidden bg-white flex flex-col pointer-events-auto rounded-lg shadow-xl">
                            <div className="text-white bg-gradient-to-r from-blue-500 to-green-500 text-base font-semibold px-4 py-2 text-center">Add New Product</div>
                            <div className="flex flex-col text-sm h-80 mx-h-80 min-h-80 overflow-y-scroll">
                                <div className="p-4">
                                    <label className="block mb-1">Product Name</label>
                                    <input 
                                        type="text" 
                                        value={newColumnName}
                                        onChange={(e) => setNewColumnName(e.target.value)}
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                        placeholder="Product Name"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="p-4 py-2 flex justify-between items-center">
                                <button onClick={() => setShowPopup(false)} className="bg-gray-100 hover:bg-gray-200 font-semibold rounded text-sm p-2 px-4 transition duration-300">Cancel</button>
                                <button onClick={handleAddColumn} className="text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 font-semibold rounded text-sm p-2 px-4 transition duration-300 shadow-lg">
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {successMessage && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded">
                    {successMessage}
                </div>
            )}
        </div>
    );
};

export default StockTable;
