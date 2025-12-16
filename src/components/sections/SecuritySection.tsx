import React, { useState } from 'react';
import { Card, Button, Input, Toggle } from '../UIComponents';
import { UserRole } from '../../types';
import { FcPrivacy } from 'react-icons/fc';

interface Props {
  userRole: UserRole;
}

const SecuritySection: React.FC<Props> = ({ userRole }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card title="Password" description="Ensure your account is secure with a strong password.">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Last changed 3 months ago</div>
          <Button onClick={() => setShowPasswordModal(true)} variant="secondary">Set Password</Button>
        </div>

        {/* Simplified Modal Simulation */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96">
              <h3 className="text-xl font-bold mb-4">Set Password</h3>
              <div className="space-y-4">
                <Input label="Current Password" type="password" />
                <Input label="New Password" type="password" />
                <Input label="Confirm New Password" type="password" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="ghost" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setShowPasswordModal(false)}>Save</Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 2FA - Hidden for Users */}
      {userRole !== UserRole.USER && (
        <Card title="Two-Factor Authentication (2FA)">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${twoFAEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                <FcPrivacy size={24} />
              </div>
              <div>
                <h4 className="font-medium">{twoFAEnabled ? 'Enabled' : 'Disabled'}</h4>
                <p className="text-sm text-gray-500">{twoFAEnabled ? 'Your account is extra secure.' : 'Add an extra layer of security.'}</p>
              </div>
            </div>
            <Button
              variant={twoFAEnabled ? "danger" : "primary"}
              onClick={() => setTwoFAEnabled(!twoFAEnabled)}
            >
              {twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SecuritySection;
