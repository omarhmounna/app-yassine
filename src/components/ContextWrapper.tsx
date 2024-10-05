'use client';
import { GlobalContext } from "@/contexts/GlobalContext";
import { API } from "@/utils/API";
import axios from "axios";

import { useEffect, useRef, useState } from "react";

export default function ContextWrapper({ children }) {
  const [Loading, setLoading] = useState<boolean>(true);
  const [LoadingProgress, setLoadingProgress] = useState<number>(0);
  const [Orders, setOrders] = useState<string[]>([]);
  const [Products, setProducts] = useState<string[]>([]);
  const [Cities, setCities] = useState<string[]>([]);
  const [Status, setStatus] = useState<string[]>([]);
  const [MoneyManagement, setMoneyManagement] = useState<string[]>([]);
  const [Sources, setSources] = useState<string[]>([]);
  const [IsPayed, setIsPayed] = useState<string[]>([]);
  const [IsCasa, setIsCasa] = useState<boolean>(false);
  
  useEffect(() => {
    Refresh();
  }, []);
  
  const Refresh = () => {
    setOrders([]);
    Promise.all([
      axios.get(`${API}?column=all`).then((result) => {
        let json = result.data;
        setProducts(json["Products"]);
        setCities(json["City"]);
        setStatus(json["Satatut"]);
        setSources(json["Source Order"]);
        setIsPayed(json["FCT Livré"]);
        setMoneyManagement(json["Money Management"]);
      }),
      axios.get(`${API}${IsCasa ? '?isCasa=true' : ''}`).then((result) => {
        let json: any[] = result.data;
        setOrders(json);
      }),
    ]).then(() => {
      setLoading(false);
    });
  };

  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) {
      setLoading(true);
      setOrders([]);
      axios.get(`${API}${IsCasa ? '?isCasa=true' : ''}`).then((result) => {
        let json: any[] = [...result.data];
        setOrders(json);
        setLoading(false);
      });
    } else {
      mounted.current = true;
    }
  }, [IsCasa]);

  return (
    <GlobalContext.Provider value={{ Products, MoneyManagement, setMoneyManagement, setProducts, Orders, setOrders, Cities, setCities, Status, setStatus, Sources, setSources, IsPayed, setIsPayed, Loading, setLoading, Refresh, IsCasa, setIsCasa }}>
      {children}
    </GlobalContext.Provider>
  );
}
