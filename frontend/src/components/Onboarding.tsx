import React, { useState } from 'react';
import { Button, Input, TextArea, Select } from './UIComponents';
import { useToast } from './ToastContext';
import {
  Rocket,
  Target,
  Building2,
  User,
  ChevronRight,
  ChevronLeft,
  Zap,
  Sparkles,
  CheckCircle2,
  Mail,
  Layers,
  Heart,
  TrendingUp,
  Users,
  Layout,
  Globe,
  Briefcase,
  Link as LinkIcon,
  Camera,
  RefreshCw,
  Grid,
  Upload
} from 'lucide-react';
import { FcSalesPerformance, FcFlashOn } from 'react-icons/fc';
import { AVATAR_OPTIONS } from './AvatarOptions';

interface OnboardingProps {
  onComplete: () => void;
}

interface OnboardingData {
  // Step 1: Personal Info
  fullName: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  customRole: string;
  profileImage?: string; // Added for profile photo upload
  // Step 2: Organization
  companyName: string;
  companyWebsite: string;
  companyAddress: string;
  companyIntro: string;
  industry: string;
  customIndustry: string;
  teamSize: string;
  // Step 3: Discovery & Interests
  discoverySource: string;
  interests: string[];
  // Step 4: Team & Preferences
  teamInvites: string[];
  communicationPreference: string;
}

const INDUSTRIES = [
  { value: 'technology', label: 'Technology & Software' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'healthcare', label: 'Healthcare & Medical' },
  { value: 'education', label: 'Education & Training' },
  { value: 'retail', label: 'Retail & E-Commerce' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'consulting', label: 'Consulting & Services' },
  { value: 'manufacturing', label: 'Manufacturing & Industrial' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'nonprofit', label: 'Non-Profit & Government' },
  { value: 'realestate', label: 'Real Estate & Construction' },
  { value: 'legal', label: 'Legal & Compliance' },
  { value: 'other', label: 'Other' },
];

const TEAM_SIZES = [
  { value: 'solo', label: 'Just me' },
  { value: '2-10', label: '2-10 people' },
  { value: '11-50', label: '11-50 people' },
  { value: '51-200', label: '51-200 people' },
  { value: '201-500', label: '201-500 people' },
  { value: '500+', label: '500+ people' },
];

const ROLES = [
  { value: 'executive', label: 'Executive / C-Level' },
  { value: 'manager', label: 'Manager / Team Lead' },
  { value: 'professional', label: 'Professional / Specialist' },
  { value: 'entrepreneur', label: 'Entrepreneur / Founder' },
  { value: 'freelancer', label: 'Freelancer / Consultant' },
  { value: 'student', label: 'Student / Learner' },
  { value: 'creative', label: 'Creative / Designer' },
  { value: 'sales', label: 'Sales / Business Development' },
  { value: 'support', label: 'Customer Support / Service' },
  { value: 'other', label: 'Other' },
];

const DISCOVERY_SOURCES = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'linkedin', label: 'LinkedIn', icon: '🔗' },
  { id: 'telegram', label: 'Telegram', icon: '✈️' },
  { id: 'web-ad', label: 'Web Ads', icon: '🌍' },
  { id: 'other', label: 'Other', icon: '✨' },
];

const INTEREST_AREAS = [
  { id: 'leads', label: 'Lead Generation', icon: <TrendingUp className="text-green-500" size={20} />, description: 'Find and capture high-quality leads' },
  { id: 'automation', label: 'Workflow Automation', icon: <FcFlashOn size={24} />, description: 'Automate repetitive follow-up tasks' },
  { id: 'analytics', label: 'Deep Analytics', icon: <Sparkles className="text-blue-500" size={20} />, description: 'Gain insights into your sales performance' },
  { id: 'team', label: 'Team Collaboration', icon: <Users size={20} className="text-purple-500" />, description: 'Coordinate with your team in real-time' },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  // Add file input ref for profile photo upload
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fullNameRef = React.useRef<HTMLInputElement>(null);

  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    role: '',
    customRole: '',
    profileImage: '',
    companyName: '',
    companyWebsite: '',
    companyAddress: '',
    companyIntro: '',
    industry: '',
    customIndustry: '',
    teamSize: '',
    discoverySource: '',
    interests: [],
    teamInvites: [''],
    communicationPreference: 'email',
  });

  const handleProfileComplete = (imageUrl: string) => {
    setData(prev => ({ ...prev, profileImage: imageUrl }));
    // Wait for state update/render then focus
    setTimeout(() => {
      fullNameRef.current?.focus();
      fullNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const [profileMethod, setProfileMethod] = useState<'upload' | 'selfie' | 'avatar'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err) {
      addToast('Could not access camera', 'error');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        handleProfileComplete(imageData);
        stopCamera();
      }
    }
  };

  const steps = [
    { title: 'Welcome', icon: Rocket, description: 'Welcome to LeadQ.ai' },
    { title: 'Personal', icon: User, description: 'Tell us about yourself' },
    { title: 'Organization', icon: Building2, description: 'Your workplace' },
    { title: 'Discovery', icon: Target, description: 'Discovery & Needs' },
    { title: 'Launch', icon: Sparkles, description: 'Final setup' },
  ];

  const handleInterestToggle = (id: string) => {
    setData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const onboardingData = {
        profile: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          location: data.location,
        },
        company: {
          name: data.companyName,
          website: data.companyWebsite,
          address: data.companyAddress,
          intro: data.companyIntro,
          industry: data.industry === 'other' ? data.customIndustry : data.industry,
          teamSize: data.teamSize,
        },
        preferences: {
          role: data.role === 'other' ? data.customRole : data.role,
          communicationPreference: data.communicationPreference,
        },
        discovery: {
          source: data.discoverySource,
          interests: data.interests,
        },
        team: data.teamInvites.filter(email => email.trim() !== ''),
        completedAt: new Date().toISOString(),
      };

      localStorage.setItem('leadq_user_data', JSON.stringify(onboardingData));
      addToast('Great! Your LeadQ.ai environment is ready.', 'success');
      onComplete();
    } catch (error: any) {
      addToast('Failed to complete setup', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    switch (currentStep) {
      case 0: return true;
      case 1:
        const roleValid = data.role !== '' && (data.role !== 'other' || data.customRole.trim() !== '');
        const profileValid = data.profileImage !== '' && data.profileImage !== undefined;
        // Phone and Profile required
        return data.fullName.trim() !== '' && data.email.trim() !== '' && emailRegex.test(data.email) && data.phone.trim() !== '' && roleValid && profileValid;
      case 2:
        const industryValid = data.industry !== '' && (data.industry !== 'other' || data.customIndustry.trim() !== '');
        return data.companyName.trim() !== '' && industryValid && data.teamSize !== '';
      case 3:
        return data.discoverySource !== '' && data.interests.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl">
              <Rocket className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to LeadQ.ai
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
              Let's set up your workspace in just a few steps. This will help us personalize your lead management experience.
            </p>
            <div className="flex justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                <span>Fast & Easy</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-500" />
                <span>Personalized</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span>Boost Sales</span>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              {!data.profileImage && (
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              <p className="text-gray-500 mt-2">Help us know you better</p>
            </div>
            {/* Profile Photo Selection Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group mb-6">
                <div
                  className={`h-28 w-28 rounded-full overflow-hidden border-4 ${data.profileImage ? 'border-blue-500' : 'border-gray-100'} shadow-md bg-gray-50 flex items-center justify-center text-blue-600 cursor-pointer transition-all hover:scale-105`}
                  onClick={() => {
                    if (profileMethod === 'upload') fileInputRef.current?.click();
                    if (profileMethod === 'selfie' && !isCameraActive) startCamera();
                  }}
                >
                  {data.profileImage ? (
                    <img src={data.profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : isCameraActive ? (
                    <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center">
                      {profileMethod === 'upload' && <Upload className="w-8 h-8 mx-auto opacity-40" />}
                      {profileMethod === 'selfie' && <Camera className="w-8 h-8 mx-auto opacity-40" />}
                      {profileMethod === 'avatar' && <User className="w-8 h-8 mx-auto opacity-40" />}
                    </div>
                  )}
                </div>

                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {isCameraActive && (
                  <button
                    onClick={(e) => { e.stopPropagation(); capturePhoto(); }}
                    className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10"
                    title="Capture Photo"
                  >
                    <Camera size={20} />
                  </button>
                )}

                {!isCameraActive && data.profileImage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setData({ ...data, profileImage: '' });
                      if (profileMethod === 'selfie') startCamera();
                    }}
                    className="absolute -bottom-2 -right-2 bg-gray-600 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-10"
                    title="Change"
                  >
                    <RefreshCw size={16} />
                  </button>
                )}
              </div>

              {/* Method Selection Toggles */}
              <div className="flex bg-gray-100 p-1 rounded-xl gap-1 mb-4">
                <button
                  onClick={() => { setProfileMethod('upload'); stopCamera(); }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${profileMethod === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Upload size={14} /> Upload
                </button>
                <button
                  onClick={() => { setProfileMethod('selfie'); startCamera(); }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${profileMethod === 'selfie' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Camera size={14} /> Selfie
                </button>
                <button
                  onClick={() => { setProfileMethod('avatar'); stopCamera(); }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${profileMethod === 'avatar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid size={14} /> Avatar
                </button>
              </div>

              {profileMethod === 'avatar' && (
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-4 max-h-[420px] overflow-y-auto p-5 bg-gray-50 rounded-[24px] border border-gray-100 w-full mb-6 scrollbar-hide justify-items-center shadow-inner">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => handleProfileComplete(avatar.url)}
                      className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden border-2 transition-all hover:scale-110 flex-shrink-0 flex items-center justify-center ${data.profileImage === avatar.url ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100 shadow-md' : 'border-white bg-white shadow-sm hover:shadow-md'}`}
                    >
                      <img
                        src={avatar.url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Avatar&background=f3f4f6&color=94a3b8`;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleProfileComplete(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <span className="text-xs text-gray-500 font-medium italic">
                {profileMethod === 'upload' && "Upload a photo"}
                {profileMethod === 'selfie' && "Or take a quick live selfie"}
                {profileMethod === 'avatar' && "Or choose a cute avatar"}
                <span className="text-red-500 ml-1">* Mandatory</span>
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                ref={fullNameRef}
                label={<span>Full Name <span className="text-red-500">*</span></span>}
                value={data.fullName}
                onChange={(e) => setData({ ...data, fullName: e.target.value })}
                placeholder="John Doe"
              />
              <Input
                label={<span>Email Address <span className="text-red-500">*</span></span>}
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={<span>Phone Number <span className="text-red-500">*</span></span>}
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
              <Input
                label="Location"
                value={data.location}
                onChange={(e) => setData({ ...data, location: e.target.value })}
                placeholder="San Francisco, CA"
              />
            </div>
            <Select
              label={<span>Your Role <span className="text-red-500">*</span></span>}
              value={data.role}
              onChange={(e) => setData({ ...data, role: e.target.value })}
              options={[{ value: '', label: 'Select your role...' }, ...ROLES]}
            />
            {data.role === 'other' && (
              <Input
                label={<span>Please specify <span className="text-red-500">*</span></span>}
                value={data.customRole}
                onChange={(e) => setData({ ...data, customRole: e.target.value })}
              />
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Company Details</h2>
              <p className="text-gray-500 mt-2">Tell us about your organization</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={<span>Company Name <span className="text-red-500">*</span></span>}
                value={data.companyName}
                onChange={(e) => setData({ ...data, companyName: e.target.value })}
              />
              <Input
                label="Website"
                value={data.companyWebsite}
                onChange={(e) => setData({ ...data, companyWebsite: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label={<span>Industry <span className="text-red-500">*</span></span>}
                value={data.industry}
                onChange={(e) => setData({ ...data, industry: e.target.value })}
                options={[{ value: '', label: 'Select industry...' }, ...INDUSTRIES]}
              />
              <Select
                label={<span>Team Size <span className="text-red-500">*</span></span>}
                value={data.teamSize}
                onChange={(e) => setData({ ...data, teamSize: e.target.value })}
                options={[{ value: '', label: 'Select team size...' }, ...TEAM_SIZES]}
              />
            </div>
            <TextArea
              label="Company Introduction"
              value={data.companyIntro}
              onChange={(e) => setData({ ...data, companyIntro: e.target.value })}
              placeholder="How can LeadQ help your organization?"
              rows={3}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">How did you find us?</h2>
              <p className="text-gray-500 mt-2">Personalize your journey and help us improve</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Discovery Source</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {DISCOVERY_SOURCES.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => setData({ ...data, discoverySource: source.id })}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${data.discoverySource === source.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-gray-100 hover:bg-gray-50'
                      }`}
                  >
                    <span className="text-xl">{source.icon}</span>
                    <span className="text-[10px] font-bold text-gray-700">{source.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">What are you looking for?</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INTEREST_AREAS.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => handleInterestToggle(area.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${data.interests.includes(area.id) ? 'border-green-500 bg-green-50 ring-2 ring-green-100 focus:ring-0' : 'border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                      }`}
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">{area.icon}</div>
                    <div>
                      <div className="font-bold text-sm text-gray-900">{area.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{area.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">You're All Set! 🎉</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your profile and LeadQ CRM strategy are ready.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 text-left max-w-lg mx-auto">
              <h3 className="font-bold text-sm text-gray-900 mb-4">Summary:</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-3"><User size={16} className="text-blue-500" /> {data.fullName}</div>
                <div className="flex items-center gap-3"><Building2 size={16} className="text-purple-500" /> {data.companyName}</div>
                <div className="flex items-center gap-3"><Sparkles size={16} className="text-indigo-500" /> {data.interests.length} Interests Selected</div>
                <div className="flex items-center gap-3"><Globe size={16} className="text-green-500" /> Found via {DISCOVERY_SOURCES.find(s => s.id === data.discoverySource)?.label}</div>
              </div>
            </div>
            <div className="mt-8">
              <p className="text-xs text-gray-400">By clicking launch, you agree to our Terms of Service.</p>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 overflow-x-auto pb-4">
          <div className="flex items-center justify-center gap-2 min-w-max">
            {steps.map((step, idx) => (
              <React.Fragment key={idx}>
                <button
                  onClick={() => idx < currentStep && setCurrentStep(idx)}
                  disabled={idx > currentStep}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${idx === currentStep ? 'bg-blue-600 text-white shadow-lg' : idx < currentStep ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    }`}
                >
                  {idx < currentStep ? <CheckCircle2 size={18} /> : <step.icon size={18} />}
                  <span className="text-xs font-bold uppercase tracking-wider">{step.title}</span>
                </button>
                {idx < steps.length - 1 && <div className={`w-8 h-0.5 ${idx < currentStep ? 'bg-green-300' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
            {renderStepContent()}
          </div>
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            {currentStep > 0 ? (
              <Button variant="ghost" onClick={() => setCurrentStep(p => p - 1)}>
                <ChevronLeft size={16} className="mr-2" /> Back
              </Button>
            ) : <div />}
            <div className="flex gap-3">
              {currentStep > 0 && currentStep < 4 && (
                <button
                  onClick={() => canProceed() && setCurrentStep(p => p + 1)}
                  disabled={!canProceed()}
                  className={`text-xs font-bold uppercase tracking-widest transition-colors ${canProceed() ? 'text-gray-400 hover:text-gray-600' : 'text-gray-200 cursor-not-allowed'
                    }`}
                >
                  Skip
                </button>
              )}
              <Button
                variant="primary"
                onClick={currentStep < steps.length - 1 ? () => setCurrentStep(p => p + 1) : handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="bg-slate-900 hover:bg-black text-white px-8"
              >
                {isSubmitting ? 'Loading...' : currentStep < steps.length - 1 ? 'Continue' : 'Launch Dashboard'}
                {currentStep < steps.length - 1 && <ChevronRight size={16} className="ml-2" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
