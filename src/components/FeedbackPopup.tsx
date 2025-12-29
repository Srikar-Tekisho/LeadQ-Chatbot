import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, LogOut } from 'lucide-react';

interface FeedbackPopupProps {
    onClose: () => void;
    onConfirmExit: () => void;
}

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ onClose, onConfirmExit }) => {
    const [rating, setRating] = useState<number | null>(null);
    const [comment, setComment] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const emojis = [
        { level: 1, label: '😠', text: 'Terrible' },
        { level: 2, label: '🙁', text: 'Bad' },
        { level: 3, label: '😐', text: 'Okay' },
        { level: 4, label: '🙂', text: 'Good' },
        { level: 5, label: '😍', text: 'Amazing' },
    ];

    const handleSubmit = async () => {
        if (!rating) {
            onConfirmExit(); // Skip if no rating selected
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Determine topic based on context or generic
                await supabase.from('feedback_submissions').insert({
                    user_id: user.id,
                    topic: 'Exit Survey',
                    message: `Rating: ${rating}/5. Comment: ${comment}`
                });
            }
        } catch (e) {
            console.error("Feedback error", e);
        }

        setSubmitted(true);
        setTimeout(() => {
            onConfirmExit();
        }, 1200);
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm w-full transform scale-100 transition-all">
                    <div className="text-5xl mb-4 animate-bounce">👋</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">See you soon!</h3>
                    <p className="text-gray-500">Thanks for your feedback.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 relative overflow-hidden flex flex-col animate-scale-up">

                {/* Decorative Top */}
                <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                    <X size={20} />
                </button>

                <div className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Leaving so soon?</h3>
                    <p className="text-gray-500 mb-8">How was your session today?</p>

                    {/* Emoji Rating */}
                    <div className="flex justify-between gap-2 mb-8 px-2">
                        {emojis.map((e) => (
                            <button
                                key={e.level}
                                onClick={() => setRating(e.level)}
                                className={`flex flex-col items-center gap-2 group transition-all duration-200 transform hover:scale-110 ${rating === e.level ? 'scale-125' : 'opacity-60 hover:opacity-100'}`}
                            >
                                <span className="text-4xl filter drop-shadow-sm group-hover:drop-shadow-md select-none transition-transform">{e.label}</span>
                                <span className={`text-xs font-medium transition-colors ${rating === e.level ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                    {e.text}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Comment Box (Always Visible) */}
                    <div className="mb-6">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us a bit more... (how can we improve?)"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSubmit}
                            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2"
                        >
                            <LogOut size={16} />
                            {rating ? 'Submit & Logout' : 'Logout'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPopup;
