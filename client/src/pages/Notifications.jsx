import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, UserPlus, Trash2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationApi, userApi } from "../utils/api";
import Loading from "../components/Loading";
import Swal from "sweetalert2";
import moment from "moment";

import { useSocket } from "../utils/SocketContext";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [senders, setSenders] = useState({});
  const [loading, setLoading] = useState(true);
  const { notifSocket } = useSocket();

  const groupNotifications = (list) => {
    const grouped = [];
    const likeGroups = {};
    const chatGroups = {};

    list.forEach((notif) => {
      const type = (notif.type || "").toUpperCase();
      if (type === "LIKE" && notif.post_id) {
        if (!likeGroups[notif.post_id]) {
          likeGroups[notif.post_id] = [];
        }
        likeGroups[notif.post_id].push(notif);
      } else if (type === "CHAT" && notif.reference_id) {
        if (!chatGroups[notif.reference_id]) {
          chatGroups[notif.reference_id] = [];
        }
        chatGroups[notif.reference_id].push(notif);
      } else {
        grouped.push(notif);
      }
    });

    // Process like groups
    Object.keys(likeGroups).forEach((postId) => {
      const group = likeGroups[postId];
      group.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const latest = group[0];
      const otherSenderIds = [...new Set(group.map((n) => n.reference_id))].filter(
        (id) => id !== latest.reference_id
      );

      latest.groupedIds = group.map((n) => n.id);
      latest.otherLikesCount = otherSenderIds.length;
      latest.is_read = group.every((n) => n.is_read);

      grouped.push(latest);
    });

    // Process chat groups
    Object.keys(chatGroups).forEach((senderId) => {
      const group = chatGroups[senderId];
      group.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const latest = group[0];

      latest.groupedIds = group.map((n) => n.id);
      latest.otherChatsCount = group.length - 1;
      latest.is_read = group.every((n) => n.is_read);

      grouped.push(latest);
    });

    grouped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return grouped;
  };

  const fetchNotifications = async (silent = false) => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser.id) {
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    try {
      const response = await notificationApi.get("/notification", {
        params: { user_id: currentUser.id }
      }).catch(e => { console.error(e); return { data: [] }; });
      const rawData = response.data || [];
      const data = groupNotifications(rawData);

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
      if (!silent) {
        Swal.fire({
          title: "Error",
          text: "Gagal memuat notifikasi.",
          icon: "error",
          confirmButtonColor: "#1e1b4b"
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(false);
  }, []);

  useEffect(() => {
    if (!notifSocket) return;

    const handleNewNotification = () => {
      fetchNotifications(true);
    };

    notifSocket.on("newNotification", handleNewNotification);
    return () => {
      notifSocket.off("newNotification", handleNewNotification);
    };
  }, [notifSocket]);

  const handleMarkAsRead = async (notifObj) => {
    const ids = notifObj.groupedIds || [notifObj.id];
    try {
      await Promise.all(ids.map((id) => notificationApi.put(`/notification/read/${id}`)));
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notifObj.id ? { ...notif, is_read: true } : notif
        )
      );
      window.dispatchEvent(new Event('unread-count-change'));
    } catch (error) {
      console.error("Gagal menandai dibaca:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification);
    }
    
    const type = (notification.type || "").toUpperCase();
    if (type === "FOLLOW") {
      navigate(`/profile/${notification.reference_id}`);
    } else if (type === "CHAT") {
      navigate(`/messages/${notification.reference_id}`);
    } else if (type === "LIKE" || type === "COMMENT") {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const targetUserId = notification.post_author_id || currentUser.id;
      navigate(`/profile/${targetUserId}`, { state: { highlightPostId: notification.post_id } });
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
      window.dispatchEvent(new Event('unread-count-change'));
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

  const handleDeleteNotification = async (notifObj) => {
    const ids = notifObj.groupedIds || [notifObj.id];
    try {
      await Promise.all(ids.map((id) => notificationApi.delete(`/notification/${id}`)));
      setNotifications((prev) => prev.filter((notif) => notif.id !== notifObj.id));
      window.dispatchEvent(new Event('unread-count-change'));
      
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
        description = notif.otherLikesCount > 0
          ? `and ${notif.otherLikesCount} other${notif.otherLikesCount > 1 ? 's' : ''} liked your post.`
          : "liked your post.";
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
        description = notif.otherChatsCount > 0
          ? `sent you ${notif.otherChatsCount + 1} private messages.`
          : "sent you a private message.";
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
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className={`px-4 py-2 rounded-full transition text-xs font-bold shadow active:scale-95 ${
                unreadCount > 0
                  ? "bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200"
              }`}
            >
              Tandai semua dibaca
            </button>
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
                          onClick={() => handleMarkAsRead(notification)}
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
                        onClick={() => handleDeleteNotification(notification)}
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
