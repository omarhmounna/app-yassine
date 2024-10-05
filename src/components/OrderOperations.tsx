import { useFormik } from "formik";
import { ArrowLeftIcon, BaselineLocalPhoneIcon, BaselineSmsFailedIcon, BaselineSmsIcon, ClipboardPenIcon, DatabaseBackup, IcBaselineDeliveryDining, OutlineSmsIcon, RoundAllInboxIcon, SharpDeliveryIcon, TrashIcon, WhatsappIcon } from "./Icons";
import { SelectValue } from "./Select/components/type";
import * as Yup from 'yup';
import StatusStyling from "@/utils/StatusStyling";
import { useEffect, useState } from "react";
import { DeliveryNumber, Messaging } from "@/utils/Messaging";
import DeleteOrder from "./DeleteOrder";
import moment from "moment";
import { useSwipeable } from 'react-swipeable';
import axios from "axios";
import { isMobile } from 'react-device-detect';
import { API_Livreur } from "@/utils/API";

export default function OrderOperation({ IsCasa, data, Cities, setData, selectedOrder, setAddObject, setSelectedOrder, setIsAddMode, setIsEditMode, setDuplicatedOrder }) {

    const [ShowDuplicate, setShowDuplicate] = useState(false);
    const [Duplications, setDuplications] = useState<any>([]);
    const [showData, setShowData] = useState<any>([]);
    const [IsDelete, setIsDelete] = useState(false);
    const [isAction, setIsAction] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: "", error: false });
    const [showOptions, setShowOptions] = useState(false); 
    const [showConfirm, setShowConfirm] = useState(false);
    const [originalOrder, setOriginalOrder] = useState(null);

    const Duplicate = () => {
        setShowOptions(true);
    }

    const DemandedeChange = (order) => {
        const updatedOrder = { ...order, status: "Confirmed",price:0,oldOrderId:order.orderId+"" };

        setAddObject(updatedOrder);
        setIsAddMode(true);
        setShowOptions(false);
    };

    const Rembourssement = () => {
        setAddObject({ ...selectedOrder, status: "Rembourssement" });
        setIsAddMode(true);
        setShowOptions(false);
    };

    const SameInfo = () => {
        const duplicatedOrder = { ...selectedOrder, orderId: `${selectedOrder.orderId}`, row: data.length };
        setAddObject(duplicatedOrder);
        setIsAddMode(true);
        setShowOptions(false);
    };

    useEffect(() => {
        if (selectedOrder) {
            setShowData(true);
            if (selectedOrder.isDuplicated) {
                setDuplications(data.filter((v, vi) => v['phoneNumber'] === selectedOrder.phoneNumber && v["row"] !== selectedOrder.row));
            }
        } else {
            setTimeout(() => {
                setShowDuplicate(false);
                setShowData(false);
            }, 200);
        }
    }, [selectedOrder]);

    function isDuplicate(index) {
        let phone = data[index]['phoneNumber'];
        return data.filter(v => v['phoneNumber'] === phone).length > 1;
    }

    const handlers = isMobile ? useSwipeable({
        onSwipedLeft: () => {
            const currentIndex = data.findIndex(order => order.orderId === selectedOrder.orderId);
            if (currentIndex < data.length - 1) {
                setSelectedOrder({ ...data[currentIndex + 1], isDuplicated: isDuplicate(currentIndex + 1) });
            }
        },
        onSwipedRight: () => {
            const currentIndex = data.findIndex(order => order.orderId === selectedOrder.orderId);
            if (currentIndex > 0) {
                setSelectedOrder({ ...data[currentIndex - 1], isDuplicated: isDuplicate(currentIndex - 1) });
            }
        },
        trackMouse: true,
    }) : {};

    const formik = useFormik({
        initialValues: {
            orderId: "",
            Address: "",
            callCenterInfos: "",
            city: null as SelectValue,
            fullName: "",
            isPayed: "",
            orderDate: 1655302097000,
            orderFollowUp: "",
            phoneNumber: "",
            price: 0,
            product: "",
            quantity: 10,
            row: 0,
            source: "",
            status: "",
            upSellProduct: "",
        },
        onSubmit: (values) => {
            // Handle form submission
        }
    });

    const confirmSendLivreur = () => {
        setIsAction(true);
        axios.post(API_Livreur, { ...selectedOrder, operation: 'webhook' }, {
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
        }).then(res => {
            setIsAction(false);
            setNotification({ show: true, message: "Order Has Been Sent Successfully!", error: false });
            console.log(res);
        }).catch(err => {
            setIsAction(false);
            setNotification({ show: true, message: "Failed to Send Order.", error: true });
            console.log(err);
        });
    }

    const SendLivreur = () => {
        setShowConfirm(true);
    }

    return (
        <div {...handlers} style={{ maxHeight: 'var(--portview-height)' }} className={`fixed overscroll-contain flex flex-center flex-col transition-[left] duration-200 z-10 top-0 w-screen bg-white h-dvh ${!selectedOrder ? '-left-full' : 'left-0'}`}>

            <DeleteOrder setSelected={setSelectedOrder} setIsEditMode={setIsEditMode} data={data} setData={setData} setIsDelete={setIsDelete} isDelete={IsDelete} orderId={selectedOrder?.orderId} row={selectedOrder?.row} />
            <div className={`${IsCasa ? 'bg-gradient-to-r from-blue-500 to-green-500' : 'bg-gradient-to-r from-blue-500 to-green-500'} text-white font-semibold p-3 w-full flex items-center`}>
                <button className="p-1 hover:bg-black/15 rounded" onClick={() => { setSelectedOrder(null); setOriginalOrder(null); }}>
                    <ArrowLeftIcon className="h-5 w-5" strokeWidth={3} />
                </button>
                <span>Order Details </span>
                <div className="px-4 flex-1"></div>
                <div className="flex">
                    <button className="p-2 hover:bg-black/15 rounded" onClick={() => setIsEditMode!(true)}>
                        <ClipboardPenIcon className="h-5 w-5" strokeWidth={2} />
                    </button>
                    {!IsCasa && <button className="p-2 hover:bg-black/15 rounded" onClick={() => setIsDelete!(true)}>
                        <TrashIcon className="h-5 w-5" strokeWidth={2} />
                    </button>}
                    <button className="p-2 hover:bg-black/15 rounded" onClick={() => { Duplicate() }}>
                        <DatabaseBackup className="h-5 w-5" strokeWidth={2} />
                    </button>
                    <button className="p-2 hover:bg-black/15 rounded" onClick={() => { SendLivreur() }}>
                        {isAction ? <div className="w-4 h-4 border-4 border-t-3 border-t-green-500 border-gray-200 rounded-full animate-spin"></div> : <IcBaselineDeliveryDining className="h-5 w-5" strokeWidth={2} />}
                    </button>
                </div>
            </div>

            <div className="flex justify-center py-2 w-full bg-white border-b border-b-gray-300">
                <a href={`sms://${selectedOrder?.phoneNumber?.split(' / ')[0]}?body=${Messaging.Voicemail}`} className="flex mx-4">
                    <div className="flex flex-1 flex-col items-center">
                        <OutlineSmsIcon className="h-6 w-6 text-sky-700" />
                        <span className="flex justify-center items-center text-center text-[0.65rem] ">Boite Vocale</span>
                    </div>
                </a>
                <a href={`sms://${selectedOrder?.phoneNumber?.split(' / ')[0]}?body=${Messaging.NoResponse}`} className=" flex mx-4">
                    <div className="flex flex-1 flex-col items-center">
                        <BaselineSmsFailedIcon className="h-6 w-6 text-yellow-800" />
                        <span className="flex justify-center items-center text-center text-[0.65rem] ">Pas de Rep+Sms</span>
                    </div>
                </a>
                <a href={`sms://${selectedOrder?.phoneNumber?.split(' / ')[0]}?body=${Messaging.Followup}`} className=" flex mx-4">
                    <div className="flex flex-1 flex-col items-center">
                        <BaselineSmsIcon className="h-6 w-6 text-sky-700" />
                        <span className="flex justify-center items-center text-center text-[0.65rem]">Suivi SMS</span>
                    </div>
                </a>
                <a href={`whatsapp://send?phone=${DeliveryNumber}&text=${encodeURIComponent(Messaging.Delivery(selectedOrder!))}`} className=" flex mx-4">
                    <div className="flex flex-1 flex-col items-center">
                        <SharpDeliveryIcon className="h-6 w-6 text-orange-700" />
                        <span className="flex justify-center items-center text-center text-[0.65rem]">Send Livreur</span>
                    </div>
                </a>
            </div>

            <div className={`relative flex flex-1 flex-col bg-white ${ShowDuplicate ? 'overflow-hidden' : 'overflow-y-scroll overscroll-contain'} md:scroll`}>
                {showData && <><div className="relative flex w-full flex-col p-4">

                    {ShowDuplicate && <div onClick={() => setShowDuplicate(false)} className="absolute flex flex-1 z-10 bg-black/10 top-0 left-0 w-full h-full"></div>}
                    {/* Order Id */}
                    <div className={`flex flex-col pb-4 `}>
                        <span className="text-xs text-black font-semibold">Order ID</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 pb-0 px-4 text-orange-500 font-semibold">{selectedOrder?.orderId}</span>
                        </div>
                    </div>

                    {/* orderDate */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Order date</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4">{moment.unix(selectedOrder?.orderDate).format("DD/MM/yyyy HH:mm")}</span>
                        </div>
                    </div>
                    {/* fullName */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Name</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4 ">{selectedOrder?.fullName}</span>
                        </div>
                    </div>

                    {/* phoneNumber */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Phone number</span>
                        {selectedOrder?.phoneNumber?.split(' / ').map((phone, i) => <div key={`kp-` + i} className="w-full flex items-center pt-2">
                            <span className={`text-sm p-2 px-4 ${selectedOrder?.isDuplicated ? 'text-red-600 font-semibold' : ''}`}>{phone}</span>
                            <div className="flex flex-1"></div>
                            <div className="flex justify-center bg-white">
                                <a href={`whatsapp://send?phone=212${phone.substring(1)}`} className="flex mx-2 p-2">
                                    <div className="flex flex-col items-center">
                                        <WhatsappIcon className="text-green-600 h-6 w-6" />
                                    </div>
                                </a>
                                <a href={`tel://${phone}`} className="flex mx-2 p-2">
                                    <div className="flex flex-1 flex-col items-center">
                                        <BaselineLocalPhoneIcon className="h-6 w-6 text-green-700" />
                                    </div>
                                </a>
                                <a href={`sms://${phone}`} className="flex mx-2 p-2">
                                    <div className="flex flex-1 flex-col items-center">
                                        <BaselineSmsIcon className="h-6 w-6 text-sky-700" />
                                    </div>
                                </a>
                            </div>
                        </div>)}
                    </div>

                    {/* address */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Address</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4">{selectedOrder?.Address}</span>
                        </div>
                    </div>

                    {/* city */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">City</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4">{selectedOrder?.city} {Cities.includes(selectedOrder?.city) ? "" : "⛔"}</span>
                        </div>
                    </div>

                    {/* product */}
                    {selectedOrder?.product.length != 0 && <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Product</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4">{selectedOrder?.product}</span>
                        </div>
                    </div>}

                    {/* upsell */}
                    {selectedOrder?.upSellProduct.length != 0 && <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">UpSell Product</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4">{selectedOrder?.upSellProduct}</span>
                        </div>
                    </div>}

                    {/* quantity */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Quantity</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4">{selectedOrder?.quantity}</span>
                        </div>
                    </div>

                    {/* price */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Price</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4 text-blue-700 font-semibold">{parseFloat(selectedOrder?.price).toFixed(2)} DH</span>
                        </div>
                    </div>

                    {/* source */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Source</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4">{selectedOrder?.source}</span>
                        </div>
                    </div>

                    {/* status */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Status</span>
                        <div className="w-full flex">
                            <span className={`text-sm p-2 px-4 font-semibold`} style={{ color: StatusStyling[selectedOrder?.status] }}>{selectedOrder?.status}</span>
                        </div>
                    </div>

                    {/* callCenterInfos */}
                    {selectedOrder?.callCenterInfos.length != 0 && <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold pb-4">Call center infos</span>
                        <div className="chat-history border border-gray-200 rounded-lg bg-gray-50 p-2 mb-4">
                            {selectedOrder?.callCenterInfos.split('\n').map((note, index) => (
                                <div>{note.length != 0 && <div key={index} className="mb-2 flex">
                                    <div className="bg-white p-2 rounded-lg shadow-md w-full">
                                        <p className="text-xs text-gray-800">{note}</p>
                                    </div>
                                </div>}
                                </div>
                            ))}
                        </div>
                    </div>}

                    {/* ispayed */}
                    {selectedOrder?.isPayed.length != 0 && <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Is payed</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4">{selectedOrder?.isPayed}</span>
                        </div>
                    </div>}

                    {/* orderFollowUp */}
                    {selectedOrder?.orderFollowUp.length != 0 && (
                        <div className="flex flex-col pb-4">
                            <span className="text-xs text-black font-semibold pb-4">Order follow-up</span>
                            <div className="chat-history border border-gray-200 rounded-lg bg-gray-50 p-2 mb-4">
                                {selectedOrder?.orderFollowUp.split('\n').map((note, index) => (
                                    <div>{note.length != 0 && <div key={index} className="mb-2 flex">
                                        <div className="bg-white p-2 rounded-lg shadow-md w-full">
                                            <p className="text-xs text-gray-800">{note}</p>
                                        </div>
                                    </div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                </>}
            </div>
            <div className="flex w-full flex-col">
                <button className={`w-full text-white ${selectedOrder?.isDuplicated ? (IsCasa ? 'bg-gradient-to-r from-blue-500 to-green-500' : 'bg-gradient-to-r from-blue-500 to-green-500') : (IsCasa ? 'bg-gradient-to-r from-blue-500 to-green-500' : 'bg-gradient-to-r from-blue-500 to-green-500')} p-1`}
                    onClick={() => {
                        if (!selectedOrder.isDuplicated) {
                            setSelectedOrder(null)
                        } else {
                            setShowDuplicate(!ShowDuplicate);
                        }
                    }}>
                    <div className="flex flex-col items-center justify-center">
                        <RoundAllInboxIcon className="h-6 w-6" />
                        <span className="p-1 text-xs">{selectedOrder?.isDuplicated ? `Duplications (${Duplications.length})` : 'Orders'}</span>
                    </div>
                </button>
                <div className={`flex flex-col transition-all duration-200 ${ShowDuplicate ? 'max-h-[400px] overflow-y-auto overscroll-contain' : 'max-h-0 overflow-hidden'} md:scroll`}>
                    {/* Duplications List */}
                    {Duplications.map((d, i) => {
                        const origOrder = data.find(order => order.phoneNumber === d.phoneNumber && order.row !== d.row);
                        return (
                            <div onClick={() => {
                                setDuplicatedOrder({ ...d, isDuplicated: true });
                                setOriginalOrder(origOrder); // تعيين الطلب الأصلي عند تحديد التكرار
                            }} key={`d-${i}`} className={`flex flex-col rounded border border-gray-400 bg-white m-4 ${(i != Duplications.length - 1 && Duplications.length != 1) ? 'mb-0' : ''} p-4`}>

                                <div className="flex flex-col ">
                                    <span className="text-xs text-black font-semibold">Order ID</span>
                                    <div className="w-full flex">
                                        <span className="text-sm p-2 pb-0 px-4 text-orange-500 font-semibold">{d?.orderId}</span>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>

            {notification.show && (
                <div style={{ maxHeight: 'var(--portview-height)' }} className={`fixed overscroll-contain justify-center items-center flex flex-col transition-[left] duration-200 z-10 top-0 w-screen bg-black/15 h-dvh`} onClick={() => { setNotification({ ...notification, show: false }) }}>
                    <div className="overflow-hidden flex flex-col max-w-[80%] w-96 rounded bg-white" onClick={(e) => { e.stopPropagation(); e.preventDefault() }}>
                        <div className={`${notification.error ? 'bg-red-500' : 'bg-green-500'} text-white font-semibold text-sm p-4`}>
                            {notification.error ? 'Error' : 'Success'}
                        </div>
                        <div className={`p-4 pb-2 px-8 text-smbold ${notification.error ? 'text-red-500' : 'text-black'}`}>
                            {notification.message}
                        </div>
                        <div className="p-4 flex items-center justify-end">
                            <button
                                onClick={() => setNotification({ ...notification, show: false })}
                                className="text-sm p-2 px-4 mx-4 border rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

{showOptions && (
  <div 
    style={{ maxHeight: 'var(--portview-height)' }} 
    className="fixed overscroll-contain flex justify-center items-center transition-[left] duration-200 z-10 top-0 w-screen bg-black/15 h-dvh"
    onClick={() => { setShowOptions(false) }}
  >
    <div 
      className="overflow-hidden flex flex-col w-full max-w-[95%] sm:max-w-[80%] md:max-w-[60%] lg:max-w-[40%] rounded bg-white"
      onClick={(e) => { e.stopPropagation(); e.preventDefault() }}
    >
      <div className="bg-blue-500 text-white font-semibold text-sm p-4">
        Choose the action you want.
      </div>
      <div className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end">
        <button 
          className="text-sm p-2 px-4 m-2 border rounded font-semibold flex-grow"
          onClick={() => DemandedeChange(selectedOrder)}
        >
          Change
        </button>
        <button 
          className="text-sm p-2 px-4 m-2 border rounded font-semibold flex-grow"
          onClick={Rembourssement}
        >
          Rembourssement
        </button>
        <button 
          className="text-sm p-2 px-4 m-2 border rounded font-semibold flex-grow"
          onClick={SameInfo}
        >
          Same info
        </button>
      </div>
    </div>
  </div>
)}

            {showConfirm && (
                <div style={{maxHeight:'var(--portview-height)'}} className={`fixed overscroll-contain justify-center items-center flex flex-col transition-[left] duration-200 z-10 top-0 w-screen bg-black/15 h-dvh `} onClick={()=>{setShowConfirm(false)}}>
                    <div className=" overflow-hidden flex flex-col max-w-[80%] w-96  rounded bg-white" onClick={(e)=>{e.stopPropagation();e.preventDefault()}}>
                        <div className="bg-green-500 text-white font-semibold text-sm p-4">
                            Confirm Send Order?
                        </div>
                        <div className={`p-4 pb-2 px-8 text-sm`}>Do you really want to send this order?</div>
                        <div className="p-4 flex items-center justify-end">
                            <button onClick={()=>setShowConfirm(false)} className=" text-sm p-2 px-4 mx-4 border rounded "  disabled={isAction}>Cancel</button>
                            <button 
                                onClick={
                                    (e)=>{
                                        e.preventDefault() 
                                        setIsAction(true);
                                        confirmSendLivreur();
                                        setShowConfirm(false);
                                    }} 
                                className={`bg-green-500 px-4 text-white rounded text-sm  p-2 mx-4 flex`} disabled={isAction}
                                >
                                    {isAction && <div className="mx-4" role="status">
                                        <svg aria-hidden="true" className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-green-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                        </svg>
                                    </div>}
                                    {!isAction ? 'Send' : ''}
                                </button>    
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
