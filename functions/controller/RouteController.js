import Route from '../models/Route.js';
import User from '../models/User.js';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';


/**
 * @swagger
 * /route/{codeRoute}:
 *   get:
 *     summary: Retrieve route by codeRoute
 *     description: Retrieve route by codeRoute from the database
 *     parameters:
 *       - in: path
 *         name: codeRoute
 *         schema:
 *           type: string
 *         required: true
 *         description: Route code to show information
 *     operationId: getRouteByCodeRoute
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   url:
 *                     type: string
 *                   selectedOption:
 *                     type: number
 *                   origin:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 *                       load:
 *                         type: number
 *                       unload:
 *                         type: number
 *                       duration:
 *                         type: number
 *                       minutes:
 *                         type: number
 *                       status:
 *                         type: string
 *                   waypoints:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         lat:
 *                           type: number
 *                         lng:
 *                           type: number
 *                         load:
 *                           type: number
 *                         unload:
 *                           type: number
 *                         duration:
 *                           type: number
 *                         minutes:
 *                           type: number
 *                         status:
 *                           type: string
 *                   destination:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 *                       load:
 *                         type: number
 *                       unload:
 *                         type: number
 *                       duration:
 *                         type: number
 *                       minutes:
 *                         type: number
 *                       status:
 *                         type: string
 *                   tolls_total:
 *                     type: number
 *                   driverId:
 *                     type: string
 *                   customerId:
 *                     type: string
 *                   assignedBy:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   codeRoute:
 *                     type: string
 *                   departureTime:
 *                     type: string
 *                     format: date-time
 *                   arrivalTime:
 *                     type: string
 *                     format: date-time
 *                   distance:
 *                     type: number
 *                   durationTrip:
 *                     type: string
 *                   status:
 *                     type: string
 *       404:
 *         description: Routes not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export const getRouteByCodeRoute = async (req, res) => {
    try {
        const { codeRoute } = req.params;

        // Filtrar rutas por driverId y por los estados especificados
        const routes = await Route.find({ codeRoute }).populate(['driverId', 'customerId']);

        if (!routes || routes.length === 0) {
            return res.status(404).json({ message: "Route not found" });
        }
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/**
 * @swagger
 * /route/driver/{driverId}:
 *   get:
 *     summary: Retrieve routes by driver ID
 *     description: Retrieve routes by driver ID from the database
 *     parameters:
 *       - in: path
 *         name: driverId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the driver whose routes to retrieve
 *     operationId: getRoutesByDriverId
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   url:
 *                     type: string
 *                   selectedOption:
 *                     type: number
 *                   origin:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 *                       load:
 *                         type: number
 *                       unload:
 *                         type: number
 *                       duration:
 *                         type: number
 *                       minutes:
 *                         type: number
 *                       status:
 *                         type: string
 *                   waypoints:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         lat:
 *                           type: number
 *                         lng:
 *                           type: number
 *                         load:
 *                           type: number
 *                         unload:
 *                           type: number
 *                         duration:
 *                           type: number
 *                         minutes:
 *                           type: number
 *                         status:
 *                           type: string
 *                   destination:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 *                       load:
 *                         type: number
 *                       unload:
 *                         type: number
 *                       duration:
 *                         type: number
 *                       minutes:
 *                         type: number
 *                       status:
 *                         type: string
 *                   tolls_total:
 *                     type: number
 *                   driverId:
 *                     type: string
 *                   customerId:
 *                     type: string
 *                   assignedBy:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   codeRoute:
 *                     type: string
 *                   departureTime:
 *                     type: string
 *                     format: date-time
 *                   arrivalTime:
 *                     type: string
 *                     format: date-time
 *                   distance:
 *                     type: number
 *                   durationTrip:
 *                     type: string
 *                   status:
 *                     type: string
 *       404:
 *         description: Routes not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export const getRoutesByDriverId = async (req, res) => {
    try {
        const { driverId } = req.params;

        // Filtrar rutas por driverId y por los estados especificados
        const routes = await Route.find({
            driverId,
            status: { $in: ["Ruta no iniciada", "Ruta futura", "Ruta en curso"] }
        }).populate(['driverId', 'customerId']);

        if (!routes || routes.length === 0) {
            return res.status(404).json({ message: "Routes not found" });
        }
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/**
 * @swagger
 * /routes:
 *   post:
 *     summary: Create a new route
 *     description: Create a new route in the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               selectedOption:
 *                 type: number
 *               origin:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *                   load:
 *                     type: number
 *                   unload:
 *                     type: number
 *                   duration:
 *                     type: number
 *                   minutes:
 *                     type: number
 *                   status:
 *                     type: string
 *               waypoints:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     lat:
 *                       type: number
 *                     lng:
 *                       type: number
 *                     load:
 *                       type: number
 *                     unload:
 *                       type: number
 *                     duration:
 *                       type: number
 *                     minutes:
 *                       type: number
 *                     status:
 *                       type: string
 *               destination:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *                   load:
 *                     type: number
 *                   unload:
 *                     type: number
 *                   duration:
 *                     type: number
 *                   minutes:
 *                     type: number
 *                   status:
 *                     type: string
 *               tolls_total:
 *                 type: number
 *               driverId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               assignedBy:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *               arrivalTime:
 *                 type: string
 *                 format: date-time
 *               distance:
 *                 type: number
 *               durationTrip:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Route created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 route:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     url:
 *                       type: string
 *                     selectedOption:
 *                       type: number
 *                     origin:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         lat:
 *                           type: number
 *                         lng:
 *                           type: number
 *                         load:
 *                           type: number
 *                         unload:
 *                           type: number
 *                         duration:
 *                           type: number
 *                         minutes:
 *                           type: number
 *                         status:
 *                           type: string
 *                     waypoints:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           lat:
 *                             type: number
 *                           lng:
 *                             type: number
 *                           load:
 *                             type: number
 *                           unload:
 *                             type: number
 *                           duration:
 *                             type: number
 *                           minutes:
 *                             type: number
 *                           status:
 *                             type: string
 *                     destination:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         lat:
 *                           type: number
 *                         lng:
 *                           type: number
 *                         load:
 *                           type: number
 *                         unload:
 *                           type: number
 *                         duration:
 *                           type: number
 *                         minutes:
 *                           type: number
 *                         status:
 *                           type: string
 *                     tolls_total:
 *                       type: number
 *                     driverId:
 *                       type: string
 *                     customerId:
 *                       type: string
 *                     assignedBy:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     codeRoute:
 *                       type: string
 *                     departureTime:
 *                       type: string
 *                       format: date-time
 *                     arrivalTime:
 *                       type: string
 *                       format: date-time
 *                     distance:
 *                       type: number
 *                     durationTrip:
 *                       type: string
 *                     status:
 *                       type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export const createRoute = async (req, res) => {
    try {
        console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));
        const {
            url,
            selectedOption,
            origin,
            waypoints,
            destination,
            tolls_total,
            driverId,
            customerId,
            assignedBy,
            departureTime,
            arrivalTime,
            distance,
            durationTrip,
            status,
            avoidAreas,
            avoidParameters,
            avoidHighways,
            transportation,
            mode,
            traffic,
            timeType,
            scheduledTime
        } = req.body;

        const driver = await User.findById(driverId);
        if (!driver) {
            return res.status(400).json({ message: "Driver not found" });
        }

        // Generar codeRoute
        const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15);
        const assignedByInitial = assignedBy.name.charAt(0).toUpperCase();
        const driverInitial = driver.name.charAt(0).toUpperCase();
        const codeRoute = `${timestamp}-${assignedByInitial}-${driverInitial}`;

        // Crear nueva ruta
        const newRoute = new Route({
            url,
            selectedOption,
            origin,
            waypoints,
            destination,
            driverId,
            tolls_total,
            customerId,
            assignedBy,
            codeRoute,
            departureTime,
            arrivalTime,
            distance,
            durationTrip,
            status,
            avoidAreas: avoidAreas || [],
            avoidParameters: avoidParameters || [],
            avoidHighways: avoidHighways || [],
            transportation: transportation || 'truck',
            mode: mode || 'fast',
            traffic: traffic !== undefined ? traffic : false,
            timeType: timeType || 'Salir ahora',
            scheduledTime: scheduledTime || null
        });

        // Guardar la nueva ruta en la base de datos
        await newRoute.save();
        res.status(201).json({ message: "Route created successfully", route: newRoute });
    } catch (error) {
        console.error('❌ Error completo:', error);
        console.error('❌ Stack:', error.stack);
        res.status(500).json({ 
            message: error.message,
            error: error.toString(),
            stack: error.stack 
        });
    }
};


/**
 * @swagger
 * /route/status/{codeRoute}:
 *   patch:
 *     summary: Update route status to "Ruta en curso"
 *     description: Update the status of a route to "Ruta en curso" using the codeRoute
 *     parameters:
 *       - in: path
 *         name: codeRoute
 *         schema:
 *           type: string
 *         required: true
 *         description: Code of the route to update
 *     operationId: updateRouteStatus
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 url:
 *                   type: string
 *                 selectedOption:
 *                   type: number
 *                 origin:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     lat:
 *                       type: number
 *                     lng:
 *                       type: number
 *                     load:
 *                       type: number
 *                     unload:
 *                       type: number
 *                     duration:
 *                       type: number
 *                     minutes:
 *                       type: number
 *                 waypoints:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 *                       load:
 *                         type: number
 *                       unload:
 *                         type: number
 *                       duration:
 *                         type: number
 *                       minutes:
 *                         type: number
 *                 destination:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     lat:
 *                       type: number
 *                     lng:
 *                       type: number
 *                     load:
 *                       type: number
 *                     unload:
 *                       type: number
 *                     duration:
 *                       type: number
 *                     minutes:
 *                       type: number
 *                 tolls_total:
 *                   type: number
 *                 driverId:
 *                   type: string
 *                 customerId:
 *                   type: string
 *                 assignedBy:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 codeRoute:
 *                   type: string
 *                 departureTime:
 *                   type: string
 *                   format: date-time
 *                 arrivalTime:
 *                   type: string
 *                   format: date-time
 *                 distance:
 *                   type: number
 *                 durationTrip:
 *                   type: string
 *                 status:
 *                   type: string
 *       404:
 *         description: Route not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export const updateRouteStatus = async (req, res) => {
    try {
        const { codeRoute } = req.params;

        const route = await Route.findOneAndUpdate(
            { codeRoute },
            { status: "Ruta en curso" },
            { new: true }
        ).populate(['driverId', 'customerId'])

        if (!route) {
            return res.status(404).json({ message: "Route not found" });
        }

        res.json({ message: "Route status updated successfully", route });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};
