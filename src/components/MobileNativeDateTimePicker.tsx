import moment from "moment"
import { useState } from "react"

export default function MobileNativeDateTimePicker({id,name,onChange,onBlur,value, inputClass,viewClass,format}){
    
    return <div className="relative">
        <input className={viewClass} value={moment.unix(value).format("DD/MM/yyyy HH:mm")} disabled />
        <input  className={inputClass}  id={id} name={name} type="datetime-local" onChange={onChange} onBlur={onBlur} value={moment.unix(value).format("YYYY-MM-DDTHH:mm")}/>
    </div>
}