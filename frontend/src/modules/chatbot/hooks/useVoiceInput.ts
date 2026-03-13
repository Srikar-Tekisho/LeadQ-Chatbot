import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Voice input states — explicit state machine, no confusing toggles.
 *
 *   idle  ──▶  listening  ──▶  processing  ──▶  idle
 *              │                                  ▲
 *              └──────── (cancel) ────────────────┘
 */
export type VoiceState = 'idle' | 'listening' | 'processing';

export interface UseVoiceInputReturn {
    /** Current voice state */
    voiceState: VoiceState;
    /** Whether the browser supports SpeechRecognition */
    isSupported: boolean;
    /** Start recording — user must explicitly click */
    startListening: () => void;
    /** Stop recording — user explicitly clicks stop */
    stopListening: () => void;
    /** Live transcript text (interim + final combined) */
    transcript: string;
    /** Error message if something went wrong */
    error: string | null;
    /** Clear any error */
    clearError: () => void;
}

/**
 * Dedicated voice input hook — clean state machine with no toggle confusion.
 *
 * @param onTranscriptReady  Called when final text is available (after stop)
 * @param existingText       Current text in the input field (preserved on start)
 */
export function useVoiceInput(
    onTranscriptReady: (text: string) => void,
    existingText: string = ''
): UseVoiceInputReturn {
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [isSupported, setIsSupported] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Refs for closure-safe access
    const recognitionRef = useRef<any>(null);
    const voiceStateRef = useRef<VoiceState>('idle');
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const baseTextRef = useRef('');
    const finalTextRef = useRef('');
    const onTranscriptReadyRef = useRef(onTranscriptReady);
    const existingTextRef = useRef(existingText);

    // Keep refs in sync
    useEffect(() => {
        voiceStateRef.current = voiceState;
    }, [voiceState]);

    useEffect(() => {
        onTranscriptReadyRef.current = onTranscriptReady;
    }, [onTranscriptReady]);

    useEffect(() => {
        existingTextRef.current = existingText;
    }, [existingText]);

    // Check browser support on mount
    useEffect(() => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        setIsSupported(!!SR);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch (_) { /* noop */ }
                recognitionRef.current = null;
            }
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
            }
        };
    }, []);

    /** Clear silence timer */
    const clearSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    }, []);

    /** Finalize the recording — transition to processing then idle */
    const finalize = useCallback(() => {
        clearSilenceTimer();

        const text = finalTextRef.current.trim();
        if (text) {
            // Brief processing state for visual feedback
            setVoiceState('processing');
            voiceStateRef.current = 'processing';

            // Deliver text and return to idle after a short delay
            setTimeout(() => {
                onTranscriptReadyRef.current(text);
                setVoiceState('idle');
                voiceStateRef.current = 'idle';
                setTranscript('');
                finalTextRef.current = '';
                baseTextRef.current = '';
            }, 400);
        } else {
            // Nothing captured — go straight to idle
            setVoiceState('idle');
            voiceStateRef.current = 'idle';
            setTranscript('');
            finalTextRef.current = '';
            baseTextRef.current = '';
        }
    }, [clearSilenceTimer]);

    /** Create a fresh SpeechRecognition instance */
    const createRecognition = useCallback(() => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return null;

        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            console.log('[Voice] Recognition started');
            setVoiceState('listening');
            voiceStateRef.current = 'listening';
            setError(null);
        };

        recognition.onresult = (event: any) => {
            let interim = '';
            let finalNew = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalNew += t;
                } else {
                    interim += t;
                }
            }

            // Reset silence timer on any speech activity
            if (finalNew || interim) {
                clearSilenceTimer();
                silenceTimerRef.current = setTimeout(() => {
                    if (voiceStateRef.current === 'listening') {
                        console.log('[Voice] Silence timeout — auto-stopping');
                        try { recognitionRef.current?.stop(); } catch (_) { /* noop */ }
                    }
                }, 5000); // 5 seconds of silence
            }

            // Accumulate final text
            if (finalNew) {
                finalTextRef.current = finalTextRef.current
                    + (finalTextRef.current ? ' ' : '')
                    + finalNew.trim();
            }

            // Build display text: base (existing) + final + interim
            const base = baseTextRef.current;
            const display = (base ? base + ' ' : '') + finalTextRef.current
                + (finalTextRef.current && interim ? ' ' : '')
                + interim;

            setTranscript(display);
        };

        recognition.onend = () => {
            console.log('[Voice] Recognition ended');
            if (voiceStateRef.current === 'listening') {
                // Normal end (silence timeout or user-initiated stop)
                finalize();
            }
            // If state is already 'idle' or 'processing', do nothing
        };

        recognition.onerror = (event: any) => {
            console.error('[Voice] Error:', event.error);
            clearSilenceTimer();

            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setError('Microphone access denied. Please allow microphone in your browser settings.');
            } else if (event.error === 'no-speech') {
                setError('No speech detected. Please try again.');
            } else if (event.error === 'network') {
                setError('Network error. Please check your connection.');
            } else if (event.error !== 'aborted') {
                setError(`Voice error: ${event.error}`);
            }

            setVoiceState('idle');
            voiceStateRef.current = 'idle';
            setTranscript('');
            finalTextRef.current = '';
            baseTextRef.current = '';
        };

        return recognition;
    }, [clearSilenceTimer, finalize]);

    /** Start listening — user explicitly initiates */
    const startListening = useCallback(() => {
        if (voiceStateRef.current !== 'idle') return;

        setError(null);

        // Destroy old instance to prevent stale state
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (_) { /* noop */ }
            recognitionRef.current = null;
        }

        const recognition = createRecognition();
        if (!recognition) {
            setError('Speech recognition is not supported in your browser. Please use Chrome.');
            return;
        }

        recognitionRef.current = recognition;

        // Preserve existing input text
        baseTextRef.current = existingTextRef.current;
        finalTextRef.current = '';
        setTranscript(existingTextRef.current);

        try {
            recognition.start();
        } catch (err: any) {
            console.error('[Voice] Start error:', err);
            setError('Could not start microphone. Please check permissions.');
            setVoiceState('idle');
            voiceStateRef.current = 'idle';
        }
    }, [createRecognition]);

    /** Stop listening — user explicitly stops */
    const stopListening = useCallback(() => {
        if (voiceStateRef.current !== 'listening') return;

        clearSilenceTimer();
        console.log('[Voice] User stopped');

        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
                // onend handler will call finalize()
            } catch (_) {
                // If stop fails, finalize manually
                finalize();
            }
        } else {
            finalize();
        }
    }, [clearSilenceTimer, finalize]);

    /** Clear error */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        voiceState,
        isSupported,
        startListening,
        stopListening,
        transcript,
        error,
        clearError,
    };
}
