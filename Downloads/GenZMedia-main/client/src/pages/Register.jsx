import React from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const Register = () => {
    const navigate = useNavigate();
    return (
        <div className="relative min-h-screen flex flex-col md:flex-row">
            {/* Background Image */}
            <img
                src={assets.bgImage}
                alt="Background"
                className="absolute top-0 left-0 -z-10 w-full h-full object-cover"
            />

            {/* left side : Branding */}
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

                    <h1 className="text-3xl md:text-6xl md:pb-2 font-bold bg-gradient-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent">
                        More than just friends truly connect
                    </h1>

                    <p className="text-xl md:text-3xl text-indigo-900 max-w-72 md:max-w-md">
                        connect with global community on InSight
                    </p>
                </div>
                <span className="md:h-10"></span>
            </div>

            {/* right side : Register form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">

                    <h2 className="text-xl font-semibold text-center">
                        Create your account
                    </h2>
                    <p className="text-sm text-gray-500 text-center mb-5">
                        Join us and start your journey
                    </p>

                    <form className="space-y-4">

                        {/* Full Name */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your username"
                                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Birthday */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Birthday
                            </label>

                            <div className="flex gap-2 mt-1">

                                {/* Month */}
                                <select className="w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600">
                                    <option value="">Month</option>
                                    {[
                                        "January","February","March","April","May","June",
                                        "July","August","September","October","November","December"
                                    ].map((month, i) => (
                                        <option key={i} value={i + 1}>{month}</option>
                                    ))}
                                </select>

                                {/* Day */}
                                <select className="w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600">
                                    <option value="">Day</option>
                                    {Array.from({ length: 31 }, (_, i) => (
                                        <option key={i} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>

                                {/* Year */}
                                <select className="w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600">
                                    <option value="">Year</option>
                                    {Array.from({ length: 75 }, (_, i) => {
                                        const year = new Date().getFullYear() - i;
                                        return (
                                            <option key={year} value={year}>{year}</option>
                                        );
                                    })}
                                </select>

                            </div>
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition"
                        >
                            Sign Up →
                        </button>
                    </form>

                    {/* Footer */}
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