// API Service for MicroSOC Authentication
// Place this file in: client/src/services/authService.js

const API_URL = 'http://localhost:5000/api';

class AuthService {
    // Sign Up
    async signup(name, email, password, role = 'analyst') {
        try {
            console.log('Attempting signup with:', { name, email, role });
            console.log('API URL:', `${API_URL}/auth/signup`);

            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, role }),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                // Store token in localStorage
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
            }

            return data;
        } catch (error) {
            console.error('Signup error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            return {
                success: false,
                message: `Network error: ${error.message}. Please check if the server is running on http://localhost:5000`,
            };
        }
    }

    // Sign In
    async signin(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                // Store token in localStorage
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
            }

            return data;
        } catch (error) {
            console.error('Signin error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.',
            };
        }
    }

    // Get User Profile (Protected Route Example)
    async getProfile() {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                return {
                    success: false,
                    message: 'No authentication token found',
                };
            }

            const response = await fetch(`${API_URL}/user/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Profile fetch error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.',
            };
        }
    }

    // Logout
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Get token
    getToken() {
        return localStorage.getItem('token');
    }
}

export default new AuthService();