import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Toggle } from '../UIComponents';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../ToastContext';
import { UserRole } from '../../types';
import { FcPrivacy } from 'react-icons/fc';

interface Props {
  userRole: UserRole;
}

const SecuritySection: React.FC<Props> = ({ userRole }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(true); // Default to true

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const { addToast } = useToast();

  // Fetch 2FA setting from Supabase on component mount
  useEffect(() => {
    const fetch2FASetting = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('security_settings')
          .select('two_factor_enabled')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows found, which is okay - we'll use default
          console.error('Error fetching 2FA setting:', error);
          return;
        }

        if (data) {
          // Use the stored value, fallback to true if null/undefined
          setTwoFAEnabled(data.two_factor_enabled ?? true);
        } else {
          // No record exists, create one with default value (true)
          await createSecuritySettingsRecord(user.id, true);
          setTwoFAEnabled(true);
        }
      } catch (error) {
        console.error('Error fetching 2FA setting:', error);
        // Fallback to default (enabled) on error
        setTwoFAEnabled(true);
      }
    };

    fetch2FASetting();
  }, []);

  // Create security settings record for user
  const createSecuritySettingsRecord = async (userId: string, enabled: boolean) => {
    const { error } = await supabase
      .from('security_settings')
      .insert({
        user_id: userId,
        two_factor_enabled: enabled,
        updated_at: new Date().toISOString()
      });

    if (error && error.code !== '23505') { // Ignore duplicate key error
      console.error('Error creating security settings:', error);
    }
  };

  // Toggle 2FA and update Supabase
  const handleToggle2FA = async () => {
    setTwoFALoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addToast('You must be logged in to change 2FA settings', 'error');
        return;
      }

      const newValue = !twoFAEnabled;

      // Try to update existing record
      const { data: existingRecord, error: fetchError } = await supabase
        .from('security_settings')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // No record exists, create one
        const { error: insertError } = await supabase
          .from('security_settings')
          .insert({
            user_id: user.id,
            two_factor_enabled: newValue,
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      } else if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('security_settings')
          .update({
            two_factor_enabled: newValue,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      // Log the security event
      await supabase.from('security_logs').insert({
        user_id: user.id,
        event_type: newValue ? '2FA_ENABLED' : '2FA_DISABLED',
        ip_address: 'Client-Side',
        device_info: navigator.userAgent
      });

      setTwoFAEnabled(newValue);
      addToast(
        newValue ? 'Two-Factor Authentication enabled' : 'Two-Factor Authentication disabled',
        'success'
      );
    } catch (error: any) {
      console.error('Error updating 2FA setting:', error);
      addToast(error.message || 'Failed to update 2FA setting', 'error');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }
    if (password.length < 6) {
      addToast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user && user.email) {
        // Verify Current Password (re-auth)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword
        });

        if (signInError) {
          addToast("Current password is incorrect", "error");
          return;
        }
      }

      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;

      if (user) {
        await supabase.from('security_logs').insert({
          user_id: user.id,
          event_type: 'PASSWORD_UPDATE',
          ip_address: 'Client-Side',
          device_info: navigator.userAgent
        });
      }

      addToast("Password updated successfully", "success");
      setShowPasswordModal(false);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error("Error updating password:", error);
      addToast(error.message || "Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card title="Password" description="Ensure your account is secure with a strong password.">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Last changed 3 months ago</div>
          <Button onClick={() => setShowPasswordModal(true)} variant="secondary">Update Password</Button>
        </div>

        {/* Simplified Modal Simulation */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96 animate-fade-in">
              <h3 className="text-xl font-bold mb-4">Update Password</h3>
              <div className="space-y-4">
                {/* Note: In a real app, you'd ask for current password too, but supabase admin update doesn't strictly require it if logged in, 
                     though updatePassword usually does. We will just ask for new password for now as per simple UI. */}
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="ghost" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleUpdatePassword} disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
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
              onClick={handleToggle2FA}
              disabled={twoFALoading}
            >
              {twoFALoading ? 'Updating...' : (twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SecuritySection;
