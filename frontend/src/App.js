import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// API base URL
const API_URL = 'http://localhost:5000/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile(token);
    }
  }, []);

  // Fetch user profile
  const fetchProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      setIsLoggedIn(true);
    } catch (error) {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccessMessage('');
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post(`${API_URL}/login`, {
        username: formData.username,
        password: formData.password
      });
      
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setUser(user);
      setIsLoggedIn(true);
      setFormData({ username: '', password: '', email: '' });
      setSuccessMessage('Login Successfull!');

    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle register
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post(`${API_URL}/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setUser(user);
      setIsLoggedIn(true);
      setFormData({ username: '', password: '', email: '' });
      setSuccessMessage('Account created successfully!');

    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    setFormData({ username: '', password: '', email: '' });
    setSuccessMessage('Logged out successfully');
  };

  // Dashboard Component
  if (isLoggedIn && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-bounce-in">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome Back!
              </h1>
              <p className="text-gray-600">
                Hello, {user.username}
              </p>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg animate-fade-in">
                <div className="flex items-center">
                  <span className="mr-2"></span>
                  {successMessage}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">ID:</span>
                  <span className="text-gray-800">#{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">Username:</span>
                  <span className="text-gray-800">{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">Email:</span>
                  <span className="text-gray-800">{user.email}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login/Register Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white font-bold">
              {showRegister ? '' : '🔑'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {showRegister ? 'Create Account' : 'Login Page'}
          </h1>
          <p className="text-gray-600">
            {showRegister 
              ? 'Join us today and get started!' 
              : 'Sign in to your account'
            }
          </p>
        </div>

        <form onSubmit={showRegister ? handleRegister : handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
            />
          </div>

          {showRegister && (
            <div className="animate-fade-in">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email || ''}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg animate-fade-in">
              <div className="flex items-center">
                <span className="mr-2"></span>
                {error}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg animate-fade-in">
              <div className="flex items-center">
                <span className="mr-2"></span>
                {successMessage}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Please wait...
              </div>
            ) : (
              showRegister ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {showRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              type="button" 
              onClick={() => {
                setShowRegister(!showRegister);
                setError('');
                setSuccessMessage('');
                setFormData({ username: '', password: '', email: '' });
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
            >
              {showRegister ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;