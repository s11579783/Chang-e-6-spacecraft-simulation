// Configuration for the AI assistant
async function loadConfig() {
    try {
        const response = await fetch('/config');
        const config = await response.json();
        window.env = config;
        console.log('Configuration loaded:', config);
    } catch (error) {
        console.warn('Failed to load configuration:', error);
        // Fallback configuration
        window.env = {
            DEFAULT_LANGUAGE: 'en',
            DEBUG_MODE: false,
            FALLBACK_TO_LOCAL: true,
            DEEPSEEK_API_KEY: null
        };
    }
}

// Load configuration
loadConfig();

// Export the configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.env;
} 