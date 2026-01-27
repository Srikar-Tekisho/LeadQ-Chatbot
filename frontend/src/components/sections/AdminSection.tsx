import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Select } from '../UIComponents';
import { UserRole, Session } from '../../types';
import { Trash2, Monitor, Smartphone, LogOut, Download, AlertTriangle, Database } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
function formatLastActive(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

interface Props {
  userRole: UserRole;
}

const AdminSection: React.FC<Props> = ({ userRole }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active', { ascending: false });

      if (error) throw error;
      if (data) {
        setSessions(data.map((s: any) => ({
          id: s.id,
          device: s.device,
          browser: s.browser,
          ip: s.ip_address,
          location: s.location,
          lastActive: formatLastActive(s.last_active),
          isCurrent: s.is_current,
          type: s.device.toLowerCase().includes('iphone') || s.device.toLowerCase().includes('android') ? 'mobile' : 'desktop'
        })));
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const [retentionPeriod, setRetentionPeriod] = useState('1_year');

  const handleLogout = async (id: string) => {
    if (confirm("Are you sure? The user/device will be logged out.")) {
      try {
        const { error } = await supabase
          .from('active_sessions')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setSessions(sessions.filter(s => s.id !== id));
      } catch (err) {
        console.error('Error revoking session:', err);
        alert('Failed to revoke session');
      }
    }
  };

  const handleLogoutAll = async () => {
    if (confirm("Are you sure you want to log out from all devices? This will terminate all active sessions except your current one.")) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('active_sessions')
          .delete()
          .eq('user_id', user.id)
          .eq('is_current', false);

        if (error) throw error;
        setSessions(sessions.filter(s => s.isCurrent));
      } catch (err) {
        console.error('Error revoking all sessions:', err);
        alert('Failed to revoke all sessions');
      }
    }
  };

  const canManageSessions = userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

  return (
    <div className="space-y-6">
      <Card title="Active Sessions" description="Manage devices where your account is currently logged in.">
        <div className="flex justify-end -mt-16 mb-6">
          {canManageSessions && (
            <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transform translate-y-2" onClick={handleLogoutAll}>
              <span className="mr-2 flex items-center"><LogOut size={16} /></span> Log out all devices
            </Button>
          )}
        </div>
        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No active sessions found</div>
          ) : (
            sessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-4">
                  {session.type === 'desktop' ? <Monitor size={24} className="text-gray-500" /> : <Smartphone size={24} className="text-gray-500" />}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{session.device}</span>
                      {session.isCurrent && <Badge variant="success">Current Session</Badge>}
                    </div>
                    <div className="text-sm text-gray-500">
                      {session.browser} • {session.location} • {session.ip}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Last active: {session.lastActive}</div>
                  </div>
                </div>

                {/* Logout Logic */}
                {!session.isCurrent && canManageSessions && (
                  <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleLogout(session.id)}>
                    <span className="mr-2 flex items-center"><LogOut size={16} /></span> Logout
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {isSuperAdmin && (
        <>
          {/* Data Retention Section - Visible ONLY to Super Admin */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
              <Database size={24} className="text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900 leading-6">Data Retention Policy</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-sm mb-6 max-w-2xl">
                Configure how long user data, activity logs, and system backups are retained. Data older than the selected period will be automatically permanently deleted in compliance with GDPR and privacy standards.
              </p>
              <div className="max-w-xs">
                <Select
                  label="Retention Period"
                  options={[
                    { value: '30_days', label: '30 Days' },
                    { value: '90_days', label: '90 Days' },
                    { value: '6_months', label: '6 Months' },
                    { value: '1_year', label: '1 Year' },
                    { value: '3_years', label: '3 Years' },
                    { value: 'forever', label: 'Indefinitely' }
                  ]}
                  value={retentionPeriod}
                  onChange={(e) => setRetentionPeriod(e.target.value)}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="secondary" size="sm">Update Policy</Button>
              </div>
            </div>
          </div>

          {/* Export Data Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
              <Download size={24} className="text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900 leading-6">Export Your Data</h3>
            </div>
            <div className="p-6">
              <div className="bg-[#F0F9FF] rounded-lg p-6 border border-[#BAE6FD]">
                <p className="text-gray-700 mb-4">Download a copy of all your data including contacts, meeting minutes, and settings.</p>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm font-medium transition-all text-sm">
                  <Download size={16} />
                  Export My Data
                </button>
              </div>
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
              <Trash2 size={24} />
              <h3 className="text-lg font-medium text-gray-900 leading-6">Delete Account</h3>
            </div>
            <div className="p-6">
              <div className="bg-[#FEF2F2] rounded-lg p-6 border border-[#FCA5A5]">
                <div className="flex items-start gap-3 mb-2">
                  <div className="mt-0.5 flex-shrink-0"><AlertTriangle size={24} className="text-red-500" /></div>
                  <h4 className="text-base font-bold text-gray-900">Permanently delete your account</h4>
                </div>
                <p className="text-gray-600 mb-6 ml-8 text-sm">This action is irreversible. Before proceeding, we recommend exporting your data.</p>

                <div className="flex flex-col sm:flex-row gap-3 ml-8">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm font-medium transition-all text-sm">
                    <Download size={16} />
                    Export Data First
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg text-red-700 hover:bg-[#FECACA] shadow-sm font-medium transition-all text-sm">
                    <Trash2 size={16} />
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSection;
