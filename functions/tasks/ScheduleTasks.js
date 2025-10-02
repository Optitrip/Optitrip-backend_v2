import cron from 'node-cron';
import Route from '../models/Route.js';

// Función para actualizar el estado de las rutas
const updateRouteStatus = async () => {
    try {
        const currentDate = new Date();
        const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

        // Actualizar rutas con "Ruta futura" a "Ruta no iniciada"
        await Route.updateMany(
            {
                departureTime: { $gte: startOfDay, $lt: endOfDay },
                status: "Ruta futura"
            },
            { $set: { status: "Ruta no iniciada" } }
        );

        // Actualizar rutas con "Ruta no iniciada" a "Ruta vencida"
        await Route.updateMany(
            {
                departureTime: { $lt: startOfDay },
                status: "Ruta no iniciada"
            },
            { $set: { status: "Ruta vencida" } }
        );

        console.log('Route status updated successfully.');
    } catch (error) {
        console.error('Error updating route status:', error);
    }
};

// Programar la tarea para que se ejecute a las 00:00 todos los días
cron.schedule('0 0 * * *', () => {
    console.log('Running daily route status update...');
    updateRouteStatus();
});