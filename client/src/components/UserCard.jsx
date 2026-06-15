<<<<<<< HEAD
import React, { useState } from "react";
import { MapPin, MessageCircle, Plus, UserPlus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../utils/api";
import Swal from "sweetalert2";

const UserCard = ({ user, initialIsFollowing }) => {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    // State lokal untuk mengatur Follow/Unfollow instan tanpa perlu reload halaman
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [followersCount, setFollowersCount] = useState(parseInt(user.followers_count) || 0);
    const [loadingBtn, setLoadingBtn] = useState(false);

    // Fungsi canggih untuk toggle (Follow jika belum, Unfollow jika sudah)
    const handleFollowToggle = async () => {
        setLoadingBtn(true);
        try {
            if (isFollowing) {
                // Proses Unfollow
                await userApi.delete('/user/unfollow', {
                    data: { follower_id: currentUser.id, following_id: user.id }
                });
                setIsFollowing(false);
                setFollowersCount(prev => prev - 1);
            } else {
                // Proses Follow
                await userApi.post('/user/follow', {
                    follower_id: currentUser.id,
                    following_id: user.id
                });
                setIsFollowing(true);
                setFollowersCount(prev => prev + 1);
            }
        } catch (error) {
            Swal.fire("Oops", error.response?.data?.error || "Gagal mengubah status pertemanan", "error");
        } finally {
            setLoadingBtn(false);
        }
    };

    const handleConnectionRequest = () => {
        // Arahkan ke pesan jika mau
        navigate(`/messages/${user.id}`);
    };

    return (
        <div className="p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-2xl bg-white hover:shadow-lg transition">
            
            {/* Bagian Profil (Bisa di-klik untuk melihat profil) */}
            <div className="text-center cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
                <img 
                    src={user.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                    alt="avatar" 
                    className="rounded-full w-20 h-20 object-cover shadow-sm mx-auto border-2 border-gray-100" 
                />
                <p className="mt-4 font-bold text-gray-900">{user.full_name}</p>
                <p className="text-gray-500 text-sm font-medium">@{user.username}</p>
                
                <p className="text-gray-600 mt-3 text-center text-sm px-2 line-clamp-2 min-h-[40px]">
                    {user.bio || "Halo, saya menggunakan InSight!"}
                </p>
            </div>

            {/* Statistik */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600 font-medium">
                <div className="flex items-center gap-1 border border-gray-200 bg-gray-50 rounded-full px-3 py-1">
                    <MapPin className="w-3.5 h-3.5"/> Earth
                </div>
                <div className="flex items-center gap-1 border border-gray-200 bg-gray-50 rounded-full px-3 py-1">
                    <span className="font-bold text-gray-900">{followersCount}</span> followers
                </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex mt-5 gap-2">
                {/* Tombol Follow / Unfollow */}
                <button 
                    onClick={handleFollowToggle} 
                    disabled={loadingBtn}
                    className={`w-full py-2.5 rounded-xl flex justify-center items-center gap-2 font-medium transition active:scale-95 ${
                        isFollowing 
                            ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200" 
                            : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                    }`}
                >
                    {loadingBtn ? "Tunggu..." : (
                        isFollowing ? (
                            <><Check className="w-4 h-4 text-green-600"/> Following</>
                        ) : (
                            <><UserPlus className="w-4 h-4"/> Follow</>
                        )
                    )}
                </button>
                
                {/* Tombol Chat */}
                <button 
                    onClick={handleConnectionRequest} 
                    title="Kirim Pesan"
                    className="flex items-center justify-center w-14 border border-gray-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 group rounded-xl cursor-pointer active:scale-95 transition"
                >
                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition"/> 
                </button>
            </div>
        </div>
    );
=======
import React from "react";
import { MapPin, MessageCircle, Plus, User, UserPlus } from "lucide-react";
import { dummyUserData } from "../assets/assets";

const UserCard = ({ user }) => {

        const currentUser = dummyUserData

        const handleFollow = async () => {

        }

        const handleConnectionRequest = async () => {

        }

    return (
        <div key={user._id} className="p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md">
            <div className="text-center">
                <img src={user.profile_picture} alt="" className="rounded-full w-16 shadow-md mx-auto" />
                <p className="mt-4 font-semibold">{user.full_name}</p>
                {user.username && <p className="text-gray-500 font-light">@{user.username}</p>}
                {user.bio && <p className="text-gray-600 mt-2 text-center text-sm px-4">{user.bio}</p>}
            </div>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
                <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
                    <MapPin className="w-4 h-4"/> {user.location}
                </div>
                <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
                    <span>{user.followers.length}</span> followers
                </div>
            </div>

            <div className="flex mt-4 gap-2">
                {/* Follow Button */}
                <button onClick={handleFollow} disabled={currentUser?.following.includes(user._id)} className="w-full py-2 rounded-md flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer">
                    <UserPlus className="w-4 h-4"/> {currentUser?.following.includes(user._id) ? "Following" : "Follow"}
                </button>
                {/* Connection Request Button / Message Button */}
                <button onClick={handleConnectionRequest} className="flex items-center justify-center w-16 border text-slate-500 group rounded-md cursor-pointer active:scale-95 transition">
                    {
                        currentUser?.connections.includes(user._id) ? 
                        <MessageCircle className="w-5 h-5 group-hover:scale-105 transition"/> :
                        <Plus className="w-5 h-5 group-hover:scale-105 transition"/>
                    }
                </button>
            </div>

        </div>
    )
>>>>>>> origin/Kibob_update_home
}

export default UserCard;