import React from "react";
import { Edit2, MapPin, Calendar, BadgeCheck } from "lucide-react";
import moment from "moment";

const UserProfileInfo = ({ user, posts, profileId, setShowEdit, onFollowersClick, onFollowingClick }) => {
    // 1. Ambil data user yang sedang login dari brankas browser
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    
    // 2. Cek apakah profil yang sedang dilihat ini adalah profilnya sendiri
    const isOwnProfile = currentUser && currentUser.id === user.id;

    return (
        <div className="px-6 pb-6 relative">
            {/* --- Baris Avatar dan Tombol Edit --- */}
            <div className="flex justify-between items-end -mt-16 mb-4">
                
                {/* Foto Avatar */}
                <div className="relative">
                    <img 
                        src={user.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                        alt="Avatar" 
                        className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                    />
                </div>
                
                {/* Tombol Edit Profil (Muncul kalau profil sendiri) atau Follow (Kalau profil orang lain) */}
                <div className="mb-2">
                    {isOwnProfile ? (
                        <button 
                            onClick={() => setShowEdit(true)} 
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full font-bold hover:bg-indigo-100 transition shadow-sm cursor-pointer border border-indigo-200"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit Profil</span>
                        </button>
                    ) : (
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition shadow-sm cursor-pointer">
                            Follow
                        </button>
                    )}
                </div>
            </div>

            {/* --- Info Utama: Nama dan Username --- */}
            <div className="mb-4">
                <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-1.5">
                    {user.full_name}
                    <BadgeCheck className="w-5 h-5 text-blue-500" /> {/* Centang Biru */}
                </h1>
                <p className="text-gray-500 font-medium">@{user.username}</p>
            </div>

            {/* --- Bio --- */}
            <div className="mb-4">
                <p className="text-gray-800 leading-relaxed">
                    {user.bio || "Halo, saya pengguna baru InSight!"}
                </p>
            </div>

            {/* --- Meta Info: Lokasi dan Tanggal Bergabung --- */}
            <div className="flex items-center gap-6 text-gray-500 text-sm mb-6 font-medium">
                <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>Add location</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {moment(user.created_at).fromNow()}</span>
                </div>
            </div>

            {/* Garis Pemisah Tipis */}
            <hr className="border-gray-100 mb-4" />

            {/* --- Statistik: Posts, Followers, Following --- */}
            <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
                    <span className="font-bold text-gray-900 text-base">{posts ? posts.length : 0}</span>
                    <span className="text-gray-500">Posts</span>
                </div>
                <div onClick={onFollowersClick} className="flex items-center gap-1.5 cursor-pointer hover:underline">
                    <span className="font-bold text-gray-900 text-base">{user.followers ? user.followers.length : 0}</span>
                    <span className="text-gray-500">Followers</span>
                </div>
                <div onClick={onFollowingClick} className="flex items-center gap-1.5 cursor-pointer hover:underline">
                    <span className="font-bold text-gray-900 text-base">{user.following ? user.following.length : 0}</span>
                    <span className="text-gray-500">Following</span>
                </div>
            </div>
        </div>
    );
};

export default UserProfileInfo;
