import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";
import { dummyPostsData, assets } from "../assets/assets";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMessages from "../components/RecentMessages";
import { postApi } from "../utils/api";

import { useSocket } from "../utils/SocketContext";

const Feed = () => {
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const { notifSocket } = useSocket();

    const fetchFeeds = async () => {
        try {
            const res = await postApi.get('/post/feeds');
            if (res.data && res.data.length > 0) {
                setFeeds(res.data);
            } else {
                setFeeds(dummyPostsData);
            }
        } catch (error) {
            console.error("Gagal mengambil feeds dari API, menggunakan dummy data:", error);
            setFeeds(dummyPostsData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeds();
    }, []);

    useEffect(() => {
        if (!notifSocket) return;

        const handleNewPost = (newPost) => {
            console.log("WebSocket: Menerima postingan baru di Home:", newPost);
            setFeeds(prev => {
                const exists = prev.some(p => (p.id === newPost.id || p._id === newPost._id));
                if (exists) return prev;
                return [newPost, ...prev];
            });
        };

        const handleDeletePost = (data) => {
            console.log("WebSocket: Postingan dihapus:", data.postId);
            setFeeds(prev => prev.filter(p => (p.id !== data.postId && p._id !== data.postId)));
        };

        notifSocket.on('newPost', handleNewPost);
        notifSocket.on('deletePost', handleDeletePost);
        return () => {
            notifSocket.off('newPost', handleNewPost);
            notifSocket.off('deletePost', handleDeletePost);
        };
    }, [notifSocket]);

    return !loading ? (
        <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
            {/* Stories and post list */}
            <div className="w-full max-w-6xl px-4 sm:px-6">
                <StoriesBar />
                <div className="p-4 space-y-6">
                    {feeds.map((post, index) => (
                        <PostCard key={post.id || post._id || index} post={post}/>
                    ))}
                </div>
            </div>

            {/* Right sidebar */}
            <div className="max-xl:hidden sticky top-0">
                <div className="w-[450px] bg-white text-sm p-4 rounded-md flex flex-col gap-3 shadow">
                    <h3 className="text-slate-800 font-semibold">Sponsored</h3>
                    <img src={assets.sponsored_img} className="w-full h-52 object-cover rounded-md" alt=""/>
                    <p className="text-slate-600">Genshin Impact</p>
                    <p className="text-slate-400">Expansive fantasy worlds, vibrant anime visuals, and magical symphonies create breathtaking immersion.</p>
                </div>
                <RecentMessages />
            </div>
        </div>
    ) : <Loading />
};

export default Feed;