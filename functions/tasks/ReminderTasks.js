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

                // Formateamos la hora para que al usuario le diga "10:40" y no "16:40"
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