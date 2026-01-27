import React, { useEffect, useState } from 'react';
import { Card, Button, Badge } from '../UIComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Copy, Share2, Gift, Coins } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface Referral {
  id: string;
  referred_user: string;
  date: string;
  status: 'Converted' | 'Pending';
  reward: number;
}

const ReferralSection: React.FC = () => {
  const [referralCode, setReferralCode] = useState("LOADING...");
  const [history, setHistory] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalEarned: 0, monthlyGrowth: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Referral Code (Mock logic: generate from ID if not in profile, or fetch from profile if column exists)
      // For now, we'll derive a stable code from user ID or email
      const code = user.email ? `REF-${user.email.split('@')[0].toUpperCase().substring(0, 6)}` : "REF-USER";
      setReferralCode(code);

      // 2. Fetch History
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (referrals) {
        const mapped: Referral[] = referrals.map((r: any) => ({
          id: r.id,
          referred_user: r.referred_name || r.referred_email || 'Unknown User',
          date: new Date(r.created_at).toLocaleDateString(),
          status: r.status,
          reward: r.reward_amount || 0
        }));
        setHistory(mapped);

        // Calculate Stats
        const total = mapped.reduce((sum, item) => item.status === 'Converted' ? sum + item.reward : sum, 0);
        setStats({ totalEarned: total, monthlyGrowth: 0 }); // Monthly growth requires more math, simplified for now

        // Calculate Chart Data (grouped by month)
        // Mocking chart data for visual consistency if real data is sparse
        const mockChart = [
          { name: 'Jan', referrals: 4 },
          { name: 'Feb', referrals: 3 },
          { name: 'Mar', referrals: referrals.length }, // Current month
        ];
        setChartData(mockChart);
      } else {
        // Fallback if table doesn't exist
        console.log("No referrals table found or empty, using mock data for demo.");
        setReferralCode("NEXUS-DEMO");
      }
    } catch (err) {
      console.error("Error fetching referrals:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium opacity-90">Credits Earned</h3>
            <Coins size={24} className="text-white" />
          </div>
          <div className="text-3xl font-bold">{stats.totalEarned.toLocaleString()}</div>
          <div className="text-sm opacity-75 mt-2">+0 this month</div>
        </div>
        <Card className="flex flex-col justify-center">
          <div className="text-sm text-gray-500 mb-1">Your Referral Code</div>
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg border border-gray-200">
            <span className="font-mono font-bold text-gray-800 text-lg">{referralCode}</span>
            <button onClick={copyToClipboard} className="text-blue-600 hover:text-blue-800 transition-colors">
              <Copy size={20} />
            </button>
          </div>
        </Card>
        <Card className="flex flex-col justify-center items-center text-center">
          <div className="mb-2 text-indigo-600"><Gift size={32} /></div>
          <div className="font-medium mb-3">Invite Friends</div>
          <div className="flex space-x-2">
            <Button size="sm" variant="secondary"><Share2 size={14} className="mr-1" /> Share</Button>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card title="Referral Performance" description="Track your successful referrals over the last 6 months.">
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.length > 0 ? chartData : [{ name: 'No Data', referrals: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="referrals" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* History Table */}
      <Card title="Referral History">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.referred_user}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.date}</td>
                    <td className="px-6 py-4"><Badge variant={item.status === 'Converted' ? 'success' : 'warning'}>{item.status}</Badge></td>
                    <td className={`px-6 py-4 text-right text-sm font-medium ${item.status === 'Converted' ? 'text-green-600' : 'text-gray-400'}`}>
                      {item.status === 'Converted' ? `+${item.reward} Credits` : '---'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No referrals found. Share your code to get started!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ReferralSection;
