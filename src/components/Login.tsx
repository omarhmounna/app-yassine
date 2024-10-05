import React, { useState } from 'react';
import logo from "../../public/images/ANAQA Maghribiya - Logotype ( Ver.01 ).png";

const Login = ({ setIsLoggedIn }) => {
    const [isAction, setIsAction] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsAction(true);
        setError('');

        try {
            const response = await fetch('https://yassine.anaqamaghribiya.com/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
console.log(response);
            if (response.status===200) {
                setIsLoggedIn(true);
            } else {
                setError('Invalid username or password');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsAction(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-100 to-green-100">
            <div className="w-full max-w-md p-4">
                <div className="bg-white shadow-2xl rounded-3xl px-8 pt-6 pb-8 mb-4">
                    <div className="flex justify-center mb-8">
                        <img src={logo.src} alt="ANAQA Maghribiya Logo" width={150} height={50} />
                    </div>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative">
                            <label htmlFor="username" className="text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400">👤</span>
                                </div>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400">🔒</span>
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {isAction ? (
                                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Login
                                        <span className="absolute right-3 inset-y-0 flex items-center pl-3">
                                            ➔
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default Login;