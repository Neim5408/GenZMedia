import { BadgeCheck, X, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { postApi } from "../utils/api";

const StoryViewer = ({viewStory, setViewStory, stories = []}) => { 
    const [progress, setProgress] = useState(0);

    const currentIndex = stories.findIndex(s => (s.id || s._id) === (viewStory?.id || viewStory?._id));

    const handleNext = useCallback(() => {
        if (currentIndex !== -1 && currentIndex < stories.length - 1) {
            setViewStory(stories[currentIndex + 1]);
        } else {
            setViewStory(null);
        }
    }, [currentIndex, stories, setViewStory]);

    const handleBack = useCallback(() => {
        if (currentIndex !== -1 && currentIndex > 0) {
            setViewStory(stories[currentIndex - 1]);
        }
    }, [currentIndex, stories, setViewStory]);

    useEffect(() => {
        let timer, progressInterval;
        if(viewStory && viewStory.media_type !== 'video') {
            setProgress(0);
            const duration = 7000; // Dikurangi jadi 7 detik agar lebih pas untuk story
            const setTime = 100;
            let elapsed = 0;

            progressInterval = setInterval(() => {
                elapsed += setTime;
                setProgress((elapsed / duration * 100)); 
            }, setTime);

            timer = setTimeout(() => {
                handleNext();
            }, duration);
        }
        
        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, [viewStory, handleNext]);

    const handleClose = () => {
        setViewStory(null);
    };

    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    const isOwnStory = viewStory?.user_id === loggedInUser?.id || viewStory?.user?.id === loggedInUser?.id || viewStory?.user?._id === loggedInUser?.id;

    const handleDeleteStory = async () => {
        const confirm = await Swal.fire({
            title: "Hapus Story?",
            text: "Story Anda akan dihapus secara permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
        });

        if (!confirm.isConfirmed) return;

        try {
            const storyId = viewStory.id || viewStory._id;
            await postApi.delete(`/story/${storyId}`);
            
            Swal.fire({
                title: "Berhasil!",
                text: "Story berhasil dihapus.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            
            setViewStory(null);
            
            window.location.reload();
        } catch (error) {
            console.error("Gagal menghapus story:", error);
            Swal.fire("Gagal", "Tidak dapat menghapus story.", "error");
        }
    };

    if (!viewStory) return null;

    const renderContent = () => { 
        switch(viewStory.media_type) {
            case 'text':
                return (
                <div className="w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center font-semibold">{viewStory.content}</div>
            );
            case 'image':
                return (
                <img src={viewStory.media_url} alt="" className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"/>
            );
            case 'video':
                return (
                <video onEnded={handleNext} src={viewStory.media_url} className="max-h-screen rounded-lg shadow-2xl" controls autoPlay/>
            );
            default:
                return null;
        }
    }

    return ( 
        <div className="fixed inset-0 h-screen bg-black/95 z-110 flex items-center justify-center" style={{backgroundColor: viewStory.media_type === 'text' ? viewStory.background_color : '#000000'}}>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-white/20">
                <div className="h-full bg-white transition-all duration-100 linear" style={{width: `${progress}%`}}></div>
            </div>

            {/* User Info - Top Left*/}
            <div className="absolute top-6 left-6 flex items-center space-x-3 p-3 px-5 backdrop-blur-md rounded-full bg-black/40 border border-white/10">
                <img src={viewStory.user?.profile_picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="" className="w-8 h-8 rounded-full object-cover border border-white/20"/>
                <span className="font-bold text-sm tracking-wide">{viewStory.user?.full_name || viewStory.user?.username || "Tanpa Nama"}</span>
                <BadgeCheck size={16} className="text-blue-500 fill-blue-500"/>
            </div>

            {/* Back Button (Floating Left) */}
            {currentIndex > 0 && (
                <button
                    onClick={handleBack}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 active:scale-90 text-white p-4 rounded-full transition-all duration-150 backdrop-blur-md cursor-pointer border border-white/5 shadow-lg"
                    title="Story Sebelumnya"
                >
                    <ChevronLeft className="w-7 h-7" />
                </button>
            )}

            {/* Next Button (Floating Right) */}
            <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 active:scale-90 text-white p-4 rounded-full transition-all duration-150 backdrop-blur-md cursor-pointer border border-white/5 shadow-lg"
                title={currentIndex < stories.length - 1 ? "Story Selanjutnya" : "Selesai"}
            >
                <ChevronRight className="w-7 h-7" />
            </button>

            {/* Close Button */}
            <button onClick={handleClose} className="absolute top-6 right-6 text-white bg-black/40 border border-white/10 rounded-full p-2.5 hover:scale-105 transition cursor-pointer backdrop-blur-md">
                <X className='w-5 h-5'/>
            </button>

            {/* Delete Story Button */}
            {isOwnStory && (
                <button 
                    onClick={handleDeleteStory} 
                    className="absolute top-6 right-20 text-white bg-black/40 border border-white/10 rounded-full p-2.5 hover:scale-105 transition cursor-pointer backdrop-blur-md"
                    title="Hapus Story"
                >
                    <Trash2 className='w-5 h-5 text-red-500'/>
                </button>
            )}

            {/* Content Wrapper */}
            <div className="max-w-[85vw] max-h-[80vh] flex items-center justify-center p-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default StoryViewer;