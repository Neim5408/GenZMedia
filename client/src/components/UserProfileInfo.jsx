<<<<<<< HEAD
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
=======
import { Calendar, MapPin, PenBox, Verified } from 'lucide-react'
import moment from 'moment'
import React from 'react'

const UserProfileInfo = ({user, posts, profileId, setShowEdit}) => {
  return (
    <div className='relative py-4 px-6 md:px-8 bg-white'>
      <div className='flex flex-col md:flex-row items-start gap-6'>
        
        <div className='w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full bg-white'>
            <img src={user.profile_picture} alt="" className='w-full h-full object-cover rounded-full' />
        </div>

        <div className='w-full pt-16 md:pt-0 md:pl-36'>
            <div className='flex flex-col md:flex-row items-start justify-between'>
                <div>
                  <div className='flex items-center gap-3'>
                      <h1 className='text-2xl font-bold text-gray-900'>{user.full_name}</h1>
                      <Verified className='w-6 h-6 text-blue-500'/>
                  </div>
                  <p className='text-gray-600'>{user.username ? `@${user.username}` : 'Add a username'}</p>
                </div>
                {/* if user is not on others profile that means he is opening his profile so we will show edit button */}
                {!profileId &&
                  <button onClick={() => setShowEdit(true)} className='flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors mt-4 md:mt-0'>
                    <PenBox className='w-4 h-4'/>
                    Edit
                  </button>}
            </div>

            <p className='text-gray-700 text-sm max-w-md mt-4'>{user.bio}</p>

            <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4'>
                <span className='flex items-center gap-1.5'>
                    <MapPin className='w-4 h-4'/>
                    {user.location ? user.location : 'Add location'}
                </span>
                <span className='flex items-center gap-1.5'>
                    <Calendar className='w-4 h-4'/>
                    Joined <span className='font-medium'>{moment(user.createdAt).fromNow()}</span>
                </span>
            </div>

            <div className='flex items-center gap-6 mt-6 border-t border-gray-200 pt-4'>
                <div>
                    <span className='sm:text-xl font-bold text-gray-900'>{posts.length}</span>
                    <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Posts</span>
                </div>
                <div>
                    <span className='sm:text-xl font-bold text-gray-900'>{user.followers.length}</span>
                    <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Followers</span>
                </div>
                <div>
                    <span className='sm:text-xl font-bold text-gray-900'>{user.following.length}</span>
                    <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Following</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  )
}

export default UserProfileInfo
>>>>>>> origin/Kibob_update_home
