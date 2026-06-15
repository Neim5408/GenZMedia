import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";
import { assets } from "../assets/assets";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMessages from "../components/RecentMessages";
import { postApi, userApi } from "../utils/api";

const Feed = () => {
    const [feeds, setFeeds] = useState([]);
    const [usersMap, setUsersMap] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchFeeds = async () => {
        try {
            const res = await postApi.get('/post/feeds');
            const posts = res.data || [];
            
            // Ambil semua unique user_id dari list postingan
            const uniqueUserIds = [...new Set(posts.map(post => post.user_id).filter(Boolean))];
            
            // Ambil data profil dari masing-masing user secara paralel
            const profiles = {};
            await Promise.all(
                uniqueUserIds.map(async (userId) => {
                    try {
                        const userRes = await userApi.get(`/user/${userId}`);
                        profiles[userId] = userRes.data;
                    } catch (err) {
                        console.error(`Gagal memuat profil user ${userId}:`, err);
                        profiles[userId] = {
                            full_name: "InSight User",
                            username: "user",
                            avatar_url: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        };
                    }
                })
            );
            
            setUsersMap(profiles);
            setFeeds(posts);
        } catch (err) {
            console.error("Gagal mengambil feed postingan:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeds();
    }, []);

    return !loading ? (
        <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
            {/* Stories and post list */}
            <div className="w-full max-w-6xl px-4 sm:px-6">
                <StoriesBar />
                <div className="p-4 space-y-6">
                    {feeds.length === 0 ? (
                        <p className="text-gray-500 text-center py-10 font-medium">Belum ada postingan dari akun mana pun.</p>
                    ) : (
                        feeds.map((post) => (
                            <PostCard key={post.id || post._id} post={post} authorProfile={usersMap[post.user_id]}/>
                        ))
                    )}
                </div>
            </div>

            {/* Right sidebar */}
            <div className="max-xl:hidden sticky top-0">
                <div className="w-[450px] bg-white text-sm p-4 rounded-md flex flex-col gap-3 shadow">
                    <h3 className="text-slate-800 font-semibold">Sponsored</h3>
                    <img src={assets.sponsored_img} className="w-full h-52 object-cover rounded-md" alt=""/>
                    <p className="text-slate-600">Email Marketing</p>
                    <p className="text-slate-400">Supercharge your marketing with a powerful, easy-to-use platform built for results.</p>
                </div>
                <RecentMessages />
            </div>
        </div>
    ) : <Loading />
};

export default Feed;