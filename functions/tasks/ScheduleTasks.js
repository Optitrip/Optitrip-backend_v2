import cron from 'node-cron';
import Route from '../models/Route.js';

// Función para actualizar el estado de las rutas
const updateRouteStatus = async () => {
    try {
        const now = new Date();

        // startOfDay: Inicio de hoy (00:00:00)
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        // endOfDay: Final de hoy (23:59:59)
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        // fiveDaysAgo: Hace 5 días exactos
        const fiveDaysAgo = new Date(now);
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        const oneDayAgo = new Date(now);
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);



        await Route.updateMany(
            {
                departureTime: { $gte: startOfDay, $lt: endOfDay },
                status: "Ruta futura"
            },
            { $set: { status: "Ruta no iniciada" } }
        );

        // Cambiar rutas no iniciadas a "Ruta expirada" después de 1 día
        await Route.updateMany(
            {
                departureTime: { $lt: oneDayAgo },
                status: { $in: ["Ruta no iniciada"] }
            },
            { $set: { status: "Ruta expirada" } }
        );


        // Si ya pasaron 5 días de la salida y sigue en curso, asumimos que se abandonó.
        await Route.updateMany(
            {
                departureTime: { $lt: fiveDaysAgo },
                status: { $in: ["Ruta en curso"] }
            },
            { $set: { status: "Ruta vencida" } }
        );

        console.log(`[${new Date().toISOString()}] Route status update task completed.`);

    } catch (error) {
        console.error('Error updating route status:', error);
    }
};

// Programar la tarea para las 00:00
cron.schedule('0 0 * * *', () => {
    console.log('Running daily route status update...');
    updateRouteStatus();
}, {
    timezone: "America/Mexico_City" // Recomendado para asegurar que las 00:00 sean hora local
});