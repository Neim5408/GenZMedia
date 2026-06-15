import React, { useState } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { authApi } from "../utils/api"; // Import API dari utils
import Swal from 'sweetalert2';

const Register = () => {
    const navigate = useNavigate();

    // State untuk input form
    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
        month: "",
        day: "",
        year: ""
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Handler untuk merubah state setiap ada ketikan
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Fungsi Submit Register
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        // setErrorMsg("");

        const birthday = `${formData.year}-${formData.month}-${formData.day}`;

        try {
            const response = await authApi.post('/auth/register', {
                email: formData.email,
                password: formData.password,
                full_name: formData.fullName,
                username: formData.username,
                birthday: birthday,
                role: 'member'
            });

            Swal.fire({
                title: 'Awesome!',
                text: 'Registrasi Berhasil! Silakan Login.',
                icon: 'success',
                confirmButtonColor: '#1e1b4b',
                confirmButtonText: 'Lanjut Login →'
            }).then(() => {
                navigate("/login"); 
            });

        } catch (error) {
            Swal.fire({
                title: 'Oops...',
                text: error.response?.data?.error || "Gagal melakukan registrasi",
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

            {/* Right side : Register form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">

                    <h2 className="text-xl font-semibold text-center">Create your account</h2>
                    <p className="text-sm text-gray-500 text-center mb-5">Join us and start your journey</p>

                    {/* {errorMsg && (
                        <div className="bg-red-100 text-red-600 p-2 rounded-md mb-4 text-sm text-center">
                            {errorMsg}
                        </div>
                    )} */}

                    <form className="space-y-4" onSubmit={handleRegister}>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                required
                                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Email address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Birthday</label>
                            <div className="flex gap-2 mt-1">
                                <select name="month" value={formData.month} onChange={handleChange} className="w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600">
                                    <option value="">Month</option>
                                    {["January","February","March","April","May","June","July","August","September","October","November","December"].map((month, i) => (
                                        <option key={i} value={i + 1}>{month}</option>
                                    ))}
                                </select>
                                <select name="day" value={formData.day} onChange={handleChange} className="w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600">
                                    <option value="">Day</option>
                                    {Array.from({ length: 31 }, (_, i) => (
                                        <option key={i} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                                <select name="year" value={formData.year} onChange={handleChange} className="w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600">
                                    <option value="">Year</option>
                                    {Array.from({ length: 75 }, (_, i) => {
                                        const year = new Date().getFullYear() - i;
                                        return <option key={year} value={year}>{year}</option>;
                                    })}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full text-white py-2 rounded-lg transition ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900'}`}
                        >
                            {loading ? "Processing..." : "Sign Up →"}
                        </button>
                    </form>

                    <p className="text-sm text-center text-gray-500 mt-4">
                        Already have an account?{" "}
                        <span 
                            className="text-indigo-600 cursor-pointer hover:underline"
                            onClick={() => navigate("/login")}
                        >
                            Sign in
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;