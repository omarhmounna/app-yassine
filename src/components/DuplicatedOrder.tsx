"use client"
import { ArrowLeftIcon, InfoIcon } from "./Icons";
import StatusStyling from "@/utils/StatusStyling";
import moment from "moment";

export default function DuplicatedOrder({ IsCasa, duplicatedOrder, setDuplicatedOrder, selectedOrder }) {
    return (
        <div style={{ maxHeight: 'var(--portview-height)' }} className={`fixed overscroll-contain overflow-hidden flex flex-col transition-[left] duration-200 z-20 top-0 w-screen bg-white h-dvh ${!duplicatedOrder ? '-left-full' : 'left-0'}`}>
            <div className={`${IsCasa ? 'bg-gradient-to-r from-blue-500 to-green-500' : 'bg-gradient-to-r from-blue-500 to-green-500'} text-white font-semibold p-2 w-full flex items-center`}>
                <button className="p-3 hover:bg-black/15 rounded" onClick={() => { setDuplicatedOrder(null) }}>
                    <ArrowLeftIcon className="h-5 w-5" strokeWidth={3} />
                </button>
                <span>Duplicated order infos</span>
                <div className="px-4 flex-1"></div>
                <div className="flex"></div>
            </div>

            <div className={`relative flex flex-1 flex-col bg-white overscroll-contain overflow-y-scroll md:scroll`}>
                <div className="relative flex w-full flex-col p-4">
                    {/* Order Id */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Order ID</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4 text-orange-500 font-semibold">{duplicatedOrder?.orderId}</span>
                        </div>
                    </div>
                    {/* orderDate */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Order date</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4 ">{moment.unix(duplicatedOrder?.orderDate).format("DD/MM/yyyy HH:mm")}</span>
                        </div>
                    </div>
                    {/* fullName */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Name</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4 ">{duplicatedOrder?.fullName}</span>
                        </div>
                    </div>

                    {/* phoneNumber */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Phone number</span>
                        <div className="w-full flex items-center pt-2">
                            <span className={`text-sm p-2 px-4 ${duplicatedOrder?.isDuplicated ? 'text-red-600 font-semibold' : ''}`}>{duplicatedOrder?.phoneNumber?.split(' / ')[0]}</span>
                        </div>
                        {duplicatedOrder?.phoneNumber.split(' / ').length > 1 && <div className="w-full flex items-center pt-2">
                            <span className={`text-sm p-2 px-4 ${duplicatedOrder?.isDuplicated ? 'text-red-600 font-semibold' : ''}`}>{duplicatedOrder?.phoneNumber?.split(' / ')[1]}</span>
                        </div>}
                    </div>

                    {/* address */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Address</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4">{duplicatedOrder?.Address}</span>
                        </div>
                    </div>

                    {/* city */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">City</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4">{duplicatedOrder?.city}</span>
                        </div>
                    </div>

                    {/* product */}
                    {duplicatedOrder?.product.length !== 0 && <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Product</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4">{duplicatedOrder?.product}</span>
                        </div>
                    </div>}

                    {/* upsell */}
                    {duplicatedOrder?.upSellProduct.length !== 0 && <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">UpSell Product</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4">{duplicatedOrder?.upSellProduct}</span>
                        </div>
                    </div>}

                    {/* quantity */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Quantity</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4">{duplicatedOrder?.quantity}</span>
                        </div>
                    </div>

                    {/* price */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Price</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4 text-blue-700 font-semibold">{parseFloat(duplicatedOrder?.price).toFixed(2)} DH</span>
                        </div>
                    </div>

                    {/* source */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Source</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4">{duplicatedOrder?.source}</span>
                        </div>
                    </div>

                    {/* status */}
                    <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Status</span>
                        <div className="w-full flex">
                            <span className={`text-sm p-2 px-4 font-semibold`} style={{ color: StatusStyling[duplicatedOrder?.status] }}>{duplicatedOrder?.status}</span>
                        </div>
                    </div>

                    {/* callCenterInfos */}
                    {duplicatedOrder?.callCenterInfos.length !== 0 && <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold pb-4">Call center infos</span>
                        <div className="chat-history border border-gray-200 rounded-lg bg-gray-50 p-2 mb-4">
                            {duplicatedOrder?.callCenterInfos.split('\n').map((note, index) => (
                                <div key={index} className="mb-2 flex">
                                    <div className="bg-white p-2 rounded-lg shadow-md w-full">
                                        <p className="text-xs text-gray-800">{note}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>}
                    {/* ispayed */}
                    {duplicatedOrder?.isPayed.length !== 0 && <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold">Is payed</span>
                        <div className="w-full flex">
                            <span className="text-sm p-2 px-4">{duplicatedOrder?.isPayed}</span>
                        </div>
                    </div>}
                    {/* orderFollowUp */}
                    {duplicatedOrder?.orderFollowUp.length !== 0 && <div className="flex flex-col pb-4">
                        <span className="text-xs text-black font-semibold pb-4">Order follow-up</span>
                        <div className="chat-history border border-gray-200 rounded-lg bg-gray-50 p-2 mb-4">
                            {duplicatedOrder?.orderFollowUp.split('\n').map((note, index) => (
                                <div key={index} className="mb-2 flex">
                                    <div className="bg-white p-2 rounded-lg shadow-md w-full">
                                        <p className="text-xs text-gray-800">{note}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>}
                </div>
            </div>

            <div className="flex w-full flex-col">
                <button className={`w-full text-white bg-gradient-to-r from-blue-500 to-green-500 p-1`}
                    onClick={() => {
                        setDuplicatedOrder(null)
                    }}>
                    <div className="flex items-center justify-center">
                        <InfoIcon className="h-6 w-6" strokeWidth={2} />
                        <span className="p-1 text-xs mx-2">Duplicate of order: {selectedOrder?.orderId}</span>
                    </div>
                </button>
            </div>
        </div>
    )
}
