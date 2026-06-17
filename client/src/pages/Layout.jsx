import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { dummyUserData } from "../assets/assets";
import Loading from "../components/Loading";
import { notificationApi } from "../utils/api";

import { useSocket } from "../utils/SocketContext";

const Layout = () => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : dummyUserData;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { notifSocket } = useSocket();

    const fetchUnreadCount = async () => {
        if (!user?.id) return;
        try {
            const response = await notificationApi.get('/notification', {
                params: { user_id: user.id }
            });
            const unread = (response.data || []).filter(n => !n.is_read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("Gagal mengambil jumlah notifikasi unread:", error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        const handleUnreadChange = () => {
            fetchUnreadCount();
        };

        window.addEventListener('unread-count-change', handleUnreadChange);
        return () => {
            window.removeEventListener('unread-count-change', handleUnreadChange);
        };
    }, [user?.id]);

    useEffect(() => {
        if (!notifSocket) return;

        const handleNewNotification = () => {
            fetchUnreadCount();
        };

        notifSocket.on("newNotification", handleNewNotification);
        return () => {
            notifSocket.off("newNotification", handleNewNotification);
        };
    }, [notifSocket]);

    return user ? (
        <div className="w-full flex h-screen overflow-hidden">

            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} unreadCount={unreadCount} />

            <div className="flex-1 bg-slate-50 overflow-y-auto">
                <Outlet />
            </div>
            {
                sidebarOpen ?
                <X className= 'absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSidebarOpen(false)} />
                :
                <Menu className= 'absolute top-3 left-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSidebarOpen(true)} />
            }    
        </div>
    ) : (
        <Loading />
    )
};

export default Layout;