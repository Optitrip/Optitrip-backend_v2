import Tracking from '../models/Tracking.js';
import Route from '../models/Route.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * @swagger
 * /track:
 *   post:
 *     summary: Track user's location
 *     description: Create or update the user's location and status based on authentication and received coordinates
 *     operationId: trackDriverLocation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user
 *               isAuthenticated:
 *                 type: boolean
 *                 description: Authentication status of the user
 *               latitude:
 *                 type: number
 *                 description: Latitude of the user's location
 *               longitude:
 *                 type: number
 *                 description: Longitude of the user's location
 *               superior_account:
 *                 type: string
 *                 description: Superior account of the user
 *     responses:
 *       200:
 *         description: Location tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tracking:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: ID of the user
 *                     location:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                           description: Latitude of the location
 *                         longitude:
 *                           type: number
 *                           description: Longitude of the location
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                           description: Timestamp of the location
 *                     status:
 *                       type: string
 *                       description: Status of the user
 *                       enum: [Activo, Fuera de línea, Inactivo]
 *                     superior_account:
 *                       type: string
 *                       description: Superior account of the user
 *       400:
 *         description: Bad request, required parameters missing or invalid
 *       500:
 *         description: Internal server error
 */
export const trackDriverLocation = async (req, res) => {
    const { userId, isAuthenticated, latitude, longitude, superior_account } = req.body;
    console.log(`[${new Date().toISOString()}] Ubicación recibida:`);
    console.log(`  userId: ${userId}, lat: ${latitude}, lng: ${longitude}`);

    try {
        console.log(userId);
        console.log(isAuthenticated);
        console.log(latitude);
        console.log(longitude);
        console.log(superior_account);

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return res.status(400).json({ message: 'Invalid latitude or longitude' });
        }

        // Encuentra la ruta activa del usuario
        const route = await Route.findOne({ driverId: new mongoose.Types.ObjectId(userId), status: 'Ruta en curso' });

        // Encuentra o crea el documento de tracking del usuario
        let tracking = await Tracking.findOne({ userId });

        if (!tracking) {
            // Si no existe un tracking previo, crea uno nuevo
            tracking = new Tracking({
                userId,
                isAuthenticated,
                location: { latitude, longitude, timestamp: new Date() },
                status: isAuthenticated ? (route ? 'Activo' : 'Inactivo') : 'Fuera de línea',
                superior_account,
            });

        } else {
            // Si existe un tracking previo, actualiza la ubicación, estado, autenticación y cuenta superior
            tracking.isAuthenticated = isAuthenticated;
            tracking.superior_account = superior_account;

            if (isAuthenticated) {
                if (route) {
                    tracking.status = 'Activo';  // Estado activo si está autenticado y tiene una ruta activa
                } else {
                    tracking.status = 'Inactivo';  // Estado inactivo si está autenticado pero no tiene una ruta activa
                }
                tracking.location = { latitude, longitude, timestamp: new Date() };
            } else {
                // Si no está autenticado, mantiene la última ubicación y cambia el estado a 'Fuera de línea'
                tracking.status = 'Fuera de línea';
            }
        }

        await tracking.save();
        console.log(tracking)
        res.status(200).json({ tracking });

    } catch (error) {
        console.error('Error tracking location', error);
        res.status(500).json({ message: 'Internal Server Error ' + error });
    }
};


/**
 * Método para actualizar los estados de los usuarios en función de la lógica
 * Cambia el estado a 'Fuera de línea' si el timestamp registrado es mayor a 1 minuto
 */
export const updateTrackingStatuses = async () => {
    try {
        const now = new Date();
        const thresholdTime = new Date(now.getTime() - 90 * 1000);

        // Encuentra todos los registros donde isAuthenticated es true y status es Activo o Inactivo
        const records = await Tracking.find({
            isAuthenticated: true,
            status: { $in: ['Activo', 'Inactivo'] },
            'location.timestamp': { $lte: thresholdTime }
        });

        // Actualiza el estado de los registros encontrados
        for (const tracking of records) {
            tracking.status = 'Fuera de línea';
            await tracking.save();
        }

        console.log(`Updated ${records.length} tracking records to 'Fuera de línea'.`);

    } catch (error) {
        console.error('Error updating tracking statuses', error);
    }
};