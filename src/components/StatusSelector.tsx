import { useState } from "react";
import { CheckIcon } from "./Select/components/Icons";
import axios from "axios";

export default function StatusSelector({ statusList, Cancel, Elements, notification, setNotification }) {
    const [selected, setSelected] = useState<any>(-1);
    const [loading, setLoading] = useState<any>(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const setElementsStatus = (Elements, status) => {
        setLoading(true);
        axios.post("https://api.anaqamaghribiya.store/batch-operation.php", { edit: Elements, status: status })
            .then(() => {
                setNotification({ show: true, message: "Status has been updated successfully!", error: false });
                setTimeout(() => setNotification({ show: false, message: "", error: false }), 2000); // Hide notification after 2 seconds
                Cancel(status);
                setLoading(false);
            }).catch(() => {
                setNotification({ show: true, message: "Failed to update status.", error: true });
                setTimeout(() => setNotification({ show: false, message: "", error: false }), 2000); // Hide notification after 2 seconds
                setLoading(false);
            });
    };

    return (
        <>
            <div className="fixed z-40 bg-black/5 w-screen h-screen flex justify-center items-center rounded" onClick={() => Cancel(null)}></div>
            <div className="fixed z-40 bg-black/5 w-screen h-screen flex justify-center items-center rounded pointer-events-none">
                <div className="w-[80%] max-w-md overflow-hidden bg-white flex flex-col pointer-events-auto">
                    <div className="text-white bg-gradient-to-r from-blue-500 to-green-500 text-base font-semibold px-4 py-2">Select status</div>
                    <div className="flex flex-col text-sm h-80 mx-h-80 min-h-80 overflow-y-scroll">
                        {statusList.map((s, i) => (
                            <div key={i} className="w-full p-2 text-black flex cursor-pointer" onClick={() => setSelected(i)}>
                                <span className="w-6 mx-2 ml-4">{selected === i ? <CheckIcon className="w-5" /> : ''}</span>
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>
                    <hr />
                    <div className="p-4 py-2 flex justify-between items-center">
                        <button onClick={() => Cancel(null)} className="bg-gray-100 hover:bg-gray-200 font-semibold rounded text-sm p-2 px-4">Cancel</button>
                        <button disabled={selected === -1 || loading} onClick={() => setIsConfirmModalVisible(true)} className="text-white disabled:bg-gray-400 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 font-semibold rounded text-sm p-2 px-4">
                            {loading ? <div className="w-4 h-4 border-4 border-t-3 border-t-green-500 border-gray-200 rounded-full animate-spin"></div> : 'OK'}
                        </button>
                    </div>
                </div>
            </div>
            {isConfirmModalVisible && (
                <div style={{ maxHeight: 'var(--portview-height)' }} className="fixed overscroll-contain justify-center items-center flex flex-col transition-[left] duration-200 z-50 top-0 w-screen bg-black/15 h-dvh" onClick={() => { setIsConfirmModalVisible(false) }}>
                    <div className="overflow-hidden flex flex-col max-w-[80%] w-96 rounded bg-white" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                        <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold text-sm p-4">
                            Confirm Status Update?
                        </div>
                        <div className="p-4 pb-2 px-8 text-sm">Do you really want to update the status of the selected elements?</div>
                        <div className="p-4 flex items-center justify-end">
                            <button onClick={() => setIsConfirmModalVisible(false)} className="text-sm p-2 px-4 mx-4 border rounded">Cancel</button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsConfirmModalVisible(false);
                                    setElementsStatus(Elements, statusList[selected]);
                                }}
                                className="bg-gradient-to-r from-blue-500 to-green-500 px-4 text-white rounded text-sm p-2 mx-4 flex"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
