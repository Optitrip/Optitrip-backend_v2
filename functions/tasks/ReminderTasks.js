import cron from 'node-cron';
import Route from '../models/Route.js';
import User from '../models/User.js';
import { sendNotification } from '../services/NotificationService.js';
import { formatInTimeZone } from 'date-fns-tz';

// Ejecutar cada minuto
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        const fiveMinutesLater = new Date(now.getTime() + 5 * 60000);

        // Buscar rutas que inicien en los próximos 5 minutos
        const routes = await Route.find({
            status: { $in: ["Ruta no iniciada", "Ruta futura"] },
            departureTime: {
                $gte: now,
                $lte: fiveMinutesLater
            },
            reminderSent: { $ne: true } 
        }).populate('driverId');

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

                route.reminderSent = true;
                await route.save();

                console.log(`Recordatorio enviado para ruta ${route.codeRoute}`);
            }
        }
    } catch (error) {
        console.error('Error en tarea de recordatorios:', error);
    }
});

console.log('Tarea de recordatorios iniciada');