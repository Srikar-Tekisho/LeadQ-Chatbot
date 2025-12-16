import React from 'react';
import { Card, Button, Badge } from '../UIComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FcPackage, FcMoneyTransfer } from 'react-icons/fc';
import { Copy, Share2 } from 'lucide-react';

const data = [
  { name: 'Jan', referrals: 4 },
  { name: 'Feb', referrals: 3 },
  { name: 'Mar', referrals: 8 },
  { name: 'Apr', referrals: 12 },
  { name: 'May', referrals: 6 },
  { name: 'Jun', referrals: 15 },
];

const ReferralSection: React.FC = () => {
  const referralCode = "NEXUS-8821";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium opacity-90">Credits Earned</h3>
            <FcMoneyTransfer size={24} />
          </div>
          <div className="text-3xl font-bold">1,250.00</div>
          <div className="text-sm opacity-75 mt-2">+250 this month</div>
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
          <div className="mb-2"><FcPackage size={32} /></div>
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
            <BarChart data={data}>
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
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Sarah Jenkins</td>
                <td className="px-6 py-4 text-sm text-gray-500">Dec 10, 2025</td>
                <td className="px-6 py-4"><Badge variant="success">Converted</Badge></td>
                <td className="px-6 py-4 text-right text-sm font-medium text-green-600">+500 Credits</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Mike Ross</td>
                <td className="px-6 py-4 text-sm text-gray-500">Dec 08, 2025</td>
                <td className="px-6 py-4"><Badge variant="warning">Pending</Badge></td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-400">---</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">David Kim</td>
                <td className="px-6 py-4 text-sm text-gray-500">Nov 22, 2025</td>
                <td className="px-6 py-4"><Badge variant="success">Converted</Badge></td>
                <td className="px-6 py-4 text-right text-sm font-medium text-green-600">+500 Credits</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ReferralSection;
