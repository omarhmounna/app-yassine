import React, { useState, useEffect } from 'react';
import { useGlobalContext } from "@/contexts/GlobalContext";
import Image from "next/image";
import logo from "../../public/images/ANAQA Maghribiya - Logotype ( Ver.01 ).png";
import { MapPinIcon, PhUsersThree, SolarWalletMoneyOutline, MaterialSymbolsInventoryRounded, DashboardIcon, StreamlineInterfaceArrowsBendDownLeft2ArrowBendCurveChangeDirectionDownToLeft } from "./Icons";

const MenuItem = ({ icon: Icon, label, count, isActive, onClick }) => (
  <button
    className={`w-full py-2 px-3 flex items-center space-x-2 rounded-lg transition-all duration-300 
    ${isActive ? 'bg-white/20 text-white shadow-md' : 'text-white/70 hover:bg-white/10'}`}
    onClick={onClick}
  >
    <div className={`p-1.5 rounded-md ${isActive ? 'bg-white/30' : 'bg-white/10'}`}>
      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-white/70'}`} />
    </div>
    <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
      {label}
    </span>
    {count !== undefined && (
      <span className="ml-auto bg-white/30 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
        {count}
      </span>
    )}
  </button>
);

export default function SideMenu({ IsMenu, processingCount, setIsMenu, setIsCasa, setIsMoneyManagement, setIsStockTable, setIsDashboard, setIsBonsRetour }) {
  const { IsCasa } = useGlobalContext();
  const [selectedMenuItem, setSelectedMenuItem] = useState("Statistiques Général");
  const [orderCount, setOrderCount] = useState(undefined);

  useEffect(() => {
    async function fetchOrderCount() {
      try {
        const response = await fetch('/api/getOrderCount');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setOrderCount(data.count);
      } catch (error) {
        console.error('Error fetching order count:', error);
        setOrderCount(processingCount);
      }
    }
    fetchOrderCount();
  }, []);

  const menuItems = [
    { icon: DashboardIcon, label: "Statistiques Général", setter: setIsDashboard, isActive: selectedMenuItem === "Statistiques Général" },
    { icon: PhUsersThree, label: "All Orders", setter: () => {}, isActive: selectedMenuItem === "All Orders", count: processingCount },
    { icon: MapPinIcon, label: "Casablanca", setter: setIsCasa, isActive: IsCasa },
    { icon: SolarWalletMoneyOutline, label: "Money Management", setter: setIsMoneyManagement, isActive: selectedMenuItem === "Money Management" },
    { icon: MaterialSymbolsInventoryRounded, label: "Stock Management", setter: setIsStockTable, isActive: selectedMenuItem === "Stock Management" },
    { icon: StreamlineInterfaceArrowsBendDownLeft2ArrowBendCurveChangeDirectionDownToLeft, label: "Bons Retour", setter: setIsBonsRetour, isActive: selectedMenuItem === "Bons Retour" },
  ];

  return (
    <>
      {IsMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300"
          onClick={() => setIsMenu(false)}
        />
      )}
      <aside
        className={`fixed z-30 inset-y-0 left-0 w-56 bg-gradient-to-br from-blue-600 to-green-500 transform transition-all duration-300 ease-in-out ${
          IsMenu ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col shadow-2xl rounded-r-2xl`}
      >
        <div className="flex items-center justify-center h-20 mb-4">
          <Image src={logo} alt="ANAQA Maghribiya Logo" width={140} height={45} className="max-w-[80%] h-auto" />
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              count={item.count}
              isActive={item.isActive}
              onClick={() => {
                menuItems.forEach(mi => mi.setter(false));
                setSelectedMenuItem(item.label);
                item.setter(true);
                setIsMenu(false);
              }}
            />
          ))}
        </nav>

        
      </aside>
    </>
  );
}