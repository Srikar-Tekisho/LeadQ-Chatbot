/**
 * LeadQ Chatbot API Configuration
 * Resolves the backend URL for the standalone chatbot service.
 */

function resolveApiRoot() {
    let base = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || '';

    // Remove trailing slash if present
    base = base.replace(/\/$/, "");

    // Strip /api/v1 suffix if already included
    if (base.endsWith('/api/v1')) {
        base = base.substring(0, base.length - 7);
    }

    // Force HTTPS for Render domain
    if (base.includes('onrender.com')) {
        base = base.replace('http://', 'https://');
    }

    // Fallback to local chatbot backend
    if (!base || base.startsWith('/') || base === 'undefined') {
        const fallback = 'http://localhost:5002';
        console.warn(`[API Config] Falling back to: ${fallback}`);
        base = fallback;
    }

    return base;
}

const rootUrl = resolveApiRoot();

// Root URL (no path suffix)
export const API_BASE_ROOT = rootUrl;

// Full API v1 URL used by chatbot service
export const API_BASE_URL = `${rootUrl}/api/v1`;
