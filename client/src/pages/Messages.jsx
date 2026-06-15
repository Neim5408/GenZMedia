import React, { useEffect, useState } from "react";
import { chatApi, userApi } from "../utils/api";
import { Eye, MessageSquare, Plus, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import moment from "moment";

const Messages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Chat States
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [mutualFriendsList, setMutualFriendsList] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");

  const fetchConversations = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await chatApi.get("/chat/conversations", {
        params: { user_id: currentUser.id }
      }).catch(e => { console.error(e); return { data: [] }; });
      setConversations(response.data || []);
    } catch (error) {
      console.error("Gagal mengambil percakapan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleOpenNewChatModal = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser.id) return;

    setShowNewChatModal(true);
    setModalLoading(true);
    setModalSearchQuery("");
    setMutualFriendsList([]);

    try {
      const [followersRes, followingRes] = await Promise.all([
        userApi.get("/user/followers", { params: { user_id: currentUser.id } }).catch(e => { console.error(e); return { data: [] }; }),
        userApi.get("/user/following", { params: { user_id: currentUser.id } }).catch(e => { console.error(e); return { data: [] }; })
      ]);
      
      const followers = followersRes.data || [];
      const following = followingRes.data || [];
      
      // Filter mutual connections (saling follow)
      const mutual = followers.filter(f => {
        const fId = f.id || f._id;
        return following.some(fol => (fol.id || fol._id) === fId);
      });
      setMutualFriendsList(mutual);
    } catch (error) {
      console.error("Gagal memuat teman mutual:", error);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen relative bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        
        {/* Title & Trigger Button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pesan Masuk</h1>
            <p className="text-sm text-slate-500 mt-1">Lanjutkan percakapan dengan teman dan koneksi Anda.</p>
          </div>
          <button
            onClick={handleOpenNewChatModal}
            className="inline-flex items-center gap-2 justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition active:scale-95 shadow cursor-pointer border-none"
          >
            <Plus className="w-4.5 h-4.5" />
            Mulai Obrolan
          </button>
        </div>

        {/* Connected Users */}
        <div className="flex flex-col gap-3">
          {conversations.length === 0 ? (
            <div className="w-full max-w-xl text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center">
              <p className="text-sm text-slate-500 font-medium">Belum ada percakapan aktif.</p>
              <p className="text-xs text-slate-400 mt-1 mb-5">Mulai obrolan baru dengan teman yang saling mengikuti.</p>
              <button
                onClick={handleOpenNewChatModal}
                className="inline-flex items-center gap-2 justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition active:scale-95 shadow cursor-pointer border-none"
              >
                <Plus className="w-4 h-4" />
                Mulai Obrolan Baru
              </button>
            </div>
          ) : (
            conversations.map((conv) => {
              const partnerId = conv.partner_id;
              const avatar = conv.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
              return (
                <div
                  key={partnerId}
                  className="max-w-xl flex gap-4 p-5 bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition rounded-2xl items-center"
                >
                  <img
                    src={avatar}
                    alt={conv.username}
                    className="rounded-full w-12 h-12 border border-slate-100 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 truncate">{conv.full_name || conv.username || "Tanpa Nama"}</p>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                        {moment(conv.created_at).fromNow()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold">@{conv.username || "username"}</p>
                    <p className="text-xs text-slate-500 mt-2 truncate font-medium">
                      {conv.media_url ? (
                        <span className="text-indigo-600 font-semibold flex items-center gap-1">📷 Mengirim gambar</span>
                      ) : (
                        conv.message_text || "Tidak ada pesan"
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2.5 ml-4">
                    <button
                      onClick={() => navigate(`/messages/${partnerId}`)}
                      title="Buka Chat"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/profile/${partnerId}`)}
                      title="Lihat Profil"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* NEW CHAT MODAL COMPONENT */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Mulai Obrolan Baru</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar inside Modal */}
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari teman saling follow..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50"
                />
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
              {modalLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin"></div>
                </div>
              ) : mutualFriendsList.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-10 font-medium">
                  Belum memiliki koneksi saling mengikuti (mutual).
                </p>
              ) : (
                (() => {
                  const filtered = mutualFriendsList.filter(friend => {
                    const q = modalSearchQuery.toLowerCase();
                    const u = (friend.username || "").toLowerCase();
                    const f = (friend.full_name || "").toLowerCase();
                    return u.includes(q) || f.includes(q);
                  });
                  if (filtered.length === 0) {
                    return <p className="text-slate-500 text-xs text-center py-10 font-medium">Tidak ada hasil cocok.</p>;
                  }
                  return filtered.map((friend) => {
                    const id = friend.id || friend._id;
                    const avatar = friend.avatar_url || friend.profile_picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                    return (
                      <div
                        key={id}
                        onClick={() => {
                          setShowNewChatModal(false);
                          const exists = conversations.some(conv => conv.partner_id === id);
                          if (exists) {
                            // Immediately redirect or activate that chat window
                            navigate(`/messages/${id}`);
                          } else {
                            // Initialize a temporary or blank chat window state with that user's info as active receiver
                            navigate(`/messages/${id}`, { state: { newChatPartner: friend } });
                          }
                        }}
                        className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition cursor-pointer"
                      >
                        <img
                          src={avatar}
                          alt={friend.username}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {friend.full_name || friend.username || "Tanpa Nama"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            @{friend.username || "username"}
                          </p>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-full transition cursor-pointer border-none bg-transparent"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;