import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar Firebase Admin
let serviceAccount;
try {
    const serviceAccountModule = await import(path.join(__dirname, '../config/serviceAccountKey.json'), {
        assert: { type: 'json' }
    });
    serviceAccount = serviceAccountModule.default;
} catch (error) {
    console.error('Error loading serviceAccountKey.json:', error);
    throw error;
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export const sendNotification = async (fcmToken, title, body, data = {}) => {
    const message = {
        notification: {
            title,
            body
        },
        data,
        token: fcmToken
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Notification sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Error sending notification:', error);
        return { success: false, error: error.message };
    }
};

export const sendMultipleNotifications = async (tokens, title, body, data = {}) => {
    const message = {
        notification: {
            title,
            body
        },
        data,
        tokens
    };

    try {
        const response = await admin.messaging().sendMulticast(message);
        console.log(`${response.successCount} notifications sent successfully`);
        return { success: true, response };
    } catch (error) {
        console.error('Error sending notifications:', error);
        return { success: false, error: error.message };
    }
};