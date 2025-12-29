import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, Button, Input, Select, TextArea, Badge } from '../UIComponents';
import { UserProfile, CompanyProfile, UserRole } from '../../types';
import { FcCamera, FcUpload, FcCancel, FcPlus } from 'react-icons/fc';
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from '../ToastContext';

// --- Subcomponent: Personal Profile ---
interface PersonalProfileProps {
  data: UserProfile;
  setData: (data: UserProfile) => Promise<void>;
  userRole: UserRole;
  forceEditMode?: boolean;
}

const PersonalProfile: React.FC<PersonalProfileProps> = ({ data, setData, userRole, forceEditMode = false }) => {
  const [isEditing, setIsEditing] = useState(forceEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  // Avatar State
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Form State
  const [splitNames, setSplitNames] = useState(() => {
    if (data.fullName) {
      const parts = data.fullName.split(' ');
      return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' };
    }
    return { firstName: '', lastName: '' };
  });
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; firstName?: string; lastName?: string }>({});

  const startEditing = () => {
    const parts = data.fullName.split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    setSplitNames({ firstName, lastName });
    setIsEditing(true);
  };

  const validateForm = () => {
    const newErrors: { fullName?: string; email?: string; firstName?: string; lastName?: string } = {};
    let isValid = true;

    if (!splitNames.firstName.trim()) {
      newErrors.firstName = "First Name is required.";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      newErrors.email = "Please enter a valid email address.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (validateForm()) {
      setIsSaving(true);
      try {
        const first = splitNames.firstName.trim();
        const last = splitNames.lastName.trim();
        const newFullName = last ? `${first} ${last}` : first;

        const updatedData = { ...data, fullName: newFullName };
        // Call parent handler which is async
        await setData(updatedData);
        setIsEditing(false);
        setErrors({});
      } catch (e) {
        console.error("Save failed", e);
      } finally {
        setIsSaving(false);
      }
    } else {
      addToast("Please fix the errors in the form", "error");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
  };

  // Avatar Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setIsAvatarMenuOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsAvatarMenuOpen(false);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera.");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 300, 300);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setProfileImage(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const removePhoto = () => {
    setProfileImage(null);
    setIsAvatarMenuOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />

      <Card
        title="Personal Information"
        description="Manage your personal details and contact information."
      >
        <div className="flex justify-end -mt-16 mb-6">
          {!forceEditMode && (!isEditing ? (
            <Button onClick={startEditing} variant="secondary" size="sm">Edit</Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleCancel} variant="ghost" size="sm">Cancel</Button>
              <Button onClick={handleSave} variant="primary" size="sm" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          ))}
        </div>

        {/* Profile Header & Avatar */}
        <div className="flex items-center mb-8">
          <div className="relative group">
            <div
              onClick={() => (isEditing || forceEditMode) && setIsAvatarMenuOpen(!isAvatarMenuOpen)}
              className={`h-20 w-20 rounded-full overflow-hidden border-4 border-gray-50 shadow-sm transition-all bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold relative ${(isEditing || forceEditMode) ? 'cursor-pointer ring-2 ring-offset-2 ring-indigo-500' : 'cursor-default'}`}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                data.fullName.charAt(0).toUpperCase()
              )}

              {/* Edit Overlay */}
              {(isEditing || forceEditMode) && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FcCamera size={24} />
                </div>
              )}
            </div>

            {/* Avatar Menu */}
            {isAvatarMenuOpen && (isEditing || forceEditMode) && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsAvatarMenuOpen(false)}></div>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 overflow-hidden animate-fade-in">
                  <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                    <FcUpload size={16} /> Upload Photo
                  </button>
                  <button onClick={startCamera} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                    <FcCamera size={16} /> Use Camera
                  </button>
                  {profileImage && (
                    <button onClick={removePhoto} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-gray-100">
                      <Trash2 size={16} /> Remove Photo
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="ml-5">
            <h2 className="text-xl font-bold text-gray-900">{(isEditing || forceEditMode) ? (splitNames.firstName + ' ' + splitNames.lastName).trim() || data.fullName : data.fullName}</h2>
            <p className="text-sm text-gray-500 font-medium">{userRole === UserRole.SUPER_ADMIN ? 'Administrator' : 'Team Member'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!isEditing && !forceEditMode ? (
            <Input
              label="Full Name"
              value={data.fullName}
              disabled={true}
              className="bg-gray-50"
            />
          ) : (
            <>
              <Input
                label={<span>First Name <span className="text-red-500">*</span></span>}
                value={splitNames.firstName}
                onChange={e => {
                  const val = e.target.value;
                  setSplitNames(prev => ({ ...prev, firstName: val }));
                  if (errors.firstName) setErrors(prev => ({ ...prev, firstName: undefined }));

                  // Sync to parent immediately in forceEditMode
                  if (forceEditMode) {
                    const full = [val, splitNames.lastName].filter(Boolean).join(' ');
                    setData({ ...data, fullName: full });
                  }
                }}
                error={errors.firstName}
                placeholder="Ex. Jane"
              />
              <Input
                label="Last Name"
                value={splitNames.lastName}
                onChange={e => {
                  const val = e.target.value;
                  setSplitNames(prev => ({ ...prev, lastName: val }));
                  if (errors.lastName) setErrors(prev => ({ ...prev, lastName: undefined }));

                  // Sync to parent immediately in forceEditMode
                  if (forceEditMode) {
                    const full = [splitNames.firstName, val].filter(Boolean).join(' ');
                    setData({ ...data, fullName: full });
                  }
                }}
                error={errors.lastName}
                placeholder="Ex. Doe"
              />
            </>
          )}

          <Input
            label={(isEditing || forceEditMode) ? <span>Email Address <span className="text-red-500">*</span></span> : "Email Address"}
            type="email"
            value={data.email}
            onChange={e => {
              setData({ ...data, email: e.target.value });
              if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
            }}
            disabled={!isEditing && !forceEditMode}
            error={errors.email}
            placeholder="jane.doe@company.com"
          />
          <Input
            label="Phone Number"
            value={data.phone}
            onChange={e => setData({ ...data, phone: e.target.value })}
            disabled={!isEditing && !forceEditMode}
          />
          <Input
            label="Location"
            value={data.location}
            onChange={e => setData({ ...data, location: e.target.value })}
            disabled={!isEditing && !forceEditMode}
          />
        </div>
      </Card>

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Take Profile Photo</h3>
              <button onClick={stopCamera} className="text-gray-500 hover:text-gray-700">
                <FcCancel size={20} />
              </button>
            </div>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-square mb-6">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video>
            </div>
            <canvas ref={canvasRef} width="300" height="300" className="hidden"></canvas>
            <div className="flex justify-between space-x-3">
              <Button variant="secondary" className="flex-1" onClick={stopCamera}>Cancel</Button>
              <Button variant="primary" className="flex-1" onClick={capturePhoto}>Capture Photo</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Subcomponent: Company Profile Panel ---
interface CompanyProfileProps {
  data: CompanyProfile;
  setData: (data: CompanyProfile) => Promise<void>;
  forceEditMode?: boolean;
}

const CompanyProfilePanel: React.FC<CompanyProfileProps> = ({ data, setData, forceEditMode = false }) => {
  const [isEditing, setIsEditing] = useState(forceEditMode);
  const { addToast } = useToast();

  const [errors, setErrors] = useState<{ name?: string; website?: string }>({});

  const services = [
    { id: 1, name: 'Cloud Hosting', description: 'Scalable cloud infrastructure for enterprise apps.' },
    { id: 2, name: 'Data Analytics', description: 'Real-time insights and reporting dashboard.' },
    { id: 3, name: 'Consulting', description: 'Expert guidance on digital transformation.' },
  ];

  const validateField = (field: 'name' | 'website', value: string): string | undefined => {
    if (field === 'name') {
      if (!value || value.trim() === '') {
        return "Company Name is required.";
      }
    }
    if (field === 'website') {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
      if (!value || !urlPattern.test(value)) {
        return "Please enter a valid website URL.";
      }
    }
    return undefined;
  };

  const handleBlur = (field: 'name' | 'website') => {
    const error = validateField(field, field === 'name' ? data.name : data.website);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const isFormValid = () => {
    const nameValid = !validateField('name', data.name);
    const websiteValid = !validateField('website', data.website);
    return nameValid && websiteValid;
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isFormValid()) {
      setIsSaving(true);
      try {
        await setData(data);
        setIsEditing(false);
        setErrors({});
        addToast("Company profile saved", "success");
      } catch (e) {
        // Error handled in parent
      } finally {
        setIsSaving(false);
      }
    } else {
      addToast("Please fill in all required fields", "error");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Company Profile" description="Manage your organization's public details.">
        <div className="flex justify-end -mt-16 mb-6">
          {!forceEditMode && (!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm">Edit</Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleCancel} variant="ghost" size="sm">Cancel</Button>
              <Button
                onClick={handleSave}
                variant="primary"
                size="sm"
                disabled={!isFormValid() || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={<span>Company Name <span className="text-red-500">*</span></span>}
            value={data.name}
            disabled={!isEditing && !forceEditMode}
            onChange={e => {
              setData({ ...data, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            onBlur={() => handleBlur('name')}
            error={errors.name}
          />
          <Input
            label={<span>Website URL <span className="text-red-500">*</span></span>}
            value={data.website}
            disabled={!isEditing && !forceEditMode}
            onChange={e => {
              setData({ ...data, website: e.target.value });
              if (errors.website) setErrors({ ...errors, website: undefined });
            }}
            onBlur={() => handleBlur('website')}
            error={errors.website}
          />

          <div className="md:col-span-2">
            <TextArea label="Address" value={data.address} disabled={!isEditing && !forceEditMode} onChange={e => setData({ ...data, address: e.target.value })} rows={2} />
          </div>
          <div className="md:col-span-2">
            <TextArea label="Introduction" value={data.intro} disabled={!isEditing && !forceEditMode} onChange={e => setData({ ...data, intro: e.target.value })} rows={3} maxLength={500} />
            {(isEditing || forceEditMode) && <p className="text-xs text-right text-gray-500 mt-1">{data.intro.length}/500</p>}
          </div>
        </div>
      </Card>

      <Card title="Services / Products Catalog" description="Manage offerings visible to your customers.">
        <div className="flex justify-end -mt-16 mb-6">
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <FcPlus size={16} /> Add New
          </Button>
        </div>
        <div className="space-y-4">
          {services.map((svc) => (
            <div key={svc.id} className="group flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{svc.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{svc.description}</p>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                  <Pencil size={16} />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// --- Main Wrapper Component ---
interface Props {
  initialData?: UserProfile;
  userRole: UserRole;
}

const ProfileSection: React.FC<Props> = ({ initialData, userRole }) => {
  //   const SAVED_PROFILE_KEY = 'settings_user_profile';
  //   const SAVED_COMPANY_KEY = 'settings_company_profile';

  // State Initialization
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    phone: '',
    location: ''
  });

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: '',
    website: '',
    address: '',
    intro: ''
  });

  const [hasProfile, setHasProfile] = useState(false);
  const { addToast } = useToast();

  // Load from Supabase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Not logged in? Handle accordingly or just stop loading
          setLoading(false);
          return;
        }

        // 1. Get Personal Profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "Row not found"
          console.error('Error fetching profile:', profileError);
        }

        if (profile) {
          // Map DB keys (first_name, last_name) to frontend (fullName)
          const dbFullName = profile.full_name || (profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : profile.first_name || '');

          setUserProfile({
            fullName: dbFullName || '',
            email: profile.email || user.email || '',
            phone: profile.phone || '',
            location: profile.location || ''
          });
          setHasProfile(true);

          // 2. Get Company Profile (only if user profile exists)
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('owner_id', user.id)
            .single();

          if (company) {
            setCompanyProfile({
              name: company.name || '',
              website: company.website || '',
              address: company.address || '',
              intro: company.intro || ''
            });
          } else if (companyError && companyError.code !== 'PGRST116') {
            console.error("Error fetching company:", companyError)
          }
        } else {
          // Pre-fill email from auth if possible
          setUserProfile(prev => ({ ...prev, email: user.email || '' }));
        }

      } catch (err) {
        console.error("Unexpected error loading data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);


  const handleUpdateUser = async (data: UserProfile) => {
    setUserProfile(data);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Split name for DB
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        // Reverting to full_name as first_name/last_name columns don't exist
        full_name: data.fullName,
        // first_name: firstName,
        // last_name: lastName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      setHasProfile(true);
      addToast("Personal profile updated successfully", "success");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      addToast(`Failed to save changes: ${err.message || 'Unknown error'}`, "error");
    }
  };

  const handleUpdateCompany = async (data: CompanyProfile) => {
    setCompanyProfile(data);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase.from('companies').select('id').eq('owner_id', user.id).single();

      if (existing) {
        const { error } = await supabase.from('companies').update({
          name: data.name,
          website: data.website,
          address: data.address,
          intro: data.intro
        }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('companies').insert({
          owner_id: user.id,
          name: data.name,
          website: data.website,
          address: data.address,
          intro: data.intro
        });
        if (error) throw error;
      }

    } catch (err: any) {
      console.error("Error updating company:", err);
      // Show the actual error message or a fallback
      addToast(`Failed to save company changes: ${err.message || 'Unknown error'}`, "error");
    }
  };

  // Can view company profile?
  const canViewCompany = userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN;

  // Completeness Logic
  const getCompleteness = () => {
    let completed = 0;
    let total = 0;
    const userFields = ['fullName', 'email', 'phone', 'location'];
    total += userFields.length;
    completed += userFields.filter(f => (userProfile as any)[f]?.length > 0).length;

    if (canViewCompany) {
      const companyFields = ['name', 'website', 'address'];
      total += companyFields.length;
      completed += companyFields.filter(f => (companyProfile as any)[f]?.length > 0).length;
    }
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const percentage = getCompleteness();

  const getProgressColor = (pct: number) => {
    if (pct < 50) return 'bg-red-500';
    if (pct < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-400">Loading profile data...</div>;
  }

  return (
    <div className="space-y-10">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Profile Completeness</h2>
            <p className="text-sm text-gray-500">Complete your profile to unlock all features.</p>
          </div>
          <span className="text-2xl font-bold text-gray-700">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </Card>

      <PersonalProfile data={userProfile} setData={handleUpdateUser} userRole={userRole} />

      {canViewCompany && (
        <div className="space-y-6 animate-fade-in delay-100">
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-gray-900">Company & Offerings</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your company details and offerings.</p>
          </div>
          <CompanyProfilePanel data={companyProfile} setData={handleUpdateCompany} />
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
