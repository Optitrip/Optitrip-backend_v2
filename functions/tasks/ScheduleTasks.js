import cron from 'node-cron';
import Route from '../models/Route.js';

const updateRouteStatus = async () => {
    try {
        // Obtenemos la fecha actual
        const now = new Date();

        // DE "Ruta futura" A "Ruta no iniciada"    
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        await Route.updateMany(
            {
                departureTime: { $lte: endOfDay }, // Menor o igual a hoy (incluye pasado)
                status: "Ruta futura"
            },
            { $set: { status: "Ruta no iniciada" } }
        );

        // DE "Ruta no iniciada" A "Ruta expirada"        
        const expirationThreshold = new Date(now);
        expirationThreshold.setHours(expirationThreshold.getHours() - 12); // 12 horas de tolerancia

        await Route.updateMany(
            {
                departureTime: { $lt: expirationThreshold },
                status: "Ruta no iniciada"
            },
            { $set: { status: "Ruta expirada" } }
        );

        // DE "Ruta en curso" A "Ruta vencida" (Abandono)
        const fiveDaysAgo = new Date(now);
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        await Route.updateMany(
            {
                departureTime: { $lt: fiveDaysAgo },
                status: "Ruta en curso"
            },
            { $set: { status: "Ruta vencida" } }
        );

        console.log(`[${new Date().toISOString()}] Estatus de rutas actualizados.`);

    } catch (error) {
        console.error('Error actualizando estatus:', error);
    }
};

cron.schedule('0 * * * *', () => { 
    console.log('Running hourly route status check...');
    updateRouteStatus();
}, {
    timezone: "America/Mexico_City"
});