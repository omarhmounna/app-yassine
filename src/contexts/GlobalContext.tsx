import { createContext, useContext, useState } from 'react';
type GlobalContextType={
    Loading?:boolean,
    setLoading?:Function,
    Refresh?:Function,
    Products?:string[],
    setProducts?:Function,
    Cities?:string[],
    setCities?:Function,
    Status?:string[],
    setStatus?:Function,
    Sources?:string[],
    setSources?:Function,
    Orders?:any[],
    setOrders?:Function,
    IsPayed?:any[],
    setIsPayed?:Function,
    IsCasa?:boolean,
    setIsCasa?:Function,
    
    MoneyManagement?:string[],
    setMoneyManagement?:Function,
}
export const GlobalContext = createContext<GlobalContextType>({});

export const useGlobalContext =()=> useContext<GlobalContextType>(GlobalContext);
