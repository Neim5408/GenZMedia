import React from "react";
import { menuItemsData } from "../assets/assets";
import { NavLink } from "react-router-dom";

const MenuItems = ({setSidebarOpen}) => { 
    return (
        <div className="px-6 text-gray-600 space-y-1 font-medium">
            {
                menuItemsData.map(({to, label, Icon}) => ( 
                    <div key={to} className="relative">
                        <NavLink to={to} end={to === '/'} onClick={() => setSidebarOpen (false)} className={({isActive}) => `px-3.5 py-2 flex items-center gap-3 rounded-xl  ${isActive ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}>
                            <Icon className="w-5 h-5" />
                            {label}
                            {label === 'Notifications' && (
                                <span className='ml-auto flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full'>
                                    5
                                </span>
                            )}
                        </NavLink>
                    </div>
                ))
            }
        </div>
    )
}

export default MenuItems;