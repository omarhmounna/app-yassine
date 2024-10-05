'use client';

import moment from 'moment';
import Image from 'next/image';
import { useEffect, useRef, useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import DataTable from "@/components/DataTable";
import DuplicatedOrder from "@/components/DuplicatedOrder";
import { BiFiletypeXlsx, MaterialSymbolsDownloading, MaterialSymbolsPersonAddOutlineRounded, MdiCircleEditOutline, MenuIcon, RefreshIcon, TablerCheckbox, TrashIcon } from "@/components/Icons";
import OrderAdd from "@/components/OrderAdd";
import OrderEdit from "@/components/OrderEdit";
import OrderOperation from "@/components/OrderOperations";
import Select from "@/components/Select";
import { CloseIcon, SearchIcon } from "@/components/Select/components/Icons";
import SideMenu from "@/components/SideMenu";
import StatusSelector from "@/components/StatusSelector";
import { useGlobalContext } from "@/contexts/GlobalContext";
import useWindowSize from "@/utils/CustomHooks";
import { useLeavePageConfirmation } from "@/utils/useLeavePageConfirmation";
import Login from '@/components/Login';
import axios from 'axios';
import MoneyManagementTable from '@/components/MoneyManagementTable';
import StockTable from '@/components/StockTable';
import Dashboard from '@/components/Dashboard'; // Import the Dashboard component
import BonsRetour from '@/components/BonsRetour';

// Define type Option
type Option = {
    label: string;
    value: string;
};

// Notification Component
const Notification = ({ message, error }) => (
    <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg ${error ? 'bg-red-500' : 'bg-green-500'} text-white`}>
        {message}
    </div>
);

export default function Home() {
    const SearchRef = useRef<HTMLInputElement>(null);
    const { IsPayed, setIsPayed, Products, MoneyManagement, setMoneyManagement, setProducts, Orders, Cities, setCities, setOrders, Sources, setSources, Status, setStatus, Loading, Refresh, IsCasa, setIsCasa } = useGlobalContext();

    const [isLoggedIn, setIsLoggedIn] = useState(false); // New state for login status
    const [SelectedOrder, setSelectedOrder] = useState<any>(null);
    const [duplicatedOrder, setDuplicatedOrder] = useState<any>(null);
    const [IsEditMode, setIsEditMode] = useState<any>(null);
    const [IsAddMode, setIsAddMode] = useState<any>(null);
    const [addObject, setAddObject] = useState<any>(null);
    const [IsSearch, setIsSearch] = useState<any>(false);
    const [searchItem, setSearchItem] = useState<any>("");
    const [isDownloadConfirm, setIsDownloadConfirm] = useState(false);
    const [isExportConfirm, setIsExportConfirm] = useState(false); // حالة جديدة لتأكيد التصدير
    const [isAction, setIsAction] = useState(false);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [batchOperation, setBatchOperation] = useState(false);
    const [selectedElements, setSelectedElements] = useState<any>([]);
    const [isMultipleStatus, setIsMultipleStatus] = useState(false);
    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false); // New state for delete confirmation
    const [notification, setNotification] = useState<{ show: boolean, message: string, error: boolean }>({ show: false, message: "", error: false });
    const [isMoneyManagement, setIsMoneyManagement] = useState(false); // حالة جديدة للتحكم في عرض صفحة إدارة المال
    const [isStockTable, setIsStockTable] = useState(false); // حالة جديدة للتحكم في عرض Stock Table
    const [isDashboard, setIsDashboard] = useState(true); // اضبط الحالة الافتراضية إلى true
    const [isBonsRetour, setIsBonsRetour] = useState(false); // اضبط الحالة الافتراضية إلى true
    const [processingCount, setProcessingCount] = useState(0);
    const normalizePhoneNumber = (phoneNumber: string) => {
        return phoneNumber.replace(/\s+/g, '').replace(/-/g, '').replace(/^\+212/, '0');
    };

    const [IsMenu, setIsMenu] = useState<any>(false);
    const [selected, setSelected] = useState<any>([]);
    const getProductOptions = () => Products!.map<Option>((p: string) => {
        return {
            label: p,
            value: p
        };
    });

    useEffect(() => {
        if (IsSearch) {
            SearchRef.current!.focus();
        }
    }, [IsSearch]);

    useWindowSize();
    useLeavePageConfirmation(true, 'k',);

    const Filtred = useMemo(() => {
        if (!Orders) return [];
        const normalizedSearchItem = normalizePhoneNumber(searchItem);
        const filtered = Orders.filter(e => {
            const normalizedPhoneNumber = normalizePhoneNumber(e.phoneNumber);
            const normalizedData = {
                ...e,
                phoneNumber: normalizedPhoneNumber,
                row: -1,
                orderDate: moment.unix(e.orderDate).format('DD/MM/YYYY HH:mm')
            };
            return JSON.stringify(Object.values(normalizedData)).toLowerCase().includes(normalizedSearchItem.toLowerCase());
        });
        setFilteredData(filtered);
        return filtered;
    }, [Orders, searchItem]);

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");
        XLSX.writeFile(workbook, "filtered_data.xlsx");
    };

    function deleteSelected() {
        setLoadingDelete(true);
        axios.post('https://yassine.anaqamaghribiya.com/batch-operation.php', { delete: selectedElements })
            .then((res) => {
                setOrders!(Orders!.filter((e: any) => !selectedElements.includes(e.orderId)));
                setBatchOperation(false);
                setLoadingDelete(false);
                setNotification({ show: true, message: "Orders have been deleted successfully!", error: false });
                setTimeout(() => setNotification({ show: false, message: "", error: false }), 1000); // Hide notification after 2 seconds
            })
            .catch((err) => {
                console.error("Error deleting orders:", err);
                setLoadingDelete(false);
                setNotification({ show: true, message: "Failed to delete orders.", error: true });
                setTimeout(() => setNotification({ show: false, message: "", error: false }), 1000); // Hide notification after 2 seconds
            });
    }

    function setElementsNewStatus(s) {
        if (s != null) {
            setOrders!(Orders?.map(e => selectedElements.includes(e.orderId) ? { ...e, status: s } : e))
            setBatchOperation(false);
        }
    }

    useEffect(() => {  
        setSelectedOrder(Orders?.filter(o=>o.orderId==SelectedOrder?.orderId)[0]);
        if(!IsCasa){
            setProcessingCount(Orders?Orders.filter(e=>e.status== 'Processing').length:0)
        }
    }, [Orders]);

    return (
        <main style={{ maxHeight: 'var(--portview-height)' }} className={`overscroll-contain flex h-dvh overflow-hidden relative flex-col items-center ${Loading ? 'justify-center' : 'justify-between'}`}>
            {!isLoggedIn && <Login setIsLoggedIn={() => setIsLoggedIn(true)} />} {/* Render Login component if not logged in */}
            {isLoggedIn && (
                <>
                    <OrderOperation Cities={Cities} setAddObject={setAddObject} setIsAddMode={setIsAddMode} IsCasa={IsCasa} setData={setOrders} data={Orders} selectedOrder={SelectedOrder} setIsEditMode={setIsEditMode} setSelectedOrder={setSelectedOrder} setDuplicatedOrder={setDuplicatedOrder} />
                    <DuplicatedOrder IsCasa={IsCasa} selectedOrder={SelectedOrder} duplicatedOrder={duplicatedOrder} setDuplicatedOrder={setDuplicatedOrder} />
                    {IsEditMode && <OrderEdit IsCasa={IsCasa} setData={setOrders} IsPayed={IsPayed} setIsPayed={setIsPayed} Sources={Sources} setSources={setSources} Status={Status} setStatus={setStatus} Products={Products} setProducts={setProducts} Cities={Cities} setCities={setCities} data={Orders} selectedOrder={SelectedOrder} setIsEditMode={setIsEditMode} setSelectedOrder={setSelectedOrder} isEditMode={IsEditMode} />}
                    {IsAddMode && <OrderAdd setAddObject={setAddObject} addObject={addObject} setData={setOrders} IsPayed={IsPayed} setIsPayed={setIsPayed} Sources={Sources} setSources={setSources} Status={Status} setStatus={setStatus} Products={Products} setProducts={setProducts} Cities={Cities} setCities={setCities} data={Orders} setIsAddMode={setIsAddMode} isAddMode={IsEditMode} />}
                    <SideMenu setIsBonsRetour={setIsBonsRetour} processingCount={processingCount} setIsMenu={setIsMenu} IsMenu={IsMenu} setIsCasa={(v) => { setIsAddMode(false); setIsEditMode(false); setSelectedOrder(false); setIsCasa!(v); setIsMenu(false) }} setIsMoneyManagement={setIsMoneyManagement} setIsStockTable={setIsStockTable} setIsDashboard={setIsDashboard} /> {/* تمرير setIsMenu و setIsStockTable و setIsMoneyManagement و setIsDashboard */}

                    {isDashboard ? ( // عرض Dashboard إذا كانت الحالة true
                        <div className="w-full h-full overflow-y-auto">
                            <Dashboard setIsDashboard={setIsDashboard} setIsMenu={setIsMenu} /> {/* تمرير setIsMenu إلى Dashboard */}
                        </div>
                    ) : isStockTable ? ( // عرض StockTable إذا كانت الحالة true
                        <div className="w-full h-full overflow-y-auto">
                            <StockTable setIsMenu={setIsMenu} /> {/* تمرير setIsMenu إلى StockTable */}
                        </div>
                    ) : isMoneyManagement ? ( // عرض MoneyManagementTable إذا كانت الحالة true
                        <div className="w-full h-full overflow-y-auto">
                            <MoneyManagementTable data={MoneyManagement} setData={setMoneyManagement} setIsMenu={setIsMenu} />
                        </div>
                    ) :isBonsRetour ? ( // عرض MoneyManagementTable إذا كانت الحالة true
                        <div className="w-full h-full overflow-y-auto">
                            <BonsRetour isMenu={IsMenu} setIsMenu={setIsMenu} />
                        </div>
                    ) : (
                        !Loading && (
                            <>
                                <div className="text-white font-semibold p-2 w-full flex items-center relative bg-gradient-to-r from-blue-500 to-green-500 shadow-lg">
                                    <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={() => { setIsMenu(true) }}>
                                        <MenuIcon className="h-5 w-5 text-white" strokeWidth={3} />
                                    </button>
                                    {!IsSearch && <span>{IsCasa ? "Casablanca" : "Orders"}</span>}
                                    <div className="px-2 flex-1">
                                        <input value={searchItem} placeholder="Search ..." ref={SearchRef} onInput={(e) => setSearchItem(e.currentTarget.value)} type="text" className={`rounded w-full text-black text-sm font-normal px-2 py-[2px] ${!IsSearch ? 'hidden' : ''}`} />
                                    </div>
                                    <div className="flex">
                                        {!batchOperation && <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={() => { if (IsSearch) { setSearchItem("") } setIsSearch!(!IsSearch) }}>
                                            {!IsSearch && <SearchIcon className="h-5 w-5 text-white" />}
                                            {IsSearch && <CloseIcon className="mx-2 h-5 w-5 text-white" />}
                                        </button>}
                                        {!IsSearch && !batchOperation && !IsCasa && <button className="p-2 py-3 rounded hover:bg-green-600 transition duration-300" onClick={() => setIsAddMode!(true)}>
                                            <MaterialSymbolsPersonAddOutlineRounded className="h-5 w-5" strokeWidth={3} />
                                        </button>}
                                        {!IsSearch && !batchOperation && !IsCasa && (
                                            <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={() => setIsDownloadConfirm(true)}>
                                                <MaterialSymbolsDownloading className="h-5 w-5 text-white" strokeWidth={3} />
                                            </button>
                                        )}
                                        {!IsSearch && !batchOperation && (
                                            <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={() => setIsExportConfirm(true)}>
                                                <BiFiletypeXlsx className="h-5 w-5 text-white" strokeWidth={3} />
                                            </button>
                                        )}
                                        {IsSearch && (
                                            <button className="p-2 py-3 rounded" onClick={() => { }}>
                                                <SearchIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                        {batchOperation && selectedElements.length > 0 && <button className="p-2 py-3 rounded hover:bg-red-600 transition duration-300" onClick={() => { setIsDeleteConfirm(true) }} >
                                            {loadingDelete ? <div className="w-4 h-4 border-4 border-t-3 border-t-green-500 border-gray-200 rounded-full animate-spin"></div> : <TrashIcon strokeWidth={2} className="h-5 w-5 text-white" />}
                                        </button>
                                        }
                                        {batchOperation && selectedElements.length > 0 && <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={() => { if (selectedElements.length > 0) { setIsMultipleStatus(true) } }} >
                                            <MdiCircleEditOutline className="h-5 w-5 text-white" />
                                        </button>
                                        }
                                        {!IsSearch &&
                                            <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={() => { setBatchOperation(!batchOperation); setSelectedElements([]) }}>
                                                <TablerCheckbox className="h-5 w-5 text-white" />
                                            </button>
                                        }
                                        {!IsSearch && !batchOperation && (
                                            <button className="p-2 py-3 rounded hover:bg-blue-600 transition duration-300" onClick={() => Refresh!(true)}>
                                                <RefreshIcon className="h-5 w-5 text-white" strokeWidth={3} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <DataTable
                                    IsBatchOperation={batchOperation}
                                    selectedElements={selectedElements}
                                    setSelectedElements={setSelectedElements}
                                    IsCasa={IsCasa}
                                    IsSearch={IsSearch}
                                    setSelected={(item, index) => setSelectedOrder({ ...item, index: index })}
                                    data={Filtred}
                                    headers={[
                                        { name: 'Order ID', for: 'orderId', class: "w-1/" },
                                        { name: 'Order Date', for: 'orderDate', class: "hidden md:table-cell w-1/" },
                                        { name: 'Full Name', for: 'fullName', class: "w-1/" },
                                        { name: 'Phone Number', for: 'phoneNumber', class: "w-1/" },
                                        { name: 'Address', for: 'Address', class: "hidden md:table-cell" },
                                        { name: 'City', for: 'city' },
                                        { name: 'Quantity', for: 'quantity', class: "hidden md:table-cell" },
                                        { name: 'Product', for: 'product', class: "hidden md:table-cell" },
                                        { name: 'Up Sell Product', for: 'upSellProduct', class: "hidden md:table-cell" },
                                        { name: 'Price', for: 'price', class: "hidden md:table-cell" },
                                        { name: 'source', for: 'source' },
                                        { name: 'Status', for: 'status' },
                                    ]}
                                    page={1}
                                    pageCount={100}
                                    setFilteredData={setFilteredData} // تمرير الدالة لتحديث البيانات المفلترة
                                />
                            </>
                        )
                    )}
                    {Loading && (
                        <div style={{ maxHeight: 'var(--portview-height)' }} className="fixed z-50 h-screen w-screen bg-white flex items-center justify-center">
                            {/*<Image src="/AnaqaLogo_Loading.webp" alt="Loading..." width={200} height={200} />*/}
                        </div>
                    )}
                    {isDownloadConfirm && (
                        <div style={{ maxHeight: 'var(--portview-height)' }} className={`fixed overscroll-contain justify-center items-center flex flex-col transition-[left] duration-200 z-10 top-0 w-screen bg-black/15 h-dvh `} onClick={() => { setIsDownloadConfirm(false) }}>
                            <div className=" overflow-hidden flex flex-col max-w-[80%] w-96  rounded bg-white" onClick={(e) => { e.stopPropagation(); e.preventDefault() }}>
                                <div className="bg-blue-500 text-white font-semibold text-sm p-4">
                                    Confirm Download?
                                </div>
                                <div className={`p-4 pb-2 px-8 text-sm`}>Do you really want to download the orders Confirmed?</div>
                                <div className="p-4 flex items-center justify-end">
                                    <button onClick={() => setIsDownloadConfirm(false)} className="text-sm p-2 px-4 mx-4 border rounded">Cancel</button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsAction(true);
                                            setIsDownloadConfirm(false);
                                            window.open('https://yassine.anaqamaghribiya.com/confirmed.php?rnd=' + Math.random(), '_blank');
                                            setIsAction(false);
                                        }}
                                        className={`bg-blue-500 px-4 text-white rounded text-sm p-2 mx-4 flex`}
                                        disabled={isAction}
                                    >
                                        {isAction && <div className="mx-4" role="status">
                                            <svg aria-hidden="true" className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                            </svg>
                                        </div>}
                                        {!isAction ? 'Download' : ''}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {isExportConfirm && (
                        <div style={{ maxHeight: 'var(--portview-height)' }} className={`fixed overscroll-contain justify-center items-center flex flex-col transition-[left] duration-200 z-10 top-0 w-screen bg-black/15 h-dvh `} onClick={() => { setIsExportConfirm(false) }}>
                            <div className=" overflow-hidden flex flex-col max-w-[80%] w-96  rounded bg-white" onClick={(e) => { e.stopPropagation(); e.preventDefault() }}>
                                <div className="bg-blue-500 text-white font-semibold text-sm p-4">
                                    Confirm Export?
                                </div>
                                <div className={`p-4 pb-2 px-8 text-sm`}>Do you really want to export the filtered data to Excel?</div>
                                <div className="p-4 flex items-center justify-end">
                                    <button onClick={() => setIsExportConfirm(false)} className="text-sm p-2 px-4 mx-4 border rounded">Cancel</button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsAction(true);
                                            setIsExportConfirm(false);
                                            exportToExcel();
                                            setIsAction(false);
                                        }}
                                        className={`bg-blue-500 px-4 text-white rounded text-sm p-2 mx-4 flex`}
                                        disabled={isAction}
                                    >
                                        {isAction && <div className="mx-4" role="status">
                                            <svg aria-hidden="true" className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                            </svg>
                                        </div>}
                                        {!isAction ? 'Export' : ''}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {isDeleteConfirm && (
                        <div style={{ maxHeight: 'var(--portview-height)' }} className={`fixed overscroll-contain justify-center items-center flex flex-col transition-[left] duration-200 z-10 top-0 w-screen bg-black/15 h-dvh `} onClick={() => { setIsDeleteConfirm(false) }}>
                            <div className=" overflow-hidden flex flex-col max-w-[80%] w-96  rounded bg-white" onClick={(e) => { e.stopPropagation(); e.preventDefault() }}>
                                <div className="bg-red-500 text-white font-semibold text-sm p-4">
                                    Delete selected orders?
                                </div>
                                <div className={`p-4 pb-2 px-8 text-sm`}>Do you really want to delete the selected orders?</div>
                                <div className="p-4 flex items-center justify-end">
                                    <button onClick={() => setIsDeleteConfirm(false)} className="text-sm p-2 px-4 mx-4 border rounded">Cancel</button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsAction(true);
                                            setIsDeleteConfirm(false);
                                            deleteSelected();
                                            setIsAction(false);
                                        }}
                                        className={`bg-red-500 px-4 text-white rounded text-sm p-2 mx-4 flex`}
                                        disabled={isAction}
                                    >
                                        {isAction && <div className="mx-4" role="status">
                                            <svg aria-hidden="true" className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-red-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                            </svg>
                                        </div>}
                                        {!isAction ? 'Delete' : ''}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {notification.show && <Notification message={notification.message} error={notification.error} />}
                    {isMultipleStatus && <StatusSelector notification={notification} setNotification={setNotification} Cancel={(s) => { setElementsNewStatus(s); setIsMultipleStatus(false) }} Elements={selectedElements} statusList={Status!} />}
                </>
            )}
        </main>
    );
}
