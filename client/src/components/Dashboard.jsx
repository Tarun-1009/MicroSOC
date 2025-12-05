import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
            // Redirect to login if not authenticated
            window.location.href = '/';
            return;
        }

        // Get user data from localStorage
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);

        // Optional: Fetch fresh user data from server
        // fetchUserProfile();
    }, []);

    // Optional: Fetch user profile from server
    const fetchUserProfile = async () => {
        const result = await authService.getProfile();
        if (result.success) {
            setUser(result.data);
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(result.data));
        } else {
            // If token is invalid, logout
            handleLogout();
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>🛡️ MicroSOC Dashboard</h1>
                </div>
                <div className="header-right">
                    <div className="user-info">
                        <span className="user-name">{user?.name}</span>
                        <span className={`user-role ${user?.role}`}>
                            {user?.role === 'admin' ? '👑 Admin' : '🔍 Analyst'}
                        </span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="welcome-section">
                    <h2>Welcome back, {user?.name}! 👋</h2>
                    <p>You are logged in as a <strong>{user?.role}</strong></p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <h3>Active Alerts</h3>
                            <p className="stat-number">24</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🔒</div>
                        <div className="stat-content">
                            <h3>Security Score</h3>
                            <p className="stat-number">87%</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-content">
                            <h3>Threats Blocked</h3>
                            <p className="stat-number">156</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>System Status</h3>
                            <p className="stat-number">Healthy</p>
                        </div>
                    </div>
                </div>

                <div className="user-details">
                    <h3>Your Account Details</h3>
                    <div className="details-grid">
                        <div className="detail-item">
                            <span className="detail-label">User ID:</span>
                            <span className="detail-value">{user?.id}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{user?.email}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Role:</span>
                            <span className="detail-value">{user?.role}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Member Since:</span>
                            <span className="detail-value">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {user?.role === 'admin' && (
                    <div className="admin-section">
                        <h3>🔧 Admin Controls</h3>
                        <p>You have administrative privileges. Additional controls will appear here.</p>
                        <div className="admin-buttons">
                            <button className="admin-btn">Manage Users</button>
                            <button className="admin-btn">System Settings</button>
                            <button className="admin-btn">View Logs</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
