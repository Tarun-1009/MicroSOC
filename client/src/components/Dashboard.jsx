import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Mock data for charts
    const [attackTrends] = useState([
        { time: '03:00', value1: 100, value2: 50 },
        { time: '06:00', value1: 80, value2: 70 },
        { time: '09:00', value1: 60, value2: 90 },
        { time: '12:00', value1: 120, value2: 110 },
        { time: '15:00', value1: 90, value2: 130 },
        { time: '18:00', value1: 110, value2: 100 },
        { time: '21:00', value1: 200, value2: 150 },
        { time: '00:00', value1: 70, value2: 80 },
        { time: '03:00', value1: 130, value2: 120 },
        { time: '06:00', value1: 150, value2: 140 },
    ]);

    // Calculate severity distribution from real logs
    const getSeverityData = () => {
        const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
        logs.forEach(log => {
            if (counts.hasOwnProperty(log.severity)) {
                counts[log.severity]++;
            }
        });
        const total = logs.length || 1;
        return {
            critical: Math.round((counts.Critical / total) * 100),
            high: Math.round((counts.High / total) * 100),
            medium: Math.round((counts.Medium / total) * 100),
            low: Math.round((counts.Low / total) * 100)
        };
    };

    const severityData = getSeverityData();

    // Fetch logs from database
    const fetchLogs = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/logs');
            const data = await res.json();
            // Filter out resolved logs - only show Open and In Progress
            const activeLogs = data.filter(log => log.status !== 'Resolved');
            setLogs(activeLogs);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        }
    };

    useEffect(() => {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
            window.location.href = '/';
            return;
        }

        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);

        // Initial fetch
        fetchLogs();

        // Auto-refresh every 3 seconds
        const interval = setInterval(fetchLogs, 3000);

        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const getSeverityClass = (severity) => {
        return `severity-badge severity-${severity.toLowerCase()}`;
    };

    // Format timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
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
                <div className="header-brand">
                    <div className="brand-logo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                    </div>
                    <span className="brand-name">MicroSOC</span>
                </div>


                <div className="header-actions">
                    <button
                        className="nav-link-btn"
                        onClick={() => navigate('/ingest')}
                    >
                        📊 View All Logs
                    </button>

                    <div className="user-menu-container">
                        <button
                            className="user-profile-btn"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                                <path d="M6 21C6 17.134 8.686 14 12 14C15.314 14 18 17.134 18 21" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <span className="user-name">{user?.name || 'User'}</span>
                        </button>

                        {showUserMenu && (
                            <div className="user-dropdown">
                                <div className="user-info">
                                    <div className="user-info-name">{user?.name}</div>
                                    <div className="user-info-email">{user?.email}</div>
                                    <div className="user-info-role">{user?.role === 'admin' ? 'Grid Admin' : 'Security Analyst'}</div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <button className="logout-btn" onClick={handleLogout}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" />
                                        <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" />
                                        <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="dashboard-grid">
                    {/* Attack Trends Chart */}
                    <div className="dashboard-card attack-trends-card">
                        <h3 className="card-title">Threat Activity (Last 24h)</h3>
                        <div className="chart-container">
                            <svg className="line-chart" viewBox="0 0 500 200" preserveAspectRatio="none">
                                {/* Grid lines */}
                                <line x1="0" y1="50" x2="500" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                                <line x1="0" y1="100" x2="500" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                                <line x1="0" y1="150" x2="500" y2="150" stroke="#e5e7eb" strokeWidth="1" />

                                {/* Y-axis labels */}
                                <text x="5" y="15" fontSize="10" fill="#6b7280">200</text>
                                <text x="5" y="65" fontSize="10" fill="#6b7280">150</text>
                                <text x="5" y="115" fontSize="10" fill="#6b7280">100</text>
                                <text x="5" y="165" fontSize="10" fill="#6b7280">50</text>
                                <text x="5" y="200" fontSize="10" fill="#6b7280">0</text>

                                {/* Line 1 (Orange) */}
                                <polyline
                                    points={attackTrends.map((d, i) => `${i * 50 + 30},${200 - d.value2}`).join(' ')}
                                    fill="none"
                                    stroke="#f97316"
                                    strokeWidth="2"
                                />

                                {/* Line 2 (Blue) */}
                                <polyline
                                    points={attackTrends.map((d, i) => `${i * 50 + 30},${200 - d.value1}`).join(' ')}
                                    fill="none"
                                    stroke="#60a5fa"
                                    strokeWidth="2"
                                />
                            </svg>

                            {/* X-axis labels */}
                            <div className="chart-x-axis">
                                {['03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '00:00', '03:00', '06:00', '09:00', '12:00', '15:00'].map((time, i) => (
                                    <span key={i} className="x-label">{time}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Severity Distribution Donut Chart */}
                    <div className="dashboard-card severity-card">
                        <h3 className="card-title">Threat Severity Distribution</h3>
                        <div className="donut-chart-container">
                            <svg className="donut-chart" viewBox="0 0 200 200">
                                {/* Donut segments */}
                                <circle cx="100" cy="100" r="70" fill="none" stroke="#ef4444" strokeWidth="40"
                                    strokeDasharray={`${severityData.critical * 4.4} 440`}
                                    transform="rotate(-90 100 100)" />
                                <circle cx="100" cy="100" r="70" fill="none" stroke="#f97316" strokeWidth="40"
                                    strokeDasharray={`${severityData.high * 4.4} 440`}
                                    strokeDashoffset={`-${severityData.critical * 4.4}`}
                                    transform="rotate(-90 100 100)" />
                                <circle cx="100" cy="100" r="70" fill="none" stroke="#fbbf24" strokeWidth="40"
                                    strokeDasharray={`${severityData.medium * 4.4} 440`}
                                    strokeDashoffset={`-${(severityData.critical + severityData.high) * 4.4}`}
                                    transform="rotate(-90 100 100)" />
                                <circle cx="100" cy="100" r="70" fill="none" stroke="#9ca3af" strokeWidth="40"
                                    strokeDasharray={`${severityData.low * 4.4} 440`}
                                    strokeDashoffset={`-${(severityData.critical + severityData.high + severityData.medium) * 4.4}`}
                                    transform="rotate(-90 100 100)" />

                                {/* Center white circle */}
                                <circle cx="100" cy="100" r="50" fill="white" />
                            </svg>

                            <div className="severity-legend">
                                <div className="legend-item">
                                    <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
                                    <span className="legend-label">Critical</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color" style={{ backgroundColor: '#f97316' }}></span>
                                    <span className="legend-label">High</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color" style={{ backgroundColor: '#fbbf24' }}></span>
                                    <span className="legend-label">Medium</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color" style={{ backgroundColor: '#9ca3af' }}></span>
                                    <span className="legend-label">Low</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Security Event Feed */}
                <div className="dashboard-card events-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <h3 className="card-title" style={{ margin: 0 }}>Recent Incidents (Top 5)</h3>
                        <span className="live-badge">
                            <span className="live-dot"></span>
                            LIVE
                        </span>
                    </div>
                    <div className="events-table-container">
                        <table className="events-table">
                            <thead>
                                <tr>
                                    <th>Log ID</th>
                                    <th>Timestamp</th>
                                    <th>Source IP</th>
                                    <th>Attack Type</th>
                                    <th>Severity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                            No logs yet. Start the Kaiju script to generate attack logs.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.slice(0, 5).map((log) => (
                                        <tr key={log.log_id}>
                                            <td>#{log.log_id}</td>
                                            <td>{formatTimestamp(log.timestamp)}</td>
                                            <td>{log.source_ip}</td>
                                            <td>{log.attack_type}</td>
                                            <td>
                                                <span className={getSeverityClass(log.severity)}>
                                                    {log.severity}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
