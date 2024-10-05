import { useFormik } from "formik";
import { ArrowLeftIcon, RoundAllInboxIcon } from "./Icons";
import { SelectValue, Option } from "./Select/components/type";
import * as Yup from 'yup';
import { useEffect, useState } from "react";
import Select from "./Select";
import NumericInput from "./NumericInput";
import MobileNativeDateTimePicker from "./MobileNativeDateTimePicker";
import moment from "moment";
import SelectableShips from "./SelectableShips";
import axios from "axios";
import { API } from "@/utils/API";
import OperationLoading from "./OperationLoading";
import Options from "./Select/components/Options";

export default function OrderEdit({ IsCasa, data, setData, IsPayed, setIsPayed, Sources, setSources, Status, setStatus, Products, setProducts, Cities, setCities, selectedOrder, isEditMode, setSelectedOrder, setIsEditMode }) {

    const [Duplications, setDuplications] = useState<any>([]);
    const [ComponentLoaded, setComponentLoaded] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [ComponentShowed, setComponentShowed] = useState(false);
    const [Processing, setProcessing] = useState(false);
    const [Error, setError] = useState<any>(null);
    const [showOldNotes, setShowOldNotes] = useState(false);

    useEffect(() => {
        setComponentLoaded(true)
    }, [])

    useEffect(() => {
        if (selectedOrder) {
            if (selectedOrder.isDuplicated) {
                setDuplications(data.filter((v, vi) => v['phoneNumber'] == selectedOrder.phoneNumber && v["row"] != selectedOrder.row))
            }
        }
    }, [selectedOrder])

    useEffect(() => {
        if (!ComponentLoaded && ComponentShowed) {
            setTimeout(() => {
                setIsEditMode(false)
            }, 200)
        } else {
            setComponentShowed(true)
        }
    }, [ComponentLoaded])

    const getSelectValueForMultiple = (value) => {
        try {
            if (value?.length == 0 || !value) return [];
            return [...(value?.split(' + ').map((v, i) => { return { value: v, label: v } }))]
        } catch (e) {
            return []
        }
    }

    const formik = useFormik({
        initialValues: {
            row: selectedOrder?.row as number,
            orderId: selectedOrder?.orderId as string,
            Address: selectedOrder?.Address as string,
            callCenterInfos: selectedOrder?.callCenterInfos as string,
            newNote: '',
            city: { value: selectedOrder?.city, label: selectedOrder?.city } as SelectValue,
            fullName: selectedOrder?.fullName as string,
            isPayed: selectedOrder?.isPayed as string,
            orderDate: selectedOrder?.orderDate as number,
            orderFollowUp: selectedOrder?.orderFollowUp as string,
            newOrderFollowUpNote: '',
            phoneNumber: selectedOrder?.phoneNumber as string,
            price: parseFloat(selectedOrder?.price),
            product: getSelectValueForMultiple(selectedOrder?.product) as SelectValue,
            quantity: parseInt(selectedOrder?.quantity),
            source: { value: selectedOrder?.source, label: selectedOrder?.source } as SelectValue,
            status: { value: selectedOrder?.status, label: selectedOrder?.status } as SelectValue,
            upSellProduct: getSelectValueForMultiple(selectedOrder?.upSellProduct) as SelectValue,
        },

        validationSchema: Yup.object({
            orderId: Yup.string().required("field required"),
            orderDate: Yup.number().required("field required"),
            fullName: Yup.string().required("field required"),
            phoneNumber: Yup.string().required("field required").matches(/^((\s*)0[0-9]{9}(\s*))(\/((\s*)0[0-9]{9}(\s*)))*$/, 'incorrect phone format'),
            city: Yup.object().required("field required"),
            product: Yup.array<any>().required("field required"),
            quantity: Yup.number().required("field required"),
            price: Yup.number().required("field required"),
            source: Yup.object().required("field required"),
            status: Yup.object().required("field required"),
            newNote: Yup.string().nullable(),
            newOrderFollowUpNote: Yup.string().nullable(),
        }),

        onSubmit: async (values) => {
            await formik.validateForm();
            if (formik.isValid) {
                if (Cities.includes((formik.values?.city as Option).value)){
                    Operation()
                }else{
                    setShowAlert(true)
                }
                
            }
        }

    });

    const getListOptions = (list) => list!.map((p) => {
        return {
            label: p,
            value: p
        }
    }
    )

    const Operation = () => {
        setProcessing(true);
        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        let newCallCenterInfos = formik.values.callCenterInfos;
        if (formik.values.newNote.trim()) {
            newCallCenterInfos += `\n${formik.values.newNote} - ${currentDate}`;
        }
        
        let newOrderFollowUp = formik.values.orderFollowUp;
        if (formik.values.newOrderFollowUpNote.trim()) {
            newOrderFollowUp += `\n${formik.values.newOrderFollowUpNote} - ${currentDate}`;
        }

        let rdata = {
            ...formik.values,
            callCenterInfos: newCallCenterInfos,
            orderFollowUp: newOrderFollowUp,
            city: (formik.values.city! as Option).value,
            product: (formik.values.product! as Option[]).map(e => e.value).join(" + "),
            upSellProduct: formik.values.upSellProduct ?(formik.values.upSellProduct! as Option[]).map(e => e.value).join(" + "):"",
            source: (formik.values.source! as Option).value,
            status: (formik.values.status! as Option).value,
            address: formik.values.Address,
            orderDate: moment.unix(formik.values.orderDate).format("yyyy-MM-DD HH:mm:ss") as any,
            oldOrderId: selectedOrder.orderId
        } as any;
        if (IsCasa) {
            rdata = { ...rdata, isCasa: true };
        }
        axios.post(API,
            {
                operation: 'edit',
                ...rdata
            }
            , {
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                }
            }).then(res => {
                setProcessing(false)
                rdata = { ...rdata, orderDate: formik.values.orderDate, isDuplicated: data.filter(d => d.phoneNumber == rdata.phoneNumber).length > (selectedOrder.phoneNumber == rdata.phoneNumber ? 1 : 0) }; // 0 for data not being updated yet
                if (res.data.isCasa) {
                    if (IsCasa) {
                        setData(data.map(e => e.orderId == selectedOrder.orderId ? rdata : e))
                    }
                    else {
                        setData(data.filter(e => e.orderId != selectedOrder.orderId))
                    }
                } else {
                    if (IsCasa) {
                        setData(data.filter(e => e.orderId != selectedOrder.orderId))
                    }
                    else {
                        setData(data.map(e => e.orderId == selectedOrder.orderId ? rdata : e))
                    }
                }
                setIsEditMode(false)
                setSelectedOrder(null)
            })
            .catch(e => {
                console.log(e);
                setProcessing(false)
                setError('Error while processing.');
            })
    }

    const Retry = () => Operation()

    return (
        <div style={{ height: '100vh' }} className={`fixed transition-[left] flex flex-col w-screen bg-gradient-to-r from-blue-500 to-green-500 shadow-lg overscroll-contain duration-200 z-10 top-0 ${!ComponentLoaded ? '-left-full' : 'left-0'}`}>
            {
            showAlert && (
                <div
                    style={{ maxHeight: 'var(--portview-height)' }}
                    className={`fixed overscroll-contain justify-center items-center flex flex-col transition-[left] duration-200 z-10 top-0 w-screen bg-black/15 h-dvh`}
                    onClick={() => setShowAlert(false)}
                >
                    <div
                        className="overflow-hidden flex flex-col max-w-[80%] w-96 rounded bg-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                    >
                        <div className="bg-red-500 text-white font-semibold text-sm p-4">
                            Incorrect City
                        </div>
                        <div className={`p-4 pb-2 px-8 text-sm`}>
                        This City is Not Allowed List. please Correct City.
                        </div>
                        <div className="p-4 flex items-center justify-end">
                            <button
                                onClick={() => setShowAlert(false)}
                                className="text-sm p-2 px-4 mx-4 border rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
            <OperationLoading Error={Error} Retry={Retry} isProcessing={Processing} />
            <div className={`${IsCasa ? 'bg-gradient-to-r from-blue-500 to-green-500' : 'bg-gradient-to-r from-blue-500 to-green-500 shadow-lg'} touch-none text-white font-semibold p-2 w-full flex items-center`}>
                <button className="p-3 hover:bg-black/15 rounded" onClick={() => { setComponentLoaded(false) }}>
                    <ArrowLeftIcon className="h-5 w-5" strokeWidth={3} />
                </button>
                <span>Order Edit #{selectedOrder?.orderId}</span>
                <div className="px-4 flex-1"></div>
                <div className="flex"></div>
            </div>
            <div className="relative flex flex-1 flex-col bg-white overflow-y-scroll">
                <div className="relative flex w-full flex-col p-4">
                    {/* Grouped inputs */}
                    <div className="flex flex-col md:flex-row md:space-x-4">
                        {/* Order ID */}
                        <div className="flex-1 flex flex-col pb-4">
                            <span className="flex justify-between text-xs text-black font-semibold">
                                <i>Order ID</i>
                                <i className="text-red-500 text-xs font-normal">{formik.touched.orderId ? formik.errors.orderId : ''}</i>
                            </span>
                            <input className="mt-1 text-sm p-2 border border-gray-200 rounded w-full" name='orderId' id='orderId' value={formik.values.orderId} onBlur={formik.handleBlur} onChange={formik.handleChange} type="search" />
                        </div>
                        {/* date */}
                        <div className="flex-1 flex flex-col pb-4">
                            <span className="flex justify-between text-xs text-black font-semibold">
                                <i>Order date</i>
                                <i className="text-red-500 text-xs font-normal">{formik.touched.orderDate ? formik.errors.orderDate : ''}</i>
                            </span>
                            <MobileNativeDateTimePicker
                                onBlur={formik.handleBlur}
                                onChange={(v) => { if (v.target.value != "") { formik.setFieldValue('orderDate', moment(v.target.value).unix()) } }}
                                id="orderDate"
                                name="orderDate"
                                inputClass="datepicker-input"
                                viewClass=" bg-white mt-1 text-sm p-2 border border-gray-200 rounded w-full"
                                format="yyyy-MM-ddThh:mm"
                                value={formik.values.orderDate}
                            />
                        </div>
                        {/* fullName */}
                        <div className="flex-1 flex flex-col pb-4">
                            <span className="flex justify-between text-xs text-black font-semibold">
                                <i>Name</i>
                                <i className="text-red-500 text-xs font-normal">{formik.touched.fullName ? formik.errors.fullName : ''}</i>
                            </span>
                            <input className="mt-1 text-sm p-2 border border-gray-200 rounded w-full" name='fullName' id='fullName' value={formik.values.fullName} onBlur={formik.handleBlur} onChange={formik.handleChange} type="search" />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:space-x-4">
                        {/* phoneNumber */}
                        <div className="flex-1 flex flex-col pb-4">
                            <span className="flex justify-between text-xs text-black font-semibold">
                                <i>Phone</i>
                                <i className="text-red-500 text-xs font-normal">{formik.touched.phoneNumber ? formik.errors.phoneNumber : ''}</i>
                            </span>
                            <input className="mt-1 text-sm p-2 border border-gray-200 rounded w-full" name='phoneNumber' id='phoneNumber' value={formik.values.phoneNumber} onBlur={formik.handleBlur} onChange={formik.handleChange} type="search" />
                        </div>
                        {/* address */}
                        <div className="flex-1 flex flex-col pb-4">
                            <span className="flex justify-between text-xs text-black font-semibold">
                                <i>Address</i>
                                <i className="text-red-500 text-xs font-normal">{formik.touched.Address ? formik.errors.Address : ''}</i>
                            </span>
                            <textarea spellCheck="false" className="mt-1 text-sm p-2 border border-gray-200 rounded w-full" name='Address' id='Address' value={formik.values.Address} onBlur={formik.handleBlur} onChange={formik.handleChange} rows={Math.max(formik.values.Address?.split('\n').length, 3)}></textarea>
                        </div>
                        {/* city */}
                        <div className="flex-1 flex flex-col pb-4">
                            <span className="flex justify-between text-xs text-black font-semibold">
                                <i>City</i>
                                <i className="text-red-500 text-sm font-normal">{formik.touched.city ? formik.errors.city : ''}</i>
                            </span>
                            <Select
                                accentClass={'bg-green-700 text-white'}
                                addToOptions={(option) => { setCities!([...Cities!, option.value]) }}
                                selectClass={` text-black text-xs ${Cities.includes(selectedOrder?.city) ? '' : 'border-2 border-red-500'}`}
                                selecetedLabelClass=" text-black text-sm"
                                containerClass="mt-1"
                                title="Select a city"
                                isSearchable={true}
                                classNames={{ searchContainer: 'relative pb-4 lg:p-2', listItemClass: ' text-black text-sm', searchBox: ' w-full py-2 pl-8 bg-gray-100 border border-gray-200 rounded focus:border-gray-200 focus:ring-0 focus:outline-nonetext-black text-xs ' }}
                                isMultiple={false}
                                options={getListOptions(Cities)}
                                onChange={(v) => { formik.setFieldValue('city', v) }}
                                value={formik.values.city}
                                primaryColor="neutral"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:space-x-4">
                        {/* product */}
                        <div className="flex-1 flex flex-col pb-4">
                            <span className="flex justify-between text-xs text-black font-semibold">
                                <i>Product</i>
                                <i className="text-red-500 text-xs font-normal">{formik.touched.product ? formik.errors.product : ''}</i>
                            </span>
                            <Select
                                accentClass={'bg-green-700 text-white'}
                                addToOptions={(option) => { setProducts!([...Products!, option.value]) }}
                                selectClass=" text-black text-sm"
                                selecetedLabelClass=" text-black text-sm"
                                containerClass="mt-1"
                                title="Select products"
                                isSearchable={true}
                                classNames={{ searchContainer: 'relative pb-4 lg:p-2', listItemClass: ' text-black text-sm', searchBox: ' w-full py-2 pl-8 bg-gray-100 border border-gray-200 rounded focus:border-gray-200 focus:ring-0 focus:outline-nonetext-black text-xs ' }}
                                isMultiple={true}
                                options={getListOptions(Products)}
                                onChange={(v) => { formik.setFieldValue('product', v) }}
                                value={formik.values.product}
                                primaryColor="neutral"
                            />
                        </div>
                        {/* upSellProduct */}
                        <div className="flex-1 flex flex-col pb-4">
                            <span className="flex justify-between text-xs text-black font-semibold">
                                <i>UpSell product</i>
                                <i className="text-red-500 text-xs font-normal">{formik.touched.upSellProduct ? formik.errors.upSellProduct : ''}</i>
                            </span>
                            <Select
                                accentClass={'bg-green-700 text-white'}
                                addToOptions={(option) => { setProducts!([...Products!, option.value]) }}
                                selectClass=" text-black text-sm"
                                selecetedLabelClass=" text-black text-sm"
                                containerClass="mt-1"
                                title="Select up-sell products"
                                isSearchable={true}
                                classNames={{ searchContainer: 'relative pb-4 lg:p-2', listItemClass: ' text-black text-sm', searchBox: ' w-full py-2 pl-8 bg-gray-100 border border-gray-200 rounded focus:border-gray-200 focus:ring-0 focus:outline-nonetext-black text-xs ' }}
                                isMultiple={true}
                                options={getListOptions(Products)}
                                onChange={(v) => { formik.setFieldValue('upSellProduct', v) }}
                                value={formik.values.upSellProduct}
                                primaryColor="neutral"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:space-x-4">
                        {/* Quantity */}
                        <div className="flex-1 flex flex-col pb-4">
                            <span className="flex mb-1 justify-between text-xs text-black font-semibold">
                                <i>Quantity</i>
                                <i className="text-red-500 text-xs font-normal">{formik.touched.quantity ? formik.errors.quantity : ''}</i>
                            </span>
                            <NumericInput
                                setValue={(v) => formik.setFieldValue('quantity', v)}
                                inputClass="text-sm p-2 rounded-none border border-gray-200 rounded w-full"
                                plusClass=" w-5 mx-2 h-5 text-sm text-gray-700 stroke-2"
                                plusContainer="border p-2 border-l-0 border-gray-200 rounded-r h-full"
                                minusClass="  w-5 mx-2 h-5 text-sm text-gray-700 stroke-2"
                                minusContainer="border p-2  border-r-0 border-gray-200 rounded-l  h-full"
                                name='quantity' id='quantity' value={formik.values.quantity} onBlur={formik.handleBlur} onChange={formik.handleChange}
                            />
                        </div>
                        {/* Price */}
                        <div className="flex-1 flex flex-col pb-4">
                            <span className="flex mb-1 justify-between text-xs text-black font-semibold">
                                <i>Price</i>
                                <i className="text-red-500 text-xs font-normal">{formik.touched.price ? formik.errors.price : ''}</i>
                            </span>
                            <NumericInput
                                setValue={(v) => formik.setFieldValue('price', v)}
                                inputClass="text-sm p-2 rounded-none border border-gray-200 rounded w-full"
                                plusClass=" w-5 mx-2 h-5 text-sm text-gray-700 stroke-2"
                                plusContainer="border p-2 border-l-0 border-gray-200 rounded-r h-full"
                                minusClass="  w-5 mx-2 h-5 text-sm text-gray-700 stroke-2"
                                minusContainer="border p-2 border-r-0 border-gray-200 rounded-l  h-full"
                                name='price' id='price' value={formik.values.price} onBlur={formik.handleBlur} onChange={formik.handleChange}
                            />
                        </div>
                        {/* Source */}
                        <div className="flex-1 flex flex-col pb-4">
                            <span className="flex justify-between text-xs text-black font-semibold">
                                <i>Source</i>
                                <i className="text-red-500 text-xs font-normal">{formik.touched.source ? formik.errors.source : ''}</i>
                            </span>
                            <Select
                                accentClass={'bg-green-700 text-white'}
                                addToOptions={(option) => { setSources!([...Sources!, option.value]) }}
                                selectClass=" text-black text-sm"
                                selecetedLabelClass=" text-black text-sm"
                                containerClass="mt-1"
                                title="Select source"
                                isSearchable={true}
                                classNames={{ searchContainer: 'relative pb-4 lg:p-2', listItemClass: ' text-black text-sm', searchBox: ' w-full py-2 pl-8 bg-gray-100 border border-gray-200 rounded focus:border-gray-200 focus:ring-0 focus:outline-nonetext-black text-xs ' }}
                                isMultiple={false}
                                options={getListOptions(Sources)}
                                onChange={(v) => { formik.setFieldValue('source', v) }}
                                value={formik.values.source}
                                primaryColor="neutral"
                            />
                        </div>
                        {/* Status */}
                        <div className="flex-1 flex flex-col pb-4">
                            <span className="flex justify-between text-xs text-black font-semibold">
                                <i>Status</i>
                                <i className="text-red-500 text-xs font-normal">{formik.touched.status ? formik.errors.status : ''}</i>
                            </span>
                            <Select
                                accentClass={'bg-green-700 text-white'}
                                addToOptions={(option) => { setStatus!([...Status!, option.value]) }}
                                selectClass=" text-black text-sm"
                                selecetedLabelClass=" text-black text-sm"
                                containerClass="mt-1"
                                title="Select status"
                                isSearchable={true}
                                classNames={{ searchContainer: 'relative pb-4 lg:p-2', listItemClass: ' text-black text-sm', searchBox: ' w-full py-2 pl-8 bg-gray-100 border border-gray-200 rounded focus:border-gray-200 focus:ring-0 focus:outline-nonetext-black text-xs ' }}
                                isMultiple={false}
                                options={getListOptions(Status)}
                                onChange={(v) => { formik.setFieldValue('status', v) }}
                                value={formik.values.status}
                                primaryColor="neutral"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:space-x-4">
                        {/* callcenter Info */}
                        <div className="flex-1 flex flex-col pb-4">
                            <span className="flex justify-between text-xs text-black font-semibold pb-4">
                                <i>Call center infos</i>
                            </span>
                            <div className="flex flex-col rounded-lg bg-gray-100">
                                <div className="chat-history p-2">
                                    {formik.values.callCenterInfos.split('\n').map((note, index) => (
                                       <div>{note.length!=0 && <div key={index} className="mb-2">
                                            <p className="text-sm bg-white p-2 rounded">{note}</p>
                                        </div>}
                                        </div>
                                    ))}
                                </div>

                                <div className="p-2">
                                    <textarea
                                        spellCheck="false"
                                        className="mt-1 text-sm p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        name='newNote'
                                        id='newNote'
                                        value={formik.values.newNote}
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        rows={3}
                                        placeholder="Enter new note here..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        {/* isPayed */}
                        <div className="flex-1 flex flex-col pb-4">
                            <span className="flex justify-between text-xs text-black font-semibold">
                                <i>Is payed?</i>
                                <i className="text-red-500 text-xs font-normal">{formik.touched.isPayed ? formik.errors.isPayed : ''}</i>
                            </span>
                            <SelectableShips items={IsPayed} onBlur={formik.handleBlur} onChange={(v) => { formik.setFieldValue("isPayed", v) }} value={formik.values.isPayed} />
                        </div>
                        {/* follow up */}
                        <div className="flex-1 flex flex-col pb-4">
                            <span className="flex justify-between text-xs text-black font-semibold pb-4">
                                <i>Follow up</i>
                            </span>
                            <div className="flex flex-col rounded-lg bg-gray-100">
                                <div className="chat-history p-2">
                                    {formik.values.orderFollowUp.split('\n').map((note, index) => (
                                        <div>{note.length!=0 && <div key={index} className="mb-2">
                                            <p className="text-sm bg-white p-2 rounded">{note}</p>
                                        </div>}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-2">
                                    <textarea
                                        spellCheck="false"
                                        className="mt-1 text-sm p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        name='newOrderFollowUpNote'
                                        id='newOrderFollowUpNote'
                                        value={formik.values.newOrderFollowUpNote}
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        rows={3}
                                        placeholder="Enter new follow-up note here..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full flex touch-none">
                <button className="flex flex-1 w-full bg-white text-black text-sm justify-center items-center border p-4" onClick={() => setComponentLoaded(false)}>Cancel</button>
                <button className={`flex flex-1 w-full text-white items-center justify-center bg-gradient-to-r from-blue-500 to-green-500 shadow-lg p-4`} onClick={() => { formik.submitForm() }}>
                    <div className="flex">
                        <RoundAllInboxIcon className="h-6 w-6 mx-2" />
                        <span className="p-1 text-xs ">Save</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
