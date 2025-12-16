import React, { useState } from 'react';
import { FcFlashOn, FcStart, FcPrevious, FcCheckmark, FcElectronics, FcGlobe, FcPrivacy } from 'react-icons/fc';
import { Button, Card } from '../UIComponents';

const CompanyAboutSection: React.FC = () => {
    const [showDetails, setShowDetails] = useState(false);

    if (showDetails) {
        return (
            <div className="animate-fade-in space-y-6">
                <Button variant="ghost" onClick={() => setShowDetails(false)} className="mb-4 pl-0 hover:bg-transparent hover:text-indigo-600 transition-colors">
                    <span className="mr-2"><FcPrevious size={18} /></span> Back to Overview
                </Button>

                <div className="space-y-8">
                    {/* Header */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Platform Specifications</h2>
                        <p className="text-gray-500 mt-2">Comprehensive breakdown of LeadQ.AI's capabilities and architecture.</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Core Capabilities" className="h-full">
                            <ul className="space-y-4 pt-2">
                                {[
                                    'Autonomous lead scoring and segmentation',
                                    'Multi-channel outreach automation (Email, SMS, LinkedIn)',
                                    'Predictive analytics for customer churn',
                                    'Real-time sentiment analysis using NLP'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start text-sm text-gray-700">
                                        <span className="mr-3 mt-0.5 flex-shrink-0"><FcCheckmark size={18} /></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <div className="grid grid-cols-1 gap-6">
                            <Card className="flex items-start p-6">
                                <span className="mt-1 mr-4"><FcElectronics size={24} /></span>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">Engine Architecture</h3>
                                    <p className="text-xs text-gray-500 mt-1">Built on a distributed microservices mesh with sub-20ms latency.</p>
                                </div>
                            </Card>
                            <Card className="flex items-start p-6">
                                <span className="mt-1 mr-4"><FcGlobe size={24} /></span>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">Global CDN</h3>
                                    <p className="text-xs text-gray-500 mt-1">Content delivery via 200+ edge locations worldwide.</p>
                                </div>
                            </Card>
                            <Card className="flex items-start p-6">
                                <span className="mt-1 mr-4"><FcPrivacy size={24} /></span>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">Enterprise Security</h3>
                                    <p className="text-xs text-gray-500 mt-1">SOC 2 Type II compliant with end-to-end generic encryption.</p>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Embedded Video Section */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Visual Demo</h3>
                        <div
                            className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200"
                            style={{ height: 0, paddingBottom: 'calc(56.25%)', position: 'relative', width: '100%' }}
                        >
                            <iframe
                                allow="autoplay; gyroscope;"
                                allowFullScreen
                                height="100%"
                                referrerPolicy="strict-origin"
                                src="https://www.kapwing.com/e/693fed655e6528c6ca55d0a9"
                                style={{ border: 0, height: '100%', left: 0, overflow: 'hidden', position: 'absolute', top: 0, width: '100%' }}
                                title="Embedded content made on Kapwing"
                                width="100%"
                            ></iframe>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in space-y-8 relative">
            {/* Logo */}
            <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-200">
                <FcFlashOn size={48} />
            </div>

            {/* Title & Badge */}
            <div className="space-y-3">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">LEADQ.AI</h1>
                <p className="text-lg text-indigo-600 font-semibold tracking-wide uppercase">Interactive AI Marketing Suite</p>
                <div className="inline-block mt-2">
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-gray-200">
                        V2.4.0 • Enterprise Build
                    </span>
                </div>
            </div>

            {/* Description */}
            <div className="max-w-2xl text-gray-500 leading-relaxed text-center">
                <p>
                    LeadQ.ai bridges the physical and digital worlds using advanced Generative AI.
                    Our mission is to streamline networking, automate follow-ups, and provide actionable business intelligence in real time.
                </p>
            </div>

            {/* Action Button */}
            <div className="pt-4">
                <Button onClick={() => setShowDetails(true)} className="flex items-center gap-2 px-6 py-3 text-base shadow-lg shadow-indigo-200">
                    <FcStart size={18} />
                    View Details
                </Button>
            </div>

            {/* Footer / Copyright */}
            <div className="mt-12 text-gray-300 text-xs">
                &copy; 2025 LeadQ Inc. All rights reserved.
            </div>
        </div>
    );
};

export default CompanyAboutSection;
