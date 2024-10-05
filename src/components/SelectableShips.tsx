import { useState } from "react";

export default function SelectableShips({items,onChange,onBlur,value}){
    const [Value,setValue]=useState(value);
    const select=(item)=>{
        if(Value==item){
            setValue(null)
            onChange("")
        }else{
            setValue(item)
            onChange(item)
        }
    }
    return <div className="flex flex-wrap justify-center items-center">
        {items.map((item,index)=><div key={`chip-${index}`} onClick={()=>select(item)} className={`p-1 mx-2 my-1 rounded-full bg-gray-200  text-xs border-gray-200 border ${item==Value?'text-white bg-green-700':''}`}><span className={`pl-1 px-2`}>{item}</span></div>)}
    </div>
}