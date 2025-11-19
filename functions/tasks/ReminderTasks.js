import cron from 'node-cron';
import Route from '../models/Route.js';
import User from '../models/User.js';
import { sendNotification } from '../services/NotificationService.js';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

// Ejecutar cada minuto
cron.schedule('* * * * *', async () => {
    try {
        // Hora actual en zona horaria de México
        const nowMexico = toZonedTime(new Date(), 'America/Mexico_City');
        const fiveMinutesLater = new Date(nowMexico.getTime() + 5 * 60000);

        console.log(`[${nowMexico.toISOString()}] Verificando rutas para recordatorios...`);
        console.log(`Buscando rutas entre: ${nowMexico.toISOString()} y ${fiveMinutesLater.toISOString()}`);

        // Buscar rutas que inicien en los próximos 5 minutos
        const routes = await Route.find({
            status: { $in: ["Ruta no iniciada", "Ruta futura"] },
            departureTime: {
                $gte: nowMexico,
                $lte: fiveMinutesLater
            },
            reminderSent: { $ne: true } 
        }).populate('driverId');

        console.log(`Rutas encontradas: ${routes.length}`);

        if (routes.length > 0) {
            routes.forEach(r => {
                console.log(`  - Ruta ${r.codeRoute}: Salida ${r.departureTime}, Recordatorio enviado: ${r.reminderSent}`);
            });
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

                console.log(`Enviando recordatorio para ruta ${route.codeRoute}...`);
                const result = await sendNotification(route.driverId.fcmToken, title, body, data);

                if (result.success) {
                    // Marcar como enviado
                    route.reminderSent = true;
                    await route.save();
                    console.log(`Recordatorio enviado exitosamente para ruta ${route.codeRoute}`);
                } else {
                    console.log(`Error al enviar recordatorio para ruta ${route.codeRoute}:`, result.error);
                }
            } else {
                console.log(`Ruta ${route.codeRoute}: Driver sin FCM token`);
            }
        }
    } catch (error) {
        console.error('Error en tarea de recordatorios:', error);
    }
});

console.log('Tarea de recordatorios de rutas iniciada - Ejecutándose cada minuto');