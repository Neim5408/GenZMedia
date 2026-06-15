import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, UserPlus, Trash2, Check } from "lucide-react";
import { notificationApi, userApi, postApi } from "../utils/api";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import Swal from "sweetalert2";
import moment from "moment";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [senders, setSenders] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await notificationApi.get("/notification", {
        params: { user_id: currentUser.id }
      }).catch(e => { console.error(e); return { data: [] }; });
      const data = response.data || [];

      // Fetch sender profiles for each unique reference_id
      const uniqueSenderIds = [...new Set(data.map((n) => n.reference_id).filter(Boolean))];
      const profilesMap = {};
      await Promise.all(
        uniqueSenderIds.map(async (senderId) => {
          try {
            const profileRes = await userApi.get(`/user/${senderId}`);
            profilesMap[senderId] = profileRes.data;
          } catch (err) {
            console.error("Gagal memuat profil pengirim:", senderId, err);
            profilesMap[senderId] = {
              full_name: "InSight User",
              username: "user",
              avatar_url: ""
            };
          }
        })
      );

      setSenders(profilesMap);
      setNotifications(data);
    } catch (error) {
      console.error("Gagal memuat notifikasi:", error);
      Swal.fire({
        title: "Error",
        text: "Gagal memuat notifikasi.",
        icon: "error",
        confirmButtonColor: "#1e1b4b"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.put(`/notification/read/${notificationId}`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error("Gagal menandai dibaca:", error);
    }
  };

  const handleNotificationClick = async (notif) => {
    // 1. Tandai sebagai dibaca jika belum dibaca
    if (!notif.is_read) {
      try {
        await notificationApi.put(`/notification/read/${notif.id}`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      } catch (error) {
        console.error("Gagal menandai dibaca:", error);
      }
    }

    // 2. Arahkan navigasi berdasarkan tipe notifikasi
    const typeUpper = (notif.type || "").toUpperCase();
    if (typeUpper === "CHAT" && notif.reference_id) {
      navigate(`/messages/${notif.reference_id}`);
    } else if (typeUpper === "FOLLOW" && notif.reference_id) {
      navigate(`/profile/${notif.reference_id}`);
    } else if (typeUpper === "COMMENT") {
      if (notif.post_id) {
        try {
          const postRes = await postApi.get(`/post/${notif.post_id}`);
          if (postRes.data && postRes.data.user_id) {
            navigate(`/profile/${postRes.data.user_id}#post-${notif.post_id}`);
          } else {
            navigate(`/#post-${notif.post_id}`);
          }
        } catch (err) {
          console.error("Gagal mengambil detail postingan, fallback ke Feed:", err);
          navigate(`/#post-${notif.post_id}`);
        }
      } else if (notif.reference_id) {
        navigate(`/profile/${notif.reference_id}`);
      }
    } else if (typeUpper === "LIKE") {
      if (notif.post_id) {
        try {
          const postRes = await postApi.get(`/post/${notif.post_id}`);
          if (postRes.data && postRes.data.user_id) {
            navigate(`/profile/${postRes.data.user_id}#post-${notif.post_id}`);
          } else {
            navigate(`/#post-${notif.post_id}`);
          }
        } catch (err) {
          console.error("Gagal mengambil detail postingan, fallback ke Feed:", err);
          navigate(`/#post-${notif.post_id}`);
        }
      } else if (notif.reference_id) {
        navigate(`/profile/${notif.reference_id}`);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser.id) return;

    try {
      await notificationApi.put("/notification/read-all", {
        user_id: currentUser.id
      });
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      Swal.fire({
        title: "Berhasil",
        text: "Semua notifikasi ditandai telah dibaca.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Gagal",
        text: "Gagal menandai semua sebagai dibaca.",
        icon: "error",
        confirmButtonColor: "#1e1b4b"
      });
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationApi.delete(`/notification/${notificationId}`);
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: 'success',
        title: 'Notifikasi berhasil dihapus'
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Gagal",
        text: "Gagal menghapus notifikasi.",
        icon: "error",
        confirmButtonColor: "#1e1b4b"
      });
    }
  };

  const getNotificationDetails = (notif) => {
    const typeUpper = (notif.type || "").toUpperCase();
    const sender = senders[notif.reference_id] || {
      full_name: "InSight User",
      username: "user",
      avatar_url: ""
    };

    let icon = null;
    let description = "";

    switch (typeUpper) {
      case "LIKE":
        icon = <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
        description = "liked your post.";
        break;
      case "COMMENT":
        icon = <MessageCircle className="w-4 h-4 text-blue-500" />;
        description = "commented on your post.";
        break;
      case "FOLLOW":
        icon = <UserPlus className="w-4 h-4 text-indigo-500" />;
        description = "started following you.";
        break;
      case "CHAT":
        icon = <MessageCircle className="w-4 h-4 text-emerald-500" />;
        description = "sent you a private message.";
        break;
      default:
        icon = <MessageCircle className="w-4 h-4 text-gray-500" />;
        description = "interacted with your profile.";
        break;
    }

    return { sender, icon, description };
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-55 p-4 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Notifikasi
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount} notifikasi baru belum dibaca
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full transition text-xs font-bold shadow cursor-pointer active:scale-95"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const { sender, icon, description } = getNotificationDetails(notification);
              const avatar = sender.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white rounded-2xl border border-slate-200 p-4 transition-all duration-200 flex gap-4 items-start ${
                    !notification.is_read ? "border-l-4 border-l-indigo-600 shadow" : "shadow-sm"
                  } hover:shadow-md cursor-pointer`}
                >
                  {/* Avatar & Icon overlap */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={avatar}
                      alt={sender.full_name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-100"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-slate-100 shadow-sm flex items-center justify-center">
                      {icon}
                    </div>
                  </div>

                  {/* Content block */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-800">
                          {sender.full_name || sender.username || "InSight User"}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {description}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap ml-2">
                        {moment(notification.created_at).fromNow()}
                      </span>
                    </div>

                    {/* Action buttons inside card */}
                    <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                      {!notification.is_read ? (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded-full transition cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          Mark read
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 px-3 py-1 border border-slate-100 bg-slate-50 rounded-full select-none flex items-center gap-1">
                          <Check className="w-3 h-3 text-slate-400" />
                          Read
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="flex items-center justify-center p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition ml-auto cursor-pointer"
                        title="Hapus Notifikasi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Tidak ada notifikasi baru.
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Semua info terupdate akan muncul di sini. Anda sudah membaca semua kabar terbaru!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
