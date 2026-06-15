import React, { useState, useEffect } from "react";
import { Users, UserPlus, UserCheck, UserRoundPen, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userApi, notificationApi } from "../utils/api";
import Loading from "../components/Loading";
import Swal from "sweetalert2";

const Connections = () => {
  const [currentTab, setCurrentTab] = useState("Followers");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchConnections = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [followersRes, followingRes] = await Promise.all([
        userApi.get("/user/followers", { params: { user_id: currentUser.id } }).catch(e => { console.error(e); return { data: [] }; }),
        userApi.get("/user/following", { params: { user_id: currentUser.id } }).catch(e => { console.error(e); return { data: [] }; })
      ]);
      setFollowers(followersRes.data || []);
      setFollowing(followingRes.data || []);
    } catch (error) {
      console.error("Gagal mengambil data koneksi:", error);
      Swal.fire({
        title: "Error",
        text: "Gagal memuat data koneksi.",
        icon: "error",
        confirmButtonColor: "#1e1b4b"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleFollow = async (targetUserId) => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser.id) return;

    try {
      await userApi.post("/user/follow", {
        follower_id: currentUser.id,
        following_id: targetUserId
      });

      // Kirim notifikasi FOLLOW ke penerima
      try {
        await notificationApi.post('/notification', {
          user_id: targetUserId,
          type: 'FOLLOW',
          reference_id: currentUser.id
        });
      } catch (notificationError) {
        console.error("Gagal mengirim notifikasi follow:", notificationError);
      }

      Swal.fire({
        title: "Berhasil",
        text: "Berhasil mengikuti pengguna.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
      await fetchConnections();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Gagal",
        text: error.response?.data?.error || "Gagal memproses permintaan.",
        icon: "error",
        confirmButtonColor: "#1e1b4b"
      });
    }
  };

  const handleUnfollow = async (targetUserId) => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser.id) return;

    const confirm = await Swal.fire({
      title: "Unfollow Pengguna?",
      text: "Kamu tidak akan lagi melihat postingan pengguna ini.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Unfollow",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b"
    });

    if (!confirm.isConfirmed) return;

    try {
      await userApi.post("/user/unfollow", {
        follower_id: currentUser.id,
        following_id: targetUserId
      });
      Swal.fire({
        title: "Berhasil",
        text: "Berhasil berhenti mengikuti.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
      await fetchConnections();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Gagal",
        text: error.response?.data?.error || "Gagal memproses permintaan.",
        icon: "error",
        confirmButtonColor: "#1e1b4b"
      });
    }
  };

  // Filter lists:
  // Followers: people who follow me
  // Following: people I follow
  // Pending: people who follow me, whom I haven't followed back yet
  // Connections: mutual follows (we follow each other)
  const pendingConnections = followers.filter(
    (f) => !following.some((fol) => fol.id === f.id)
  );
  const mutualConnections = followers.filter(
    (f) => following.some((fol) => fol.id === f.id)
  );

  const dataArray = [
    { label: "Followers", value: followers, icon: Users },
    { label: "Following", value: following, icon: UserCheck },
    { label: "Pending", value: pendingConnections, icon: UserRoundPen },
    { label: "Connections", value: mutualConnections, icon: UserPlus }
  ];

  if (loading) return <Loading />;

  const currentTabData = dataArray.find((item) => item.label === currentTab);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Koneksi Saya</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola pertemanan dan lihat jaringan pengikut Anda secara langsung.</p>
        </div>

        {/* Counts Cards */}
        <div className="mb-8 flex flex-wrap gap-6">
          {dataArray.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center gap-1 border h-20 w-40 border-slate-200 bg-white shadow-sm hover:shadow transition rounded-2xl"
            >
              <b className="text-xl text-slate-800">{item.value.length}</b>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs navigation */}
        <div className="inline-flex flex-wrap items-center border border-slate-200 rounded-xl p-1 bg-white shadow-sm">
          {dataArray.map((tab) => (
            <button
              onClick={() => setCurrentTab(tab.label)}
              key={tab.label}
              className={`flex items-center px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentTab === tab.label
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <tab.icon className="w-4 h-4 mr-1.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Connections List */}
        <div className="flex flex-wrap gap-6 mt-6">
          {currentTabData.value.length === 0 ? (
            <div className="w-full text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">Tidak ada koneksi ditemukan untuk kategori ini.</p>
            </div>
          ) : (
            currentTabData.value.map((user) => {
              const id = user.id || user._id;
              const avatar = user.avatar_url || user.profile_picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
              return (
                <div
                  key={id}
                  className="w-full max-w-sm flex gap-5 p-5 bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition rounded-2xl items-center"
                >
                  <img
                    src={avatar}
                    alt={user.username}
                    className="rounded-full w-14 h-14 shadow-sm border border-slate-100 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{user.full_name || user.username || "Tanpa Nama"}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">@{user.username || "username"}</p>
                    <p className="text-xs text-slate-500 mt-1.5 truncate">
                      {user.bio || "Halo! Saya pengguna InSight."}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/profile/${id}`)}
                        className="w-full py-1.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
                      >
                        Profil
                      </button>
                      {currentTab === "Following" && (
                        <button
                          onClick={() => handleUnfollow(id)}
                          className="w-full py-1.5 text-xs font-bold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer border border-red-100"
                        >
                          Unfollow
                        </button>
                      )}
                      {currentTab === "Pending" && (
                        <button
                          onClick={() => handleFollow(id)}
                          className="w-full py-1.5 text-xs font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition cursor-pointer border border-indigo-100"
                        >
                          Ikuti Balik
                        </button>
                      )}
                      {currentTab === "Connections" && (
                        <button
                          onClick={() => navigate(`/messages/${id}`)}
                          className="w-full py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer flex items-center justify-center gap-1 border border-slate-200"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default Connections;