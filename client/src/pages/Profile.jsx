import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import { userApi, postApi } from "../utils/api";
import Loading from "../components/Loading";
import PostCard from "../components/PostCard";
import UserProfileInfo from "../components/UserProfileInfo";
import Swal from "sweetalert2"; 
import EditProfileModal from "../components/EditProfileModal";
import { X } from "lucide-react";

const Profile = () => {
    // profileId ini didapat dari URL
    const { profileId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [showEdit, setShowEdit] = useState(false);

    // Modal connections states
    const [showConnectionsModal, setShowConnectionsModal] = useState(false);
    const [modalType, setModalType] = useState("followers"); // "followers" or "following"
    const [modalData, setModalData] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    // Ambil data user yang sedang login dari localStorage
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Jika di URL tidak ada profileId, berarti user sedang membuka profilnya sendiri
    const targetId = profileId || currentUser?.id;

    const fetchProfileData = async () => {
        if (!targetId) return;

        try {
            // 1. Panggil data profil dasar dari User Service
            const userRes = await userApi.get(`/user/${targetId}`);

            // 2. Panggil data network (Followers & Following) agar UserProfileInfo tidak crash
            let followersData = [];
            let followingData = [];
            try {
                const networkRes = await userApi.get(`/user/${targetId}/network`);
                followersData = networkRes.data.followers || [];
                followingData = networkRes.data.following || [];
            } catch (err) {
                console.log("Gagal memuat data jaringan (follow):", err);
            }

            // Gabungkan data profil dengan data follow, lalu set ke State
            setUser({
                ...userRes.data,
                followers: followersData,
                following: followingData
            });

            // 3. Panggil data postingan dari Post Service
            try {
                const postsRes = await postApi.get(`/post/user/${targetId}`);
                setPosts(postsRes.data);
            } catch (err) {
                console.log("Belum ada postingan atau endpoint belum siap", err);
                setPosts([]);
            }

        } catch (error) {
            console.error("Gagal memuat profil:", error);
            Swal.fire({
                title: 'Oops...',
                text: 'Gagal memuat data profil',
                icon: 'error',
                confirmButtonColor: '#1e1b4b'
            });
        }
    };

    const handleOpenConnectionsModal = async (type) => {
        setModalType(type);
        setShowConnectionsModal(true);
        setModalLoading(true);
        setModalData([]);

        try {
            const endpoint = type === "followers" ? "/user/followers" : "/user/following";
            const response = await userApi.get(endpoint, {
                params: { user_id: targetId }
            });
            setModalData(response.data || []);
        } catch (error) {
            console.error(`Gagal mengambil data ${type}:`, error);
            Swal.fire({
                title: "Error",
                text: `Gagal memuat daftar ${type === "followers" ? "pengikut" : "yang diikuti"}.`,
                icon: "error",
                confirmButtonColor: "#1e1b4b"
            });
        } finally {
            setModalLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [targetId]);

    return user ? (
        <div className='relative h-full overflow-y-scroll bg-gray-50 p-6'>
            <div className='max-w-3xl mx-auto'>
              {/* Profile Card */}
              <div className='bg-white rounded-2xl shadow overflow-hidden'>
                {/* Cover Photo */}
                <div
                  className='h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-cover bg-center'
                  style={{ backgroundImage: user.cover_photo_url ? `url(${user.cover_photo_url})` : undefined }}
                >
                </div>
                {/* User Info Component */}
                <UserProfileInfo 
                    user={user} 
                    posts={posts} 
                    profileId={targetId} 
                    setShowEdit={setShowEdit} 
                    onFollowersClick={() => handleOpenConnectionsModal("followers")}
                    onFollowingClick={() => handleOpenConnectionsModal("following")}
                />
              </div>

              {/* Tabs */}
              <div className='mt-6'>
                <div className='bg-white rounded-xl shadow p-1 flex max-w-md mx-auto'>
                  {['posts', 'media', 'likes'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Posts */}
                {activeTab === 'posts' && (
                  <div className='mt-6 flex flex-col items-center gap-6'>
                    {posts.length > 0 ? (
                        /* PENTING: Meneruskan authorProfile={user} ke PostCard */
                        posts.map((post) => <PostCard key={post.id} post={post} authorProfile={user} />)
                    ) : (
                        <p className="text-gray-500 mt-4">Belum ada postingan.</p>
                    )}
                  </div>
                )}

                {/* Media */}
                {activeTab === 'media' && (
                  <div className='flex flex-wrap mt-6 max-w-6xl gap-4 justify-center'>
                    {/* Sesuaikan dengan kolom media_url dan created_at di PostgreSQL */}
                    {posts.filter((post) => post.media_url).length > 0 ? (
                        posts.filter((post) => post.media_url).map((post) => {
                            const mediaType = post.media_type || (() => {
                                const ext = post.media_url?.split('?')[0].split('.').pop().toLowerCase();
                                return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext) ? 'video' : 'image';
                            })();

                            return (
                                <Link target='_blank' to={post.media_url} key={post.id} className='relative group'>
                                    {mediaType === 'video' ? (
                                        <video
                                            src={post.media_url}
                                            controls
                                            className='w-64 aspect-video object-cover rounded-lg shadow-sm'
                                        />
                                    ) : (
                                        <img src={post.media_url} className='w-64 aspect-video object-cover rounded-lg shadow-sm' alt='Media' />
                                    )}
                                    <p className='absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300'>
                                        Posted {moment(post.created_at).fromNow()}
                                    </p>
                                </Link>
                            );
                        })
                    ) : (
                        <p className="text-gray-500 mt-4">Belum ada media/foto.</p>
                    )}
                  </div>
                )}

              </div>
            </div>
            
            {/* --- Bagian Edit Profil --- */}
            {showEdit && (
                <EditProfileModal 
                    user={user}                       
                    onClose={() => setShowEdit(false)} 
                    refreshData={fetchProfileData}   
                />
            )}

            {/* Modal Followers/Following */}
            {showConnectionsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header Modal */}
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
                                {modalType === "followers" ? "Followers" : "Following"}
                            </h3>
                            <button
                                onClick={() => setShowConnectionsModal(false)}
                                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* List Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/20">
                            {modalLoading ? (
                                <div className="py-12 flex justify-center">
                                    <div className="w-8 h-8 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin"></div>
                                </div>
                            ) : modalData.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-10 font-medium">
                                    {modalType === "followers" 
                                        ? "Belum memiliki pengikut." 
                                        : "Belum mengikuti siapapun."}
                                </p>
                            ) : (
                                modalData.map((item) => {
                                    const id = item.id || item._id;
                                    const avatar = item.avatar_url || item.profile_picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                                    return (
                                        <div 
                                            key={id}
                                            onClick={() => {
                                                setShowConnectionsModal(false);
                                                navigate(`/profile/${id}`);
                                            }}
                                            className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition cursor-pointer"
                                        >
                                            <img 
                                                src={avatar} 
                                                alt={item.username} 
                                                className="w-11 h-11 rounded-full object-cover border border-slate-200"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">
                                                    {item.full_name || item.username || "Tanpa Nama"}
                                                </p>
                                                <p className="text-xs text-slate-400 font-semibold">
                                                    @{item.username || "username"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Modal */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setShowConnectionsModal(false)}
                                className="px-5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-full transition cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    ) : (<Loading />);
};

export default Profile;