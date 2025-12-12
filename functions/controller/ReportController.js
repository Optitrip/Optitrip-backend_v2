import Route from '../models/Route.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

// Función para convertir duración a minutos
const convertDurationToMinutes = (duration) => {
    const regex = /(\d+)\s*(día|días|hrs|hr|min|min)/g;
    let totalMinutes = 0;
    let match;
    while ((match = regex.exec(duration)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2];
        if (unit === 'día' || unit === 'días') {
            totalMinutes += value * 1440; // 24 horas * 60 minutos
        } else if (unit === 'hrs' || unit === 'hr') {
            totalMinutes += value * 60;
        } else if (unit === 'min') {
            totalMinutes += value;
        }
    }
    return totalMinutes;
};

// Función para convertir minutos a formato días, horas y minutos
const convertMinutesToDHM = (minutes) => {
    const days = Math.floor(minutes / 1440); // 1440 minutos en un día
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;

    let result = '';

    if (days > 0) {
        result += `${days} día${days > 1 ? 's' : ''}`;
    }
    if (days > 0 && (hours > 0 || mins > 0)) {
        result += ` `;
    }
    if (hours > 0) {
        result += `${hours} hr${hours > 1 ? 's' : ''}`;
    }
    if (hours > 0 && mins > 0) {
        result += ` `;
    }
    if (mins > 0 || (days === 0 && hours === 0)) {
        result += `${mins} min`;
    }

    return result || '0 min'; // Retorna '0 min' si no hay ninguna duración
};

// Controlador para obtener la información de las rutas por conductor
export const getReportDetailsByDriver = async (req, res) => {
    const { startDate, endDate, userId } = req.body;

    // Verificar campos requeridos
    if (!startDate || !endDate || !userId) {
        return res.status(200).json({
            error: 'Missing required fields',
            results: []  // Retornar un array vacío para los resultados
        });
    }

    try {
        const timeZone = 'America/Mexico_City';
        const fullStartDate = `${startDate}T00:00:00`;
        const fullEndDate = `${endDate}T23:59:59`;

        const utcStartDate = fromZonedTime(fullStartDate, timeZone);
        const utcEndDate = fromZonedTime(fullEndDate, timeZone);
        // Buscar las rutas basadas en el ID del usuario y las fechas
        const routes = await Route.find({
            driverId: userId,
            departureTime: { $gte: utcStartDate },
            arrivalTime: { $lte: utcEndDate },
            status: "Completado"
        });

        // Buscar el usuario para obtener el nombre del conductor
        const driver = await User.findById(userId);

        // Variables para cálculos totales
        let totalDownloadedTonnes = 0;
        let totalDistance = 0;
        let totalDurationMinutes = 0;

        // Procesar cada ruta y calcular los datos necesarios
        const results = routes.map(route => {
            // Sumar toneladas descargadas de todos los puntos de la ruta
            const totalUnload = (route.origin.unload || 0) +
                (route.destination.unload || 0) +
                (route.waypoints && route.waypoints.length > 0
                    ? route.waypoints.reduce((sum, waypoint) => sum + (waypoint.unload || 0), 0)
                    : 0);

            totalDownloadedTonnes += totalUnload;
            totalDistance += route.distance;

            // Convertir duración a minutos y acumular
            const durationMinutes = convertDurationToMinutes(route.durationTrip);
            totalDurationMinutes += durationMinutes;

            const durationHours = durationMinutes / 60;
            const speed = route.distance / durationHours;

            return {
                originName: route.origin.name,
                departureTime: route.departureTime, // Convertir fecha de salida
                arrivalTime: route.arrivalTime, // Convertir fecha de llegada
                destinationName: route.destination.name,
                waypoints: route.waypoints.length,
                tripDuration: route.durationTrip,
                distance: route.distance,
                averageSpeed: speed.toFixed(2),
                totalUnload: totalUnload
            };
        });

        // Calcular la velocidad media general
        const totalDurationHours = totalDurationMinutes / 60;
        const averageSpeedOverall = totalDistance / totalDurationHours;

        // Retornar los resultados
        res.status(200).json({
            driverName: driver ? driver.name : 'Unknown', // Manejar el caso cuando el conductor no existe
            totalTrips: routes.length, // Total de rutas
            totalDistance,
            totalDownloadedTonnes,
            totalDuration: convertMinutesToDHM(totalDurationMinutes), // Total de duración en formato 'días, hrs min'
            averageSpeedOverall: averageSpeedOverall.toFixed(2), // Velocidad media en km/h
            results
        });
    } catch (error) {
        console.error('Error fetching route details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Controlador para obtener la información de las rutas por conductor y estatus
export const getReportDetailsByStatus = async (req, res) => {
    const { startDate, endDate, userId, status } = req.body;

    // Verificar campos requeridos (userId ahora es opcional)
    if (!startDate || !endDate) {
        return res.status(200).json({
            error: 'Missing required fields',
            results: []
        });
    }

    try {
        const timeZone = 'America/Mexico_City';
        const fullStartDate = `${startDate}T00:00:00`;
        const fullEndDate = `${endDate}T23:59:59`;

        const utcStartDate = fromZonedTime(fullStartDate, timeZone);
        const utcEndDate = fromZonedTime(fullEndDate, timeZone);
        // Construir el filtro de consulta
        const queryFilter = {
            departureTime: { $gte: utcStartDate },
            arrivalTime: { $lte: utcEndDate }
        };

        // Agregar filtro de conductor solo si se proporciona
        if (userId && userId !== "") {
            queryFilter.driverId = userId;
        }

        // Agregar filtro de estado solo si se proporciona
        if (status && status !== "") {
            queryFilter.status = status;
        }

        // Buscar las rutas con populate para obtener el nombre del conductor
        const routes = await Route.find(queryFilter)
            .populate('driverId')
            .sort({ departureTime: 1 });

        // Procesar cada ruta
        const results = routes.map(route => {
            return {
                routeId: route._id,
                driverName: route.driverId ? route.driverId.name : 'Unknown',
                codeRoute: route.codeRoute,
                originName: route.origin.name,
                departureTime: route.departureTime,
                arrivalTime: route.arrivalTime,
                destinationName: route.destination.name,
                waypoints: route.waypoints.length,
                tripDuration: route.durationTrip,
                distance: route.distance,
                status: route.status
            };
        });

        res.status(200).json({
            results
        });
    } catch (error) {
        console.error('Error fetching route details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Controlador para obtener la información de las rutas por cliente
export const getReportDetailsByCustomer = async (req, res) => {
    const { startDate, endDate, userId } = req.body;

    // Verificar campos requeridos
    if (!startDate || !endDate || !userId) {
        return res.status(200).json({
            error: 'Missing required fields',
            results: []  // Retornar un array vacío para los resultados
        });
    }

    try {
        const timeZone = 'America/Mexico_City';
        const fullStartDate = `${startDate}T00:00:00`;
        const fullEndDate = `${endDate}T23:59:59`;

        const utcStartDate = fromZonedTime(fullStartDate, timeZone);
        const utcEndDate = fromZonedTime(fullEndDate, timeZone);
        // Buscar las rutas basadas en el ID del usuario y las fechas
        const routes = await Route.find({
            customerId: userId,
            departureTime: { $gte: utcStartDate },
            arrivalTime: { $lte: utcEndDate },
            status: "Completado"
        });

        // Buscar el usuario para obtener el nombre del conductor
        const customer = await User.findById(userId);

        // Variables para cálculos totales
        let totalDownloadedTonnes = 0;
        let totalDistance = 0;
        let totalDurationMinutes = 0;

        // Procesar cada ruta y calcular los datos necesarios
        const results = routes.map(route => {
            // Sumar toneladas descargadas de todos los puntos de la ruta
            const totalUnload = (route.origin.unload || 0) +
                (route.destination.unload || 0) +
                (route.waypoints && route.waypoints.length > 0
                    ? route.waypoints.reduce((sum, waypoint) => sum + (waypoint.unload || 0), 0)
                    : 0);

            totalDownloadedTonnes += totalUnload;
            totalDistance += route.distance;

            // Convertir duración a minutos y acumular
            const durationMinutes = convertDurationToMinutes(route.durationTrip);
            totalDurationMinutes += durationMinutes;

            const durationHours = durationMinutes / 60;
            const speed = route.distance / durationHours;

            return {
                originName: route.origin.name,
                departureTime: route.departureTime, // Convertir fecha de salida
                arrivalTime: route.arrivalTime, // Convertir fecha de llegada
                destinationName: route.destination.name,
                waypoints: route.waypoints.length,
                tripDuration: route.durationTrip,
                distance: route.distance,
                averageSpeed: speed.toFixed(2),
                totalUnload: totalUnload
            };
        });

        // Calcular la velocidad media general
        const totalDurationHours = totalDurationMinutes / 60;
        const averageSpeedOverall = totalDistance / totalDurationHours;

        // Retornar los resultados
        res.status(200).json({
            customerName: customer ? customer.name : 'Unknown', // Manejar el caso cuando el conductor no existe
            totalTrips: routes.length, // Total de rutas
            totalDistance,
            totalDownloadedTonnes,
            totalDuration: convertMinutesToDHM(totalDurationMinutes), // Total de duración en formato 'días, hrs min'
            averageSpeedOverall: averageSpeedOverall.toFixed(2), // Velocidad media en km/h
            results
        });
    } catch (error) {
        console.error('Error fetching route details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Controlador para obtenr la información de los POD's de cada punto
export const getReportDetailsByCodeRoute = async (req, res) => {
    const { codeRoute } = req.body;

    // Verificar campo requerido
    if (!codeRoute) {
        return res.status(200).json({
            error: 'Missing required field: codeRoute',
            results: []  // Retornar un array vacío para los resultados
        });
    }

    try {
        // Buscar las tareas basadas en el codeRoute
        const tasks = await Task.find({ codeRoute });

        if (!tasks.length) {
            return res.status(200).json({
                error: 'No tasks found for the given codeRoute',
                results: []  // Retornar un array vacío para los resultados
            });
        }

        // Buscar la ruta basada en el codeRoute
        const route = await Route.findOne({ codeRoute });

        if (!route) {
            return res.status(200).json({
                error: 'No route found for the given codeRoute',
                results: []  // Retornar un array vacío para los resultados
            });
        }

        // Buscar el usuario para obtener el nombre del cliente
        const customer = await User.findById(route.customerId);

        // Buscar el usuario para obtener el nombre del conductor
        const driver = await User.findById(route.driverId);

        // Procesar cada tarea y calcular los datos necesarios
        const results = tasks.map(task => {
            return {
                signature: task.signature,
                taskStatus: task.taskStatus,
                comments: task.comments,
                images: task.images,
                point: task.point,
                deliveryStatus: task.deliveryStatus,
                createdAt: task.createdAt,
            };
        });

        // Retornar los resultados
        res.status(200).json({
            results,
            driverName: driver ? driver.name : 'Unknown',
            customerName: customer ? customer.name : 'Unknown',
            originName: route.origin.name,
            departureTime: route.departureTime,
            arrivalTime: route.arrivalTime,
            destinationName: route.destination.name,
            tripDuration: route.durationTrip,
            distance: route.distance,
            assignedByName: route.assignedBy.name,
            createdAt: route.createdAt,
        });
    } catch (error) {
        console.error('Error fetching task details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
