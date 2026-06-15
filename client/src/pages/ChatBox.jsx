import React, { useEffect, useState, useRef } from "react";
<<<<<<< HEAD
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { userApi, chatApi, notificationApi } from "../utils/api";
import { Image, SendHorizontal, ArrowLeft, X } from "lucide-react";
import Loading from "../components/Loading";
import Swal from "sweetalert2";

const ChatBox = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [partner, setPartner] = useState(location.state?.newChatPartner || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchChatData = async () => {
    if (!currentUser.id || !userId) return;

    try {
      // 1. Fetch partner profile details
      if (!partner) {
        const partnerRes = await userApi.get(`/user/${userId}`);
        setPartner(partnerRes.data);
      }

      // 2. Fetch messages history
      const historyRes = await chatApi.get(`/chat/messages/${userId}`, {
        params: { user_id: currentUser.id }
      });
      setMessages(historyRes.data || []);
    } catch (error) {
      console.error("Gagal mengambil percakapan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatData();
    // Poll chat history every 3 seconds for live message updates
    const interval = setInterval(fetchChatData, 3000);
    return () => clearInterval(interval);
  }, [userId, partner?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const SendMessage = async () => {
    if (!text.trim() && !image) return;

    try {
      const formData = new FormData();
      formData.append("sender_id", currentUser.id);
      formData.append("receiver_id", userId);
      formData.append("message_text", text);
      if (image) {
        formData.append("image", image); // Maps to backend upload processing ("image")
      }

      await chatApi.post("/chat/send", formData);

      setText("");
      setImage(null);

      // Kirim notifikasi chat ke penerima
      if (userId && userId !== currentUser.id) {
        try {
          await notificationApi.post('/notification', {
            user_id: userId,
            type: 'CHAT',
            reference_id: currentUser.id
          });
        } catch (notificationError) {
          console.error("Gagal mengirim notifikasi chat:", notificationError);
        }
      }
      
      // Instantly reload message history
      const historyRes = await chatApi.get(`/chat/messages/${userId}`, {
        params: { user_id: currentUser.id }
      });
      setMessages(historyRes.data || []);
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
      Swal.fire({
        title: "Gagal",
        text: "Gagal mengirim pesan.",
        icon: "error",
        confirmButtonColor: "#1e1b4b"
      });
    }
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <Loading />;

  return partner ? (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Header Chat */}
      <div className="flex items-center gap-3 p-4 bg-white border-b border-slate-200 shadow-sm">
        <button
          onClick={() => navigate("/messages")}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition mr-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <img
          src={partner.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
          alt={partner.username}
          className="w-10 h-10 rounded-full border border-slate-100 object-cover"
        />
        <div>
          <p className="font-bold text-slate-800 leading-tight">{partner.full_name || partner.username || "Tanpa Nama"}</p>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">@{partner.username || "username"}</p>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50">
        <div className="space-y-4 max-w-4xl mx-auto flex flex-col">
          {messages.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-10 font-medium">Belum ada obrolan. Kirim pesan pertama Anda!</p>
          ) : (
            messages.map((message, index) => {
              const isOutgoing = message.sender_id === currentUser.id;
              return (
                <div
                  key={index}
                  className={`flex flex-col max-w-[70%] ${isOutgoing ? "self-end items-end" : "self-start items-start"}`}
                >
                  <div
                    className={`p-3 text-sm rounded-2xl shadow-sm ${
                      isOutgoing
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white text-slate-700 rounded-bl-none border border-slate-100"
                    }`}
                  >
                    {message.media_url && (
                      <div className="overflow-hidden rounded-2xl border border-black/5 shadow-sm max-w-sm mb-2 cursor-pointer hover:opacity-90 transition duration-200 active:scale-[0.99]">
                        <img
                          src={message.media_url}
                          alt="Attachment"
                          className="w-full h-auto object-cover max-h-72"
                          onClick={() => setPreviewImageUrl(message.media_url)}
                        />
                      </div>
                    )}
                    {message.message_text && <p className="leading-relaxed break-words">{message.message_text}</p>}
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold mt-1 px-1">
                    {formatMessageTime(message.created_at)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Inputs */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          {/* Image preview indicator */}
          {image && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-indigo-50/50 border border-indigo-100 rounded-2xl w-fit">
              <img
                src={URL.createObjectURL(image)}
                alt="Selected Preview"
                className="h-14 w-14 rounded-xl object-cover border border-indigo-200 shadow-sm"
              />
              <div className="pr-2">
                <p className="text-[10px] font-bold text-indigo-700">Gambar siap dikirim</p>
                <p className="text-[9px] text-indigo-400 truncate max-w-40">{image.name}</p>
              </div>
              <button
                onClick={() => setImage(null)}
                className="p-1 rounded-full bg-indigo-200/50 text-indigo-700 hover:bg-indigo-200 hover:text-indigo-900 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 pl-5 p-1.5 bg-slate-50 border border-slate-200 shadow-sm rounded-full">
            <input
              type="text"
              className="flex-1 outline-none text-sm text-slate-700 bg-transparent placeholder-slate-400"
              placeholder="Tulis pesan..."
              onKeyDown={(e) => e.key === "Enter" && SendMessage()}
              onChange={(e) => setText(e.target.value)}
              value={text}
            />

            <label htmlFor="image" className="cursor-pointer">
              <div className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400 hover:text-slate-600">
                <Image className="w-5.5 h-5.5" />
              </div>
              <input
                type="file"
                id="image"
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (e.target.files?.[0]) setImage(e.target.files[0]);
                }}
              />
            </label>

            <button
              onClick={SendMessage}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition text-white p-2.5 rounded-full shadow-sm cursor-pointer"
            >
              <SendHorizontal className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal Overlay */}
      {previewImageUrl && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setPreviewImageUrl(null)}
        >
          {/* Close Button */}
          <button className="absolute top-5 right-5 text-white/70 hover:text-white transition text-lg font-semibold bg-transparent border-none cursor-pointer">
            Tutup
          </button>
          
          {/* Full Resolution Image */}
          <img 
            src={previewImageUrl} 
            alt="Preview Besar" 
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevents closing modal when clicking the image itself
          />
        </div>
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default ChatBox;
=======
import { dummyMessagesData, dummyUserData } from "../assets/assets";
import { Image, SendHorizontal } from "lucide-react";

    const ChatBox = () => {

        const messages = dummyMessagesData
        const [text, setText] = useState("")
        const [image, setImage] = useState(null)
        const [user, setUser] = useState(dummyUserData)
        const messagesEndRef = useRef(null)

        const SendMessage = async () => {

        }

        useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, [messages])

        return user && (
            <div className="flex flex-col h-screen">
                <div className="flex items-center gap-2 p-2 md:px-10 xl:px-42 bg-gradient-to-r from-indigo-500 to-purple-50 border-b border-gray-300">
                    <img src={user.profile_picture} alt="" className="size-8 rounded-full"/>
                    <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-gray-500 -mt-1.5">@{user.username}</p>
                    </div>
                </div>
                <div className="p-5 md:px-10 h-full overflow-y-scroll">
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {
                            messages.toSorted((a, b)=> new Date(a.created_at) - new Date(b.created_at)).map((message, index) => (
                                <div key={index} className= {`flex flex-col ${message.from_user_id === user._id ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${message.from_user_id === user._id ? "rounded-br-none" : "rounded-bl-none"}`}>
                                    {
                                    message.message_type === "image" && <img src={message.media_url} alt="" className="w-full max-w-sm rounded-lg mb-1"/>
                                    }
                                    <p>{message.text}</p>
                                    </div>
                                </div>
                            ))
                        }
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="px-4">
                        <div className="flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5">
                            <input type="text" className="flex-1 outline-none text-slate-700" placeholder="Type a message..."
                            onKeyDown={e=> e.key === "Enter" && SendMessage()} onChange={(e) => setText(e.target.value)} value={text}/>

                            <label htmlFor="image">
                                {
                                    image 
                                    ? 
                                    <img src={URL.createObjectURL(image)} alt="" className="h-8 rounded"/>
                                    : <Image className="size-7 text-gray-400 cursor-pointer"/>
                                }
                                <input type="file" id="image" accept="image/*" hidden onChange={(e) =>  setImage(e.target.files[0])} />
                            </label>

                            <button onClick={SendMessage} className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:from-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full">
                                <SendHorizontal size={18}/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    export default ChatBox;
>>>>>>> origin/Kibob_update_home
