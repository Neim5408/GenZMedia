import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { userApi, chatApi } from "../utils/api";
import { Image, SendHorizontal, ArrowLeft, X, MoreHorizontal, Trash2 } from "lucide-react";
import Loading from "../components/Loading";
import Swal from "sweetalert2";
import { useSocket } from "../utils/SocketContext";

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
  const [selectedMediaPreviewUrl, setSelectedMediaPreviewUrl] = useState(null);
  const [activeMediaMenuId, setActiveMediaMenuId] = useState(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchChatData = async () => {
    if (!currentUser.id || !userId) return;

    try {
      // 1. Fetch partner profile details
      if (!partner) {
        const partnerRes = await userApi.get(`/user/${userId}`);
        setPartner(partnerRes.data);
      }

      // 2. Mark messages and notifications as read
      chatApi.put("/chat/read", {
        senderId: userId,
        receiverId: currentUser.id
      }).then(() => {
        window.dispatchEvent(new Event('unread-count-change'));
      }).catch(err => console.warn("Gagal menandai pesan dibaca:", err));

      // 3. Fetch messages history
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

  const { chatSocket } = useSocket();

  useEffect(() => {
    fetchChatData();
  }, [userId, partner?.id]);

  useEffect(() => {
    setIsPartnerTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (!chatSocket) return;

    const handleReceiveMessage = (newMessage) => {
      // Check if message belongs to the current conversation
      if (
        (newMessage.sender_id === userId && newMessage.receiver_id === currentUser.id) ||
        (newMessage.sender_id === currentUser.id && newMessage.receiver_id === userId)
      ) {
        setMessages((prev) => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });

        // If it was from the partner, mark as read immediately since we are in the chat room!
        if (newMessage.sender_id === userId) {
          chatApi.put("/chat/read", {
            senderId: userId,
            receiverId: currentUser.id
          }).then(() => {
            window.dispatchEvent(new Event('unread-count-change'));
          }).catch(err => console.warn(err));
        }
      }
    };

    const handleMessageDeleted = (deletedMessage) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== deletedMessage.id));
    };

    const handleMessageMediaDeleted = (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
    };

    const handleUserTyping = (senderId) => {
      if (String(senderId) === String(userId)) {
        setIsPartnerTyping(true);
      }
    };

    const handleUserStoppedTyping = (senderId) => {
      if (String(senderId) === String(userId)) {
        setIsPartnerTyping(false);
      }
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
    chatSocket.on("messageMediaDeleted", handleMessageMediaDeleted);
    chatSocket.on("userTyping", handleUserTyping);
    chatSocket.on("userStoppedTyping", handleUserStoppedTyping);
    chatSocket.on("onlineUsersList", handleOnlineUsersList);
    chatSocket.on("userOnline", handleUserOnline);
    chatSocket.on("userOffline", handleUserOffline);

    // Request the latest list of online users
    chatSocket.emit("getOnlineUsers");

    return () => {
      chatSocket.off("receiveMessage", handleReceiveMessage);
      chatSocket.off("messageDeleted", handleMessageDeleted);
      chatSocket.off("messageMediaDeleted", handleMessageMediaDeleted);
      chatSocket.off("userTyping", handleUserTyping);
      chatSocket.off("userStoppedTyping", handleUserStoppedTyping);
      chatSocket.off("onlineUsersList", handleOnlineUsersList);
      chatSocket.off("userOnline", handleUserOnline);
      chatSocket.off("userOffline", handleUserOffline);
    };
  }, [chatSocket, userId, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getMediaType = (mediaUrl) => {
    if (!mediaUrl) return null;
    const cleanUrl = mediaUrl.split("?")[0].toLowerCase();
    return /\.(mp4|webm|ogg|mov|avi|mkv)$/.test(cleanUrl) ? "video" : "image";
  };

  const getSelectedMediaType = (file) => {
    if (!file) return null;
    if (file.type?.startsWith("video/")) return "video";
    const ext = file.name.split(".").pop().toLowerCase();
    return ["mp4", "webm", "ogg", "mov", "avi", "mkv"].includes(ext) ? "video" : "image";
  };

  const clearSelectedMedia = () => {
    if (selectedMediaPreviewUrl) URL.revokeObjectURL(selectedMediaPreviewUrl);
    setImage(null);
    setSelectedMediaPreviewUrl(null);
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);

    // Tandai pesan dan notifikasi dari user ini telah dibaca saat kita mulai mengetik balasan
    if (userId) {
      chatApi.put("/chat/read", {
        senderId: userId,
        receiverId: currentUser.id
      }).then(() => {
        window.dispatchEvent(new Event('unread-count-change'));
      }).catch(err => console.warn("Gagal menandai dibaca saat mengetik:", err));
    }

    if (!chatSocket || !userId) return;
    chatSocket.emit("typing", { sender_id: currentUser.id, receiver_id: userId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      chatSocket.emit("stopTyping", { sender_id: currentUser.id, receiver_id: userId });
    }, 1500);
  };

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

      // Clear typing indicator on send
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (chatSocket && userId) {
        chatSocket.emit("stopTyping", { sender_id: currentUser.id, receiver_id: userId });
      }

      await chatApi.post("/chat/send", formData);

      setText("");
      clearSelectedMedia();
      
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

  const handleDeleteMedia = async (message) => {
    setActiveMediaMenuId(null);

    const confirm = await Swal.fire({
      title: "Hapus media?",
      text: "Gambar atau video akan dihapus dari pesan ini.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await chatApi.delete(`/chat/messages/${message.id}/media`, {
        data: { user_id: currentUser.id },
      });

      const updatedMessage = response.data?.data || {
        ...message,
        media_url: null,
        media_deleted: true,
      };

      setMessages((prev) =>
        prev.map((item) => (item.id === message.id ? updatedMessage : item))
      );

      if (previewImageUrl === message.media_url) {
        setPreviewImageUrl(null);
      }

      Swal.fire({
        title: "Terhapus",
        text: "Media berhasil dihapus.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Gagal menghapus media:", error);
      Swal.fire(
        "Gagal",
        error.response?.data?.error || "Gagal menghapus media",
        "error"
      );
    }
  };

  const handleDeleteMessage = async (message) => {
    const isOutgoing = message.sender_id === currentUser.id;
    const confirmText = isOutgoing 
      ? "Pesan ini akan dihapus untuk Anda dan lawan bicara." 
      : "Pesan ini hanya akan dihapus dari riwayat chat Anda.";

    const confirm = await Swal.fire({
      title: "Hapus pesan?",
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });

    if (!confirm.isConfirmed) return;

    try {
      await chatApi.delete(`/chat/messages/${message.id}`, {
        data: { user_id: currentUser.id }
      });

      setMessages((prev) => prev.filter((item) => item.id !== message.id));

      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: 'success',
        title: 'Pesan berhasil dihapus'
      });
    } catch (error) {
      console.error("Gagal menghapus pesan:", error);
      Swal.fire(
        "Gagal",
        error.response?.data?.error || "Gagal menghapus pesan",
        "error"
      );
    }
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <Loading />;

  const isOnline = onlineUsers.some(id => String(id) === String(userId));

  return partner ? (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {activeMediaMenuId && (
        <button
          type="button"
          className="fixed inset-0 z-10 cursor-default"
          onClick={() => setActiveMediaMenuId(null)}
          aria-label="Tutup menu media"
        />
      )}

      {/* Header Chat */}
      <div className="flex items-center gap-3 p-4 bg-white border-b border-slate-200 shadow-sm">
        <button
          onClick={() => navigate("/messages")}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition mr-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative">
          <img
            src={partner.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt={partner.username}
            className="w-10 h-10 rounded-full border border-slate-100 object-cover"
          />
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
        </div>
        <div>
          <p className="font-bold text-slate-800 leading-tight flex items-center gap-2">
            {partner.full_name || partner.username || "Tanpa Nama"}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isOnline ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </p>
          {isPartnerTyping ? (
            <p className="text-xs text-indigo-600 font-bold mt-0.5 animate-bounce">sedang mengetik...</p>
          ) : (
            <p className="text-xs text-slate-400 font-semibold mt-0.5">@{partner.username || "username"}</p>
          )}
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
              const mediaType = getMediaType(message.media_url);
              const mediaMenuId = message.id || `message-${index}`;
              return (
                <div
                  key={message.id || index}
                  className={`flex items-center gap-2 group relative max-w-[75%] ${
                    isOutgoing ? "self-end flex-row-reverse" : "self-start flex-row"
                  }`}
                >
                  <div className={`flex flex-col ${isOutgoing ? "items-end" : "items-start"}`}>
                    <div
                      className={`p-3 text-sm rounded-2xl shadow-sm ${
                        isOutgoing
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white text-slate-700 rounded-bl-none border border-slate-100"
                      }`}
                    >
                      {message.media_url && (
                        <div className="relative max-w-sm mb-2">
                          <div className="overflow-hidden rounded-2xl border border-black/5 shadow-sm">
                            {mediaType === "video" ? (
                              <video
                                src={message.media_url}
                                controls
                                className="w-full h-auto object-cover max-h-72 bg-black"
                              />
                            ) : (
                              <img
                                src={message.media_url}
                                alt="Attachment"
                                className="w-full h-auto object-cover max-h-72 cursor-pointer hover:opacity-90 transition duration-200 active:scale-[0.99]"
                                onClick={() => setPreviewImageUrl(message.media_url)}
                              />
                            )}
                          </div>

                          {isOutgoing && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMediaMenuId((current) => current === mediaMenuId ? null : mediaMenuId);
                                }}
                                className="absolute right-2 top-2 z-20 rounded-full bg-black/55 p-1.5 text-white opacity-100 transition hover:bg-black/75 cursor-pointer"
                                title="Opsi media"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>

                              {activeMediaMenuId === mediaMenuId && (
                                <div className="absolute right-2 top-10 z-20 w-36 overflow-hidden rounded-xl border border-slate-100 bg-white text-slate-700 shadow-xl">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMedia(message);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50 cursor-pointer"
                                  >
                                    Hapus media
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      {!message.media_url && message.media_deleted && (
                        <p className={`mb-1 text-xs italic ${isOutgoing ? "text-indigo-100" : "text-slate-400"}`}>
                          Media telah dihapus
                        </p>
                      )}
                      {message.message_text && <p className="leading-relaxed break-words">{message.message_text}</p>}
                    </div>
                    <span className="text-[9px] text-slate-400 font-semibold mt-1 px-1">
                      {formatMessageTime(message.created_at)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteMessage(message)}
                    className="p-1.5 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 cursor-pointer flex-shrink-0"
                    title="Hapus pesan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
          {/* Media preview indicator */}
          {image && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-indigo-50/50 border border-indigo-100 rounded-2xl w-fit">
              {getSelectedMediaType(image) === "video" ? (
                <video
                  src={selectedMediaPreviewUrl}
                  className="h-14 w-14 rounded-xl object-cover border border-indigo-200 shadow-sm bg-black"
                  muted
                />
              ) : (
                <img
                  src={selectedMediaPreviewUrl}
                  alt="Selected Preview"
                  className="h-14 w-14 rounded-xl object-cover border border-indigo-200 shadow-sm"
                />
              )}
              <div className="pr-2">
                <p className="text-[10px] font-bold text-indigo-700">Media siap dikirim</p>
                <p className="text-[9px] text-indigo-400 truncate max-w-40">{image.name}</p>
              </div>
              <button
                onClick={clearSelectedMedia}
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
              onChange={handleTextChange}
              value={text}
            />

            <label htmlFor="image" className="cursor-pointer">
              <div className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400 hover:text-slate-600">
                <Image className="w-5.5 h-5.5" />
              </div>
              <input
                type="file"
                id="image"
                accept="image/*,video/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (selectedMediaPreviewUrl) URL.revokeObjectURL(selectedMediaPreviewUrl);
                  setImage(file);
                  setSelectedMediaPreviewUrl(URL.createObjectURL(file));
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
