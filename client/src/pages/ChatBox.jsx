import React, { useEffect } from "react";
import { dummyMessageData, dummyUserData } from "../assets/assets";

const ChatBox = () => {

    const message = dummyMessageData
    const [text, setText] = useState("")
    const [image, setImage] = useState(null)
    const [user, setUser] = useState(dummyUserData)
    const messageEndRef = useRef(null)

    const SendMessage = async () => {

    }

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    return user && (
        <div className="flex flex-col h-screen">
            <div className="flex items-center gap-2 p-2 md:px-10 xl:px-42 bg-gradient-to-r from-indigo-500 to-purple-50 border-b border-gray-300">
                <img src={user.profile_picture} alt="" className="size-8 rounded-full"/>
                <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-gray-500 -mt-1.5">@{user.status}</p>
                </div>
            </div>
            <div className="p-5 md:px-10 h-full overflow-y-scroll">
                <div className="space-y-4 max-w-4xl mx-auto">
                    {
                        message.toSorted((a, b)=> new Date(a.created_at) - new Date(b.created_at)).map((message, index) => (
                            <div key={index} className= {`flex flex-col ${message.to_user_id !== user._id ? "items-start" : "items-end"}`}>
                                <div className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${message.to_user_id !== user._id ? "rounded-bl-none" : "rounded-br-none"}`}>
                                {
                                message.message_type === "image" && <img src={message.media_url} alt="" className="w-full max-w-sm rounded-lg mb-1"/>
                                }
                                <p>{message.content}</p>
                                </div>
                            </div>
                        ))
                    }
                    <div ref={messageEndRef} />
                </div>
            </div>
        </div>
    );
};

export default ChatBox;