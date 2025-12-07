import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Mock data for charts and events
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

    const [severityData] = useState({
        critical: 25,
        high: 30,
        medium: 35,
        low: 10
    });

    const [securityEvents] = useState([
        { timestamp: '2025-12-06 11:23:45', sourceIp: '203.0.113.42', eventType: 'DDoS Attack Detected', targetSystem: 'Web Server 01', severity: 'Critical' },
        { timestamp: '2025-12-06 11:18:32', sourceIp: '198.51.100.87', eventType: 'Malware Signature Match', targetSystem: 'Endpoint PC-2847', severity: 'High' },
        { timestamp: '2025-12-06 11:15:20', sourceIp: '192.0.2.156', eventType: 'Brute Force Login Attempt', targetSystem: 'SSH Server', severity: 'High' },
        { timestamp: '2025-12-06 11:12:08', sourceIp: '10.0.0.45', eventType: 'Suspicious Outbound Traffic', targetSystem: 'Database Server', severity: 'Critical' },
        { timestamp: '2025-12-06 11:08:54', sourceIp: '172.16.0.23', eventType: 'Unauthorized Access Attempt', targetSystem: 'Admin Panel', severity: 'Medium' },
        { timestamp: '2025-12-06 11:05:41', sourceIp: '192.168.1.100', eventType: 'Port Scan Detected', targetSystem: 'Firewall', severity: 'Medium' },
        { timestamp: '2025-12-06 11:02:15', sourceIp: '10.10.10.5', eventType: 'Failed Authentication', targetSystem: 'VPN Gateway', severity: 'Low' },
    ]);

    useEffect(() => {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
            window.location.href = '/';
            return;
        }

        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const getSeverityClass = (severity) => {
        return `severity-badge severity-${severity.toLowerCase()}`;
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

                <nav className="dashboard-nav">
                    {['Overview', 'Alerts', 'Threats', 'Incidents', 'Analytics', 'Reports'].map(tab => (
                        <button
                            key={tab}
                            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                <div className="header-actions">
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
                    <h3 className="card-title">Live Security Event Feed</h3>
                    <div className="events-table-container">
                        <table className="events-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Source IP</th>
                                    <th>Event Type</th>
                                    <th>Target System</th>
                                    <th>Severity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {securityEvents.map((event, index) => (
                                    <tr key={index}>
                                        <td>{event.timestamp}</td>
                                        <td>{event.sourceIp}</td>
                                        <td>{event.eventType}</td>
                                        <td>{event.targetSystem}</td>
                                        <td>
                                            <span className={getSeverityClass(event.severity)}>
                                                {event.severity}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
