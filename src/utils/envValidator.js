// Environment variable validation utility
const requiredEnvVars = {
    REACT_APP_FIREBASE_API_KEY: { length: 39 },
    REACT_APP_FIREBASE_AUTH_DOMAIN: { contains: '.firebaseapp.com' },
    REACT_APP_FIREBASE_PROJECT_ID: {},
    REACT_APP_FIREBASE_STORAGE_BUCKET: { contains: '.appspot.com' },
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID: { type: 'number' },
    REACT_APP_FIREBASE_APP_ID: { contains: '1:' },
    REACT_APP_FIREBASE_MEASUREMENT_ID: { startsWith: 'G-' },
    REACT_APP_TMDB_API_KEY: { length: 32 }
};

export const validateEnvVariables = () => {
    if (process.env.NODE_ENV !== 'development') {
        return true;
    }

    console.group('🔍 Environment Variables Validation');
    console.log('Environment:', process.env.NODE_ENV);

    let isValid = true;
    const results = [];

    Object.entries(requiredEnvVars).forEach(([key, rules]) => {
        const value = process.env[key];
        let status = '✅';
        let message = 'Valid';

        if (!value) {
            status = '❌';
            message = 'Missing';
            isValid = false;
        } else {
            // Validate length if specified
            if (rules.length && value.length !== rules.length) {
                status = '❌';
                message = `Invalid length (expected ${rules.length}, got ${value.length})`;
                isValid = false;
            }

            // Validate if contains specific string
            if (rules.contains && !value.includes(rules.contains)) {
                status = '❌';
                message = `Should contain "${rules.contains}"`;
                isValid = false;
            }

            // Validate if starts with specific string
            if (rules.startsWith && !value.startsWith(rules.startsWith)) {
                status = '❌';
                message = `Should start with "${rules.startsWith}"`;
                isValid = false;
            }

            // Validate type
            if (rules.type === 'number' && isNaN(value)) {
                status = '❌';
                message = 'Should be a number';
                isValid = false;
            }
        }

        results.push({
            key,
            status,
            message,
            value: value ? `${value.slice(0, 3)}...${value.slice(-3)}` : undefined
        });
    });

    // Log results in a table format
    console.table(results.map(({ key, status, message, value }) => ({
        'Variable': key,
        'Status': status,
        'Message': message,
        'Value Preview': value || 'N/A'
    })));

    console.log(`\nOverall Status: ${isValid ? '✅ All variables are properly configured' : '❌ Some variables are missing or invalid'}`);
    console.groupEnd();

    return isValid;
}; 