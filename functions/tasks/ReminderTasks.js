import cron from 'node-cron';
import Route from '../models/Route.js';
import User from '../models/User.js';
import { sendNotification } from '../services/NotificationService.js';
import { formatInTimeZone } from 'date-fns-tz';

// Ejecutar cada minuto
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        // Calculamos 5 minutos en el futuro
        const fiveMinutesLater = new Date(now.getTime() + 5 * 60000);

        const horaMexico = formatInTimeZone(now, 'America/Mexico_City', 'yyyy-MM-dd HH:mm:ss');
        console.log(`[CRON] Ejecutando tarea. Hora México: ${horaMexico} | Hora UTC Servidor: ${now.toISOString()}`);


        const routes = await Route.find({
            status: { $in: ["Ruta no iniciada", "Ruta futura"] },
            departureTime: {
                $gte: now,
                $lte: fiveMinutesLater
            },
            reminderSent: { $ne: true } 
        }).populate('driverId');

        if (routes.length > 0) {
             console.log(`[CRON] Se encontraron ${routes.length} rutas para recordar.`);
        }

        for (const route of routes) {
            if (route.driverId && route.driverId.fcmToken) {
                const title = "¡Prepárate para tu ruta!";

                const formattedTime = formatInTimeZone(
                    route.departureTime,
                    'America/Mexico_City',
                    'HH:mm'
                );

                const body = `Tu ruta ${route.codeRoute} inicia a las ${formattedTime}. ¡Prepárate!`;

                const data = {
                    type: "route_reminder",
                    codeRoute: route.codeRoute,
                    routeId: route._id.toString()
                };

                await sendNotification(route.driverId.fcmToken, title, body, data);

                // Marcar como enviado para no spamear
                route.reminderSent = true;
                await route.save();

                console.log(`[SUCCESS] Recordatorio enviado para ruta ${route.codeRoute} a las ${horaMexico}`);
            }
        }
    } catch (error) {
        console.error('[ERROR] Error en tarea de recordatorios:', error);
    }
});

console.log('Tarea de recordatorios iniciada');

cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        // Calculamos 1 minuto hacia adelante para dar un pequeño margen
        const oneMinuteLater = new Date(now.getTime() + 1 * 60000);

        const horaMexico = formatInTimeZone(now, 'America/Mexico_City', 'yyyy-MM-dd HH:mm:ss');
        console.log(`[CRON START] Ejecutando tarea de inicio. Hora México: ${horaMexico}`);

        const routes = await Route.find({
            status: { $in: ["Ruta no iniciada", "Ruta futura"] },
            departureTime: {
                $gte: now,
                $lte: oneMinuteLater
            },
            startNotificationSent: { $ne: true } // Verificar que no se haya enviado
        }).populate('driverId');

        if (routes.length > 0) {
            console.log(`[CRON START] Se encontraron ${routes.length} rutas para notificar inicio.`);
        }

        for (const route of routes) {
            if (route.driverId && route.driverId.fcmToken) {
                const title = "¡Es hora de iniciar tu ruta!";
                
                const body = `Tu ruta ${route.codeRoute} debe iniciar ahora. ¡Buena suerte!`;

                const data = {
                    type: "route_start",  
                    codeRoute: route.codeRoute,
                    routeId: route._id.toString()
                };

                await sendNotification(route.driverId.fcmToken, title, body, data);

                // Marcar como enviado
                route.startNotificationSent = true;
                await route.save();

                console.log(`[SUCCESS START] Notificación de inicio enviada para ruta ${route.codeRoute}`);
            }
        }
    } catch (error) {
        console.error('[ERROR START] Error en tarea de notificaciones de inicio:', error);
    }
});

console.log('Tarea de notificaciones de inicio iniciada');