import React, { useEffect, useState } from "react";
import { dummyRecentMessagesData } from "../assets/assets";
import { Link } from 'react-router-dom';
import moment from "moment";

const RecentMessages = () => { 
    const [messages, setMessages] = useState([])
    
    const fetchRecentMessages = async () => {
        setMessages(dummyRecentMessagesData)
    }

    useEffect(() => { 
        fetchRecentMessages();
    }, [])


    return (
        <div className="bg-white w-[450px] mt-4 p-4 min-h-20 rounded-md shadow text-sm text-slate-800">
            <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>
            <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
                {
                    messages.map((message, index) => ( 
                        <Link key={index} className="flex items-start gap-3 py-2 px-2 rounded hover:bg-slate-100">
                            <img src={message.from_user_id.profile_picture} alt="" className="w-10 h-10 rounded-full"/>
                            <div className="w-full">
                                <div className="flex justify-between">
                                    <p className="font-medium text-sm">{message.from_user_id.name}</p>
                                    <p className="text-xs text-slate-400">{moment(message.createdAt).fromNow()}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-slate-600 truncate max-w-[280px]">{message.text ? message.text : "Media"}</p>
                                    {!message.seen && <p className="bg-indigo-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">1</p>}
                                </div>
                            </div>
                        </Link>
                    ) )
                }
            </div>

        </div>
    )
}

export default RecentMessages;
