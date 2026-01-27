import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

interface FeedbackPopupProps {
    onClose: () => void;
    onConfirmExit: () => void;
}

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ onClose, onConfirmExit }) => {
    const [rating, setRating] = useState<number | null>(null);
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [description, setDescription] = useState("");

    // Get visible emojis based on rating or hovered state
    const getVisibleEmojis = () => {
        const activeRating = hoveredStar || rating;
        if (!activeRating) {
            return [
                { emoji: '😟', rating: 2 },
                { emoji: '😐', rating: 3 },
                { emoji: '😊', rating: 4 }
            ];
        }
        if (activeRating <= 2) {
            return [
                { emoji: '😠', rating: 1 },
                { emoji: '😟', rating: 2 },
                { emoji: '😐', rating: 3 }
            ];
        } else if (activeRating <= 4) {
            return [
                { emoji: '😐', rating: 3 },
                { emoji: '😊', rating: 4 },
                { emoji: '😍', rating: 5 }
            ];
        } else {
            return [
                { emoji: '😊', rating: 4 },
                { emoji: '😍', rating: 5 }
            ];
        }
    };

    // Get feedback message based on rating
    const getFeedbackMessage = () => {
        if (!rating) {
            return { emoji1: '💙', text: "We'd love your feedback!", emoji2: '💬', color: 'text-blue-500' };
        }
        if (rating === 1) {
            return { emoji1: '😞', text: "We're sorry your experience was poor.", emoji2: '🙏', color: 'text-red-500' };
        } else if (rating === 2) {
            return { emoji1: '😟', text: "Thanks for your honesty. We'll work to improve.", emoji2: '💪', color: 'text-yellow-600' };
        } else if (rating === 3) {
            return { emoji1: '🙂', text: "Thanks! Let us know how we can do better.", emoji2: '💡', color: 'text-blue-500' };
        } else if (rating === 4) {
            return { emoji1: '😊', text: 'Great! We appreciate your feedback!', emoji2: '🎉', color: 'text-green-500' };
        } else {
            return { emoji1: '🎉', text: "You're amazing! Thank you!", emoji2: '✨', color: 'text-green-600' };
        }
    };

    const handleSubmit = () => {
        if (!rating) return;
        // Optionally, you can use description here for further processing
        setSubmitted(true);
        setTimeout(() => {
            onConfirmExit();
        }, 1500);
    };

    const handleStarClick = (star: number) => {
        setRating(star);
    };

    const handleEmojiClick = (emojiRating: number) => {
        setRating(emojiRating);
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full mx-4">
                    <div className="text-6xl mb-4">
                        {rating && rating >= 4 ? '🎉' : '💙'}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {rating && rating >= 4 ? 'Thank you!' : 'Thanks for your feedback!'}
                    </h3>
                    <p className="text-gray-500">
                        {rating && rating >= 4 ? "We're glad you enjoyed it!" : "We'll work hard to improve!"}
                    </p>
                    {description && (
                        <div className="mt-4 text-left">
                            <span className="block text-sm font-semibold text-gray-700 mb-1">Your comments:</span>
                            <p className="text-gray-600 text-sm bg-gray-100 rounded-lg p-2">{description}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const visibleEmojis = getVisibleEmojis();
    const feedbackMessage = getFeedbackMessage();
    const displayRating = hoveredStar !== null ? hoveredStar : rating;
    const activeRating = hoveredStar || rating;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 relative overflow-hidden">
                
                {/* Close Button */}
                <button
                    onClick={() => {
                        setRating(null);
                        setDescription("");
                        setSubmitted(false);
                        onClose();
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 z-10"
                    title="Close"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="pt-8 pb-4 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <span className="text-3xl">👑</span>
                        <span>Rate your experience</span>
                    </h3>
                </div>

                {/* Blue Card with Emojis and Stars */}
                <div className="mx-6 my-4 bg-sky-100 rounded-2xl p-5 border-2 border-sky-200">
                    
                    {/* Emojis Row */}
                    <div className="flex justify-center items-end gap-4 mb-6">
                        {visibleEmojis.map(({ emoji, rating: emojiRating }) => {
                            const isSelected = activeRating === emojiRating;
                            const isCenter = !activeRating && emojiRating === 3;
                            
                            return (
                                <button
                                    key={`${emoji}-${emojiRating}`}
                                    onClick={() => handleEmojiClick(emojiRating)}
                                    className={`transition-transform duration-200 ${
                                        isSelected ? 'scale-100' : 'scale-75 opacity-80 hover:opacity-100 hover:scale-90'
                                    }`}
                                    title={`Rate ${emojiRating} stars`}
                                >
                                    <div className={`rounded-full flex items-center justify-center transition-all duration-200 ${
                                        isSelected
                                            ? 'w-20 h-20 bg-white border-3 border-sky-400 shadow-lg' 
                                            : isCenter
                                            ? 'w-16 h-16 bg-white/60 border-2 border-sky-300/50'
                                            : 'w-14 h-14'
                                    }`}>
                                        <span className={`select-none ${
                                            isSelected ? 'text-5xl' : isCenter ? 'text-4xl' : 'text-3xl'
                                        }`}>
                                            {emoji}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Stars Row */}
                    <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = displayRating !== null && star <= displayRating;
                            
                            return (
                                <button
                                    key={star}
                                    onClick={() => handleStarClick(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(null)}
                                    className="transition-transform duration-150 hover:scale-110 p-0.5"
                                    title={`${star} star${star > 1 ? 's' : ''}`}
                                >
                                    <Star
                                        size={26}
                                        className={`transition-colors duration-150 ${
                                            isFilled
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'fill-transparent text-sky-300'
                                        }`}
                                        strokeWidth={1.5}
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>


                {/* Feedback Message */}
                {rating && (
                    <div className="pb-2 text-center">
                        <p className={`text-base font-semibold ${feedbackMessage.color}`}>
                            {feedbackMessage.emoji1} {feedbackMessage.text} {feedbackMessage.emoji2}
                        </p>
                    </div>
                )}

                {/* Description Box (after rating) */}
                {rating && (
                    <div className="px-6 pb-2">
                        <textarea
                            className="w-full rounded-xl border border-gray-300 p-3 text-gray-800 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                            rows={3}
                            placeholder="Tell us more about your experience..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                )}

                {/* Submit Button */}
                <div className="px-6 pb-6 pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={!rating}
                        className={`w-full py-3 font-semibold rounded-xl transition-all duration-200 ${
                            rating 
                                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {rating ? 'Submit Feedback' : 'Select a rating to continue'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPopup;
