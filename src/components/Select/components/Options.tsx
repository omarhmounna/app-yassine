import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_THEME } from "../constants";

import DisabledItem from "./DisabledItem";
import GroupItem from "./GroupItem";
import Item from "./Item";
import { SelectContext } from "./SelectProvider";
import { Option, Options as ListOption } from "./type";

interface OptionsProps {
    list: ListOption;
    noOptionsMessage: string;
    text: string;
    isMultiple: boolean;
    value: Option | Option[] | null;
    primaryColor: string;
    addToOptions?:Function,
    accentClass?:string
}

const Options: React.FC<OptionsProps>  = ({
    list,
    noOptionsMessage,
    text,
    isMultiple,
    value,
    addToOptions,
    accentClass,
    primaryColor = DEFAULT_THEME
}) => {
    const optionsRef=useRef<HTMLDivElement>(null)
    const [activeRef,setActiveRef]=useState<any>(null)
    useEffect(()=>{
        if(optionsRef.current){
            setActiveRef(optionsRef);
        }
    },[optionsRef])
    const { classNames ,handleValueChange} = useContext(SelectContext);
    const filterByText = useCallback(() => {
        const filterItem = (item: Option) => {
            return item.label.toLowerCase().indexOf(text.toLowerCase()) > -1;
        };

        let result = list.map(item => {
            if ("options" in item) {
                return {
                    label: item.label,
                    options: item.options.filter(filterItem)
                };
            }
            return item;
        });

        result = result.filter(item => {
            if ("options" in item) {
                return item.options.length > 0;
            }
            return filterItem(item);
        });

        return result;
    }, [text, list]);

    const removeValues = useCallback(
        (array: ListOption) => {
            if (!isMultiple) {
                return array;
            }
            return array;
                    },
        [isMultiple, value]
    );

    const filterResult = useMemo(() => {
        return removeValues(filterByText());
    }, [filterByText, removeValues]);

    return (
        <div
            ref={optionsRef}
            role="options"
            className={classNames && classNames.list ? classNames.list : "px-2 bg-white overscroll-contain max-h-none flex flex-1 flex-col lg:max-h-44 overflow-y-scroll  "+(activeRef?(activeRef.current!.clientHeight==activeRef.current?.scrollHeight?'touch-none':''):'')}
        >
            
            {filterResult.map((item, index) => (
                <React.Fragment key={index}>
                    {"options" in item ? (
                        <>
                            
                            {/*<div className="px-2.5">*/}
                            <div >
                                <GroupItem
                                    primaryColor={primaryColor || DEFAULT_THEME}
                                    item={item}
                                />
                            </div>

                            {index + 1 < filterResult.length && <hr className="my-1" />}
                        </>
                    ) : (
                        <div >
                            <Item  primaryColor={primaryColor || DEFAULT_THEME} item={item} />
                        </div>
                    )}
                </React.Fragment>
            ))}

            {filterResult.length === 0 && <div className="flex flex-1 flex-col lg:p-2">
                <div>
                    <button className={`text-xs {} rounded p-2 ${accentClass}`} onClick={()=>{
                        addToOptions!({label:text,value:text})
                        handleValueChange({label:text,value:text})
                    }}>
                        Add '{text}'
                    </button>
                </div>
                <div className="flex flex-1 justify-center items-center">
                    <DisabledItem>{noOptionsMessage}</DisabledItem>
                </div>
            </div>}
        </div> 
    );
};

export default Options;
