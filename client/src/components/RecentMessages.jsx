import React, { useEffect, useState } from "react";
import { dummyRecentMessagesData } from "../assets/assets";
import { Link } from 'react-router-dom';
import moment from "moment";
import { chatApi } from "../utils/api";

import { useSocket } from "../utils/SocketContext";

const RecentMessages = () => { 
    const [messages, setMessages] = useState([])
    const [onlineUsers, setOnlineUsers] = useState([])
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const { chatSocket } = useSocket();
    
    const getMockData = () => {
        return dummyRecentMessagesData.map(msg => ({
            _id: msg._id,
            partnerId: msg.from_user_id?._id || msg.from_user_id || "unknown",
            name: msg.from_user_id?.full_name || msg.from_user_id?.name || "Richard Hendricks",
            avatar: msg.from_user_id?.profile_picture || msg.from_user_id?.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            text: msg.text,
            time: msg.createdAt,
            seen: msg.seen
        }));
    };

    const fetchRecentMessages = async () => {
        if (!currentUser.id) {
            setMessages(getMockData());
            return;
        }
        try {
            const res = await chatApi.get('/chat/conversations', {
                params: { user_id: currentUser.id }
            });
            if (res.data && res.data.length > 0) {
                const formatted = res.data.map(conv => ({
                    _id: conv.partner_id,
                    partnerId: conv.partner_id,
                    name: conv.full_name || conv.username || "InSight User",
                    avatar: conv.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                    text: conv.message_text || (conv.media_url ? "Lampiran Media" : ""),
                    time: conv.created_at,
                    seen: true
                }));
                setMessages(formatted);
            } else {
                setMessages(getMockData());
            }
        } catch (error) {
            console.warn("Gagal mengambil percakapan dari API, menggunakan dummy data:", error);
            setMessages(getMockData());
        }
    };

    useEffect(() => { 
        fetchRecentMessages();
    }, []);

    useEffect(() => {
        if (!chatSocket) return;

        const handleReceiveMessage = () => {
            fetchRecentMessages();
        };

        const handleMessageDeleted = () => {
            fetchRecentMessages();
        };

        const handleOnlineUsersList = (users) => {
            setOnlineUsers(users);
        };

        const handleUserOnline = (onlineUserId) => {
            setOnlineUsers((prev) => prev.includes(onlineUserId) ? prev : [...prev, onlineUserId]);
        };

        const handleUserOffline = (offlineUserId) => {
            setOnlineUsers((prev) => prev.filter((id) => id !== offlineUserId));
        };

        chatSocket.on("receiveMessage", handleReceiveMessage);
        chatSocket.on("messageDeleted", handleMessageDeleted);
        chatSocket.on("onlineUsersList", handleOnlineUsersList);
        chatSocket.on("userOnline", handleUserOnline);
        chatSocket.on("userOffline", handleUserOffline);

        // Request online users list on mount
        chatSocket.emit("getOnlineUsers");

        return () => {
            chatSocket.off("receiveMessage", handleReceiveMessage);
            chatSocket.off("messageDeleted", handleMessageDeleted);
            chatSocket.off("onlineUsersList", handleOnlineUsersList);
            chatSocket.off("userOnline", handleUserOnline);
            chatSocket.off("userOffline", handleUserOffline);
        };
    }, [chatSocket]);

    return (
        <div className="bg-white w-[450px] mt-4 p-4 min-h-20 rounded-md shadow text-sm text-slate-800">
            <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>
            <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar font-sans">
                {
                    messages.map((message, index) => {
                        const isOnline = onlineUsers.some(id => String(id) === String(message.partnerId));
                        return (
                            <Link to={`/messages/${message.partnerId}`} key={index} className="flex items-start gap-3 py-2 px-2 rounded hover:bg-slate-100 transition-colors">
                                <div className="relative flex-shrink-0">
                                    <img src={message.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm"/>
                                    {isOnline && (
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500 animate-pulse" />
                                    )}
                                </div>
                                <div className="w-full min-w-0">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium text-sm text-slate-800 truncate pr-2">{message.name}</p>
                                        <p className="text-[10px] text-slate-400 whitespace-nowrap">{moment(message.time).fromNow()}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-0.5">
                                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{message.text ? message.text : "Media"}</p>
                                        {!message.seen && <p className="bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold">1</p>}
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                }
            </div>
        </div>
    )
}

export default RecentMessages;
