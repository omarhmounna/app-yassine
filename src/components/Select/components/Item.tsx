import React, { ReactElement, useCallback, useMemo } from "react";

import { COLORS, DEFAULT_THEME, THEME_DATA } from "../constants";

import DisabledItem from "./DisabledItem";
import { useSelectContext } from "./SelectProvider";
import { Option } from "./type";
import { CheckIcon } from "./Icons";

interface ItemProps {
    item: Option &{icon?:ReactElement,image?:ReactElement};
    primaryColor: string;
}

const Item: React.FC<ItemProps > = ({ item, primaryColor }) => {
    const { classNames, value, handleValueChange, formatOptionLabel } = useSelectContext();

    const isSelected = useMemo(() => {
        if(Array.isArray(value))
        {
            return value.filter(v=>v.value==item.value).length>0
        }
        return value !== null && !Array.isArray(value) && value.value === item.value;
    }, [item.value, value]);

    const textHoverColor = useMemo(() => {
        if (COLORS.includes(primaryColor)) {
            return THEME_DATA.textHover[primaryColor as keyof typeof THEME_DATA.textHover];
        }
        return THEME_DATA.textHover[DEFAULT_THEME];
    }, [primaryColor]);

    
    const textColor = useMemo(() => {
        if (COLORS.includes(primaryColor)) {
            return THEME_DATA.text[primaryColor as keyof typeof THEME_DATA.text];
        }
        return THEME_DATA.text[DEFAULT_THEME];
    }, [primaryColor]);
    
    const textSelectedColor = useMemo(() => {
        if (COLORS.includes(primaryColor)) {
            return THEME_DATA.textSelected[primaryColor as keyof typeof THEME_DATA.textSelected];
        }
        return THEME_DATA.textSelected[DEFAULT_THEME];
    }, [primaryColor]);

    

    const bgColor = useMemo(() => {
        if (COLORS.includes(primaryColor)) {
            return THEME_DATA.bg[primaryColor as keyof typeof THEME_DATA.bg];
        }
        return THEME_DATA.bg[DEFAULT_THEME];
    }, [primaryColor]);

    const bgHoverColor = useMemo(() => {
        if (COLORS.includes(primaryColor)) {
            return THEME_DATA.bgHover[primaryColor as keyof typeof THEME_DATA.bgHover];
        }
        return THEME_DATA.bgHover[DEFAULT_THEME];
    }, [primaryColor]);

    const getItemClass = useCallback(() => {
        const baseClass =
            "block transition duration-200 px-4 py-2 cursor-pointer select-none truncate rounded";
        const selectedClass = isSelected
            ? `${textSelectedColor} ${bgColor}`
            : `${textColor} ${bgHoverColor} ${textHoverColor}`;

        return classNames && classNames.listItem
            ? classNames.listItem({ isSelected })
            : `${baseClass} ${selectedClass}`;
    }, [bgColor, bgHoverColor, classNames, isSelected, textHoverColor]);

    return (
        <>
            {formatOptionLabel ? (
                <div onClick={() => handleValueChange(item)}>
                    {formatOptionLabel({ ...item, isSelected })}
                </div>
            ) : (
                <>
                    {item.disabled ? (
                        <DisabledItem>{item.label}</DisabledItem>
                    ) : (
                        <li
                            tabIndex={0}
                            onKeyDown={(e: React.KeyboardEvent<HTMLLIElement>) => {
                                if (e.key === ' ' || e.key === 'Enter') {
                                    handleValueChange(item)
                                }
                            }}
                            aria-selected={isSelected}
                            role={"option"}
                            onClick={() => handleValueChange(item)}
                            className={getItemClass() +' '+ classNames?.listItemClass + ' flex flex-row items-center ' +(Array.isArray(value)?'pl-':'')}
                        >
                            {item.icon?item.icon:''}
                            {item.image?item.image:''}
                            
                            <span className="flex flex-col ">
                                
                                    <i className={`flex items-center ${!isSelected?'pl-7':''}`} >{isSelected && <CheckIcon className="w-3 h-3 mx-2"/>}  {(item as Option).label} </i>
                                    <i className="text-xs ">{(item as Option).description} </i>
                                </span>
                        </li>
                    )}
                </>
            )}
        </>
    );
};

export default Item;
