import React, { useState, useEffect } from "react"; // Tambahkan useEffect
import { assets, dummyUserData } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";
import { LogOut, CirclePlus, Users, ShieldAlert } from "lucide-react"; // Sesuaikan icon
import Swal from 'sweetalert2';
import { authApi, userApi } from "../utils/api"; // Tambahkan userApi

const Sidebar = ({ sidebarOpen, setSidebarOpen, unreadCount }) => {
  const navigate = useNavigate();
  
  // 1. Ambil data dasar dari Local Storage
  const storedUser = localStorage.getItem('user');
  const initialUser = storedUser ? JSON.parse(storedUser) : dummyUserData;

  // 2. Buat State untuk menampung data profil yang paling update
  const [userData, setUserData] = useState(initialUser);

  // --- MENGAMBIL DATA TERBARU DARI DATABASE ---
  useEffect(() => {
    const fetchLatestData = async () => {
      if (initialUser?.role === 'admin') return; // Admin tidak punya profil di User Service
      if (initialUser?.id) {
        try {
          const response = await userApi.get(`/user/${initialUser.id}`);
          setUserData({ ...response.data, role: initialUser.role });
          localStorage.setItem('user', JSON.stringify({ ...response.data, role: initialUser.role })); 
        } catch (error) {
          console.error("Gagal memuat profil untuk sidebar:", error);
        }
      }
    };
    
    fetchLatestData();
  }, [initialUser?.id, initialUser?.role]); // Akan dijalankan ulang kalau ID user berubah


  const handleLogout = async () => {
    const result = await Swal.fire({
        title: 'Yakin mau keluar?',
        text: "Sesi kamu akan diakhiri.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33', 
        cancelButtonColor: '#1e1b4b',
        confirmButtonText: 'Ya, Keluar!',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        try {
            await authApi.post('/auth/logout');
        } catch (error) {
            console.error("Gagal menghapus session di server:", error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            Swal.fire({
                title: 'Logged Out!',
                text: 'Kamu berhasil keluar dengan aman.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                navigate('/login');
            });
        }
    }
  };

  return (
    <div
      className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${
        sidebarOpen ? "translate-x-0" : "max-sm:-translate-x-full"
      } transition-all duration-300 ease-in-out`}
    >
      <div className="w-full">
        <img onClick={() => navigate("/")} src={assets.logo} className="w-26 ml-7 my-2 cursor-pointer" alt="" />
        <hr className="border-gray-300 mb-8"/>

        {userData?.role === 'admin' ? (
          <div className="px-6 space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Admin Panel</p>
            <Link 
              to='/admin' 
              className='flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 transition text-white cursor-pointer font-medium shadow-sm'
              onClick={() => setSidebarOpen(false)}
            >
              <ShieldAlert className="w-5 h-5" />
              <span>Dashboard Utama</span>
            </Link>
          </div>
        ) : (
          <>
            <MenuItems setSidebarOpen={setSidebarOpen} unreadCount={unreadCount} />

            <Link to='/create-post' className='flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 transition text-white cursor-pointer'>
              <CirclePlus className="w-5 h-5" />
              Create Post
            </Link>
          </>
        )}
      </div>

      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div className="flex gap-2 items-center cursor-pointer">
          
          {/* MENGGUNAKAN DATA userData YANG SUDAH DI-UPDATE DARI DATABASE */}
          <img 
            src={userData.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
            alt="Profile" 
            className="w-9 h-9 rounded-full object-cover border border-gray-200"
          />
          
          <div>
            <h1 className="text-sm font-medium">{userData.full_name || userData.email}</h1>
            <p className="text-xs text-gray-500">@{userData.username || "user"}</p>
          </div>
        </div>
        
        <LogOut onClick={handleLogout} className="w-4.5 text-gray-400 hover:text-red-500 transition cursor-pointer" />
      </div>

    </div>
  );
};

export default Sidebar;