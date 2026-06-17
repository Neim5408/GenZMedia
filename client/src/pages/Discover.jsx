import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react"; // Tambahkan icon X
import UserCard from "../components/UserCard";
import Loading from "../components/Loading";
import { userApi } from "../utils/api";
import { useSocket } from "../utils/SocketContext";

const Discover = () => {
    const [input, setInput] = useState("");
    const [users, setUsers] = useState([]);
    const [followingList, setFollowingList] = useState([]); 
    const [loading, setLoading] = useState(true); 

    const currentUser = JSON.parse(localStorage.getItem('user'));

    const fetchDiscoverData = async (searchQuery = "") => {
        setLoading(true);
        try {
            const searchRes = await userApi.get(`/user/search/all?q=${searchQuery}`);
            const otherUsers = searchRes.data.filter(u => u.id !== currentUser.id);
            setUsers(otherUsers);

            const networkRes = await userApi.get(`/user/${currentUser.id}/network`);
            const followingIds = networkRes.data.following.map(f => f.id);
            setFollowingList(followingIds);
        } catch (error) {
            console.error("Gagal memuat Discover:", error);
        } finally {
            setLoading(false);
        }
    };

    const { notifSocket } = useSocket();

    // --- FITUR LIVE SEARCH (DEBOUNCE) ---
    useEffect(() => {
        // Jangan langsung mencari! Tunggu 500ms setelah user berhenti mengetik
        const delayDebounceFn = setTimeout(() => {
            fetchDiscoverData(input);
        }, 500);

        // Bersihkan timer jika user mengetik lagi sebelum 500ms berlalu
        return () => clearTimeout(delayDebounceFn);
    }, [input]); 

    useEffect(() => {
        if (!notifSocket || !currentUser?.id) return;

        const handleNewFollow = (data) => {
            if (data.follower_id === currentUser.id) {
                if (data.action === "follow") {
                    setFollowingList(prev => {
                        if (prev.includes(data.following_id)) return prev;
                        return [...prev, data.following_id];
                    });
                } else if (data.action === "unfollow") {
                    setFollowingList(prev => prev.filter(id => id !== data.following_id));
                }
            }
        };

        const handleNewUser = (newUser) => {
            if (newUser && newUser.id !== currentUser.id) {
                setUsers(prev => {
                    const exists = prev.some(u => u.id === newUser.id);
                    if (exists) return prev;
                    return [...prev, newUser];
                });
            }
        };

        notifSocket.on("newFollow", handleNewFollow);
        notifSocket.on("newUser", handleNewUser);
        return () => {
            notifSocket.off("newFollow", handleNewFollow);
            notifSocket.off("newUser", handleNewUser);
        };
    }, [notifSocket, currentUser?.id]);
    // Akan otomatis berjalan setiap kali 'input' berubah, tidak perlu menekan Enter lagi!

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-6xl mx-auto p-6">
                
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Discover People</h1>
                    <p className="text-slate-600">Connect with amazing people and grow your network</p>
                </div>

                {/* Search Box */}
                <div className="mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80">
                    <div className="p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"/>
                            <input 
                                type="text" 
                                placeholder="Cari orang berdasarkan nama, username, atau bio..." 
                                className="pl-10 pr-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                onChange={(e) => setInput(e.target.value)} 
                                value={input} 
                            />
                            
                            {/* Tombol Clear / Back (Hanya muncul jika ada teks) */}
                            {input && (
                                <button 
                                    onClick={() => setInput("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Users Grid */}
                {loading ? (
                    <Loading height="50vh"/>
                ) : (
                    <div className="flex flex-wrap gap-6">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <UserCard 
                                    user={user} 
                                    key={user.id} 
                                    initialIsFollowing={followingList.includes(user.id)} 
                                />
                            ))
                        ) : (
                            <p className="text-center w-full text-gray-500 mt-10">Tidak menemukan pengguna dengan kata kunci tersebut.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Discover;