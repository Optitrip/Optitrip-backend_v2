import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let serviceAccount;

try {
    // Verificamos si existe la variable de entorno
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Convertimos el string comprimido de vuelta a un Objeto JSON real
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        throw new Error('La variable de entorno FIREBASE_SERVICE_ACCOUNT no está definida.');
    }
} catch (error) {
    console.error('Error crítico al cargar credenciales de Firebase:', error.message);
}

// Inicializar Firebase solo si tenemos las credenciales
if (serviceAccount) {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin inicializado correctamente');
    }
} else {
    console.error('Firebase Admin NO se pudo inicializar - credenciales faltantes');
}

export const sendNotification = async (fcmToken, title, body, data = {}) => {
    const stringData = {};
    for (const key in data) {
        stringData[key] = String(data[key]);
    }

    stringData.title = title;
    stringData.body = body;

    const message = {
        data: stringData,
        token: fcmToken,
        android: {
            priority: 'high',
        }
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