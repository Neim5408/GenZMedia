import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";
import { dummyPostsData, assets } from "../assets/assets";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMessages from "../components/RecentMessages";

const Feed = () => {
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFeeds = async () => {
        setFeeds(dummyPostsData);
        setLoading(false);
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
                    {feeds.map((post) => (
                        <PostCard key={post._id} post={post}/>
                    ))}
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