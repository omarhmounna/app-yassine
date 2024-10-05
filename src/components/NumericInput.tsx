"useClient"

import { useEffect, useState } from "react"
import { MinusIcon, PlusIcon } from "./Icons"

export default function NumericInput({isInt=true,name,fractionDigits=2,id,setValue,onChange,onBlur,value=0,inputClass='flex flex-1 text-sm text-black w-full',plusClass='w-6 mx-2 h-6 text-sm text-gray-700',minusClass='w-6 mx-2 h-6 text-sm text-gray-700',plusContainer="",minusContainer=""}){
    
    useEffect(()=>console.log(value),[value])
    const add=()=>{
        if(typeof value == 'string'){
            setValue(1)
        }else
        setValue(value+1)
    }
    const substract=()=>{
        if(typeof value == 'string'){
            setValue(0)
        }else if(value>=1){
            setValue(value-1)
        }else if(value>=0){setValue(0)}
    }
    
    return <div className="flex justify-center items-center">
        <div className={`flex justify-center items-center ${minusContainer} `}><MinusIcon className={`${minusClass}`} onClick={()=>substract()}/></div>
        <input name={name} id={id} className={`text-center ${inputClass}`} type="number" onChange={(v)=>{onChange(v)}} onBlur={onBlur} value={value}/>
        <div className={`flex justify-center items-center ${plusContainer} `}><PlusIcon className={`${plusClass}`} onClick={()=>{add()}} /></div>
    </div>
}