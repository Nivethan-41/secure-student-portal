import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/user/logs`, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setLogs(data.logs);
      } catch (err) {
        toast.error('Failed to load security logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="row">
      <div className="col-12">
        <h2 className="mb-4">Welcome, {user.name}</h2>
        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">Recent Security Activity</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <p>Loading logs...</p>
            ) : logs.length === 0 ? (
              <p className="text-muted">No security events found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Event Type</th>
                      <th>IP Address</th>
                      <th>Date / Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id}>
                        <td><span className="badge bg-secondary">{log.event_type}</span></td>
                        <td>{log.ip_address}</td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
