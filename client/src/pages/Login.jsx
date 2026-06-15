<<<<<<< HEAD
import React, { useState } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { authApi } from "../utils/api"; // Import API dari utils
import Swal from 'sweetalert2';

const Login = () => {
    const navigate = useNavigate();
    
    // State untuk menangkap input user
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Fungsi Submit Login
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        // setErrorMsg("");

        try {
            const response = await authApi.post('/auth/login', { email, password });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({ ...response.data.user, role: response.data.user.role || 'member' }));
            Swal.fire({
                title: 'Welcome Back!',
                text: 'Login successful, redirecting...',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                navigate("/"); 
            });

        } catch (error) {
            Swal.fire({
                title: 'Login Failed',
                text: error.response?.data?.error || "An error occurred while logging in",
                icon: 'error',
                confirmButtonColor: '#1e1b4b'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col md:flex-row">
            <img src={assets.bgImage} alt="Background" className="absolute top-0 left-0 -z-10 w-full h-full object-cover" />

            {/* Left side : Branding */}
=======
import React from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { SignIn } from '@clerk/react'

const Login = () => {
    const navigate = useNavigate();
    return (
        <div className="relative min-h-screen flex flex-col md:flex-row">
            {/* Background Image */}
            <img src={assets.bgImage} alt="Background" className="absolute top-0 left-0 -z-10 w-full h-full object-cover" />

            {/* left side : Branding */}
>>>>>>> origin/Kibob_update_home
            <div className="flex-1 flex flex-col items-start justify-between p-6 md:p-10">
                <img src={assets.logo} alt="" className="h-15 object-contain" />
                <div>
                    <div className="flex items-center gap-3 mb-4 max-md:mt-10">
                        <img src={assets.group_users} alt="" className="h-8 md:h-10" />
                        <div>
                            <div className="flex">
                                {Array(5).fill(0).map((_, index) => (
                                    <Star key={index} className="size-4 md:size-4.5 text-transparent fill-amber-500" />
                                ))}
                            </div>
                            <p>Used by 1000M+ developers</p>
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-6xl md:pb-2 font-bold bg-gradient-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent">More than just friends truly connect</h1>
                    <p className="text-xl md:text-3xl text-indigo-900 max-w-72 md:max-w-md">connect with global community on InSight</p>
                </div>
                <span className="md:h-10"></span>
            </div>

<<<<<<< HEAD
            {/* Right side : Login form */}
=======
            {/* right side : Login form */}
>>>>>>> origin/Kibob_update_home
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-md aspect-[1/1] bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col justify-center">
                
                    <h2 className="text-xl font-semibold text-center">
<<<<<<< HEAD
                        Sign in to InSight
=======
                        Sign in to My Application
>>>>>>> origin/Kibob_update_home
                    </h2>
                    <p className="text-sm text-gray-500 text-center mb-5">
                        Welcome back! Please sign in to continue
                    </p>

<<<<<<< HEAD
                    {/* Tampilkan pesan error jika ada */}
                    {/* {errorMsg && (
                        <div className="bg-red-100 text-red-600 p-2 rounded-md mb-4 text-sm text-center">
                            {errorMsg}
                        </div>
                    )} */}

                    {/* Form diubah menambahkan onSubmit */}
                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                required
=======
                    <form className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email address"
>>>>>>> origin/Kibob_update_home
                                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

<<<<<<< HEAD
                        <div>
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
=======
                        {/* Password */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter your password"
>>>>>>> origin/Kibob_update_home
                                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

<<<<<<< HEAD
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full text-white py-2 rounded-lg transition ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900'}`}
                        >
                            {loading ? "Loading..." : "Continue →"}
                        </button>
                    </form>

                    <div className="mt-4 text-xs text-gray-500 text-center">
                        Admin login:
                        <div>admin1@insight.com / Admin123</div>
                        <div>admin2@insight.com / Admin456</div>
                    </div>

=======
                        {/* Button */}
                        <button
                            type="submit"
                            className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition"
                        >
                            Continue →
                        </button>
                    </form>

                    {/* Footer */}
>>>>>>> origin/Kibob_update_home
                    <p className="text-sm text-center text-gray-500 mt-4">
                        Don't have an account?{" "}
                        <span 
                            className="text-indigo-600 cursor-pointer hover:underline"
                            onClick={() => navigate("/register")}
                        >
                            Sign up
                        </span>
                    </p>
<<<<<<< HEAD
=======

>>>>>>> origin/Kibob_update_home
                </div>
            </div>
        </div>
    )
}

export default Login;