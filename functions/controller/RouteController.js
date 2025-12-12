import Route from '../models/Route.js';
import User from '../models/User.js';
import { sendNotification } from '../services/NotificationService.js';
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

export const getRouteById = async (req, res) => {
    try {
        const { routeId } = req.params;

        const route = await Route.findById(routeId).populate(['driverId', 'customerId']);

        if (!route) {
            return res.status(404).json({ message: "Route not found" });
        }

        res.json(route);
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
 * /route/driver/{driverId}/history:
 *   get:
 *     summary: Retrieve completed and expired routes by driver ID
 *     description: Retrieve only completed and expired routes by driver ID from the database
 *     parameters:
 *       - in: path
 *         name: driverId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the driver whose history routes to retrieve
 *     operationId: getHistoryRoutesByDriverId
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: Routes not found
 *       500:
 *         description: Internal server error
 */
export const getHistoryRoutesByDriverId = async (req, res) => {
    try {
        const { driverId } = req.params;

        // Filtrar rutas por driverId y solo las completadas o vencidas
        const routes = await Route.find({
            driverId,
            status: { $in: ["Completado", "Ruta vencida", "Ruta expirada"] }
        })
            .populate(['driverId', 'customerId'])
            .sort({ createdAt: -1 }); // Ordenar por más recientes primero

        if (!routes || routes.length === 0) {
            return res.status(404).json({ message: "No history routes found" });
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
            scheduledTime,
            routeSections
        } = req.body;

        const driver = await User.findById(driverId);

        if (!driver) {
            return res.status(400).json({ message: "Driver not found" });
        }

        let routeStatus = status || "Ruta no iniciada";
        const currentDateTime = new Date();
        const departureDateMexico = toZonedTime(new Date(departureTime), 'America/Mexico_City');
        const currentDateMexico = toZonedTime(currentDateTime, 'America/Mexico_City');

        // Truncar horas para comparar solo fechas
        const currentDateOnly = new Date(currentDateMexico.getFullYear(), currentDateMexico.getMonth(), currentDateMexico.getDate());
        const departureDateOnly = new Date(departureDateMexico.getFullYear(), departureDateMexico.getMonth(), departureDateMexico.getDate());

        if (departureDateOnly > currentDateOnly) {
            routeStatus = "Ruta futura";
        }

        const departureTimeUTC = scheduledTime
            ? fromZonedTime(scheduledTime, 'America/Mexico_City')
            : new Date(departureTime);

        const frontDurationMs = new Date(arrivalTime).getTime() - new Date(departureTime).getTime();

        const arrivalTimeUTC = new Date(departureTimeUTC.getTime() + frontDurationMs);


        // === VALIDACIÓN DE ROUTE SECTIONS ===
        let validRouteSections = [];
        if (routeSections && Array.isArray(routeSections)) {
            validRouteSections = routeSections;
            console.log(`Total route sections recibidas: ${routeSections.length}`);
            console.log(`Waypoints esperados: ${waypoints.length}`);

            validRouteSections.forEach((section, index) => {
                console.log(`Section ${index}:`, {
                    polylineLength: section.polyline?.length,
                    distance: section.distance,
                    departureTime: section.departureTime,
                    arrivalTime: section.arrivalTime
                });
            });
        }

        // Generar codeRoute
        const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15);
        const assignedByInitial = assignedBy.name.charAt(0).toUpperCase();
        const driverInitial = driver.name.charAt(0).toUpperCase();
        const codeRoute = `${timestamp}-${assignedByInitial}-${driverInitial}`;

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
            departureTime: departureTimeUTC,
            arrivalTime: arrivalTimeUTC,
            distance,
            durationTrip,
            status: routeStatus,
            avoidAreas: avoidAreas || [],
            avoidParameters: avoidParameters || [],
            avoidHighways: avoidHighways || [],
            transportation: transportation || 'truck',
            mode: mode || 'fast',
            traffic: traffic !== undefined ? traffic : false,
            timeType: timeType || 'Salir ahora',
            scheduledTime: scheduledTime || null,
            routeSections: validRouteSections || [],
            reminderSent: false,
            startNotificationSent: false
        });


        await newRoute.save();

        // Enviar notificación al conductor
        if (driver && driver.fcmToken) {
            const notificationTitle = "Nueva Ruta Asignada";

            const formattedDeparture = formatInTimeZone(
                departureTimeUTC,
                'America/Mexico_City',
                "dd/MM/yyyy 'a las' HH:mm"
            );

            const notificationBody = `Se te ha asignado la ruta ${codeRoute}. Salida: ${formattedDeparture}`;

            const notificationData = {
                type: "route_assigned",
                codeRoute: codeRoute,
                departureTime: departureTimeUTC.toISOString(),
                routeId: newRoute._id.toString()
            };

            await sendNotification(driver.fcmToken, notificationTitle, notificationBody, notificationData);
        }

        res.status(201).json({ message: "Route created successfully", route: newRoute });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

export const updateRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        const updateData = req.body;

        // Buscar la ruta actual para comparar el conductor
        const currentRoute = await Route.findById(routeId);
        
        if (!currentRoute) {
            return res.status(404).json({ message: "Route not found" });
        }

        // Actualizar la ruta con los nuevos datos
        const updatedRoute = await Route.findByIdAndUpdate(
            routeId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate(['driverId', 'customerId']);

        // Si cambió el conductor, enviar notificación al nuevo conductor
        if (updateData.driverId && updateData.driverId !== currentRoute.driverId.toString()) {
            const newDriver = await User.findById(updateData.driverId);
            
            if (newDriver && newDriver.fcmToken) {
                const notificationTitle = "Ruta Reasignada";
                const formattedDeparture = formatInTimeZone(
                    updatedRoute.departureTime,
                    'America/Mexico_City',
                    "dd/MM/yyyy 'a las' HH:mm"
                );
                const notificationBody = `Se te ha reasignado la ruta ${updatedRoute.codeRoute}. Salida: ${formattedDeparture}`;
                const notificationData = {
                    type: "route_reassigned",
                    codeRoute: updatedRoute.codeRoute,
                    departureTime: updatedRoute.departureTime.toISOString(),
                    routeId: updatedRoute._id.toString()
                };

                await sendNotification(newDriver.fcmToken, notificationTitle, notificationBody, notificationData);
            }
        }

        res.status(200).json({ 
            message: "Route updated successfully", 
            route: updatedRoute 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const reportRouteDeviation = async (req, res) => {
    try {
        const { codeRoute } = req.params;
        const { type, lat, lng } = req.body;

        const route = await Route.findOne({ codeRoute });

        if (!route) {
            return res.status(404).json({ message: "Route not found" });
        }

        route.deviations.push({
            type, 
            lat,
            lng,
            timestamp: new Date(),
            seenByAdmin: false
        });

        await route.save();

        res.status(200).json({ message: "Deviation reported successfully" });
    } catch (error) {
        console.error("Error reporting deviation:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getPendingDeviations = async (req, res) => {
    try {
        const routes = await Route.find({
            "deviations.seenByAdmin": false
        }).populate(['driverId']);

        let alerts = [];

        routes.forEach(route => {
            route.deviations.forEach(dev => {
                if (!dev.seenByAdmin) {
                    alerts.push({
                        routeId: route._id,
                        codeRoute: route.codeRoute,
                        driverName: route.driverId ? route.driverId.name : "Desconocido",
                        type: dev.type,
                        timestamp: dev.timestamp,
                        lat: dev.lat,
                        lng: dev.lng,
                        deviationId: dev._id
                    });
                }
            });
        });

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markDeviationAsSeen = async (req, res) => {
    try {
        const { routeId, deviationId } = req.body;

        const route = await Route.findById(routeId);
        if (!route) return res.status(404).json({ message: "Route not found" });

        const deviation = route.deviations.id(deviationId);
        if (deviation) {
            deviation.seenByAdmin = true;
            await route.save();
            res.json({ message: "Alert marked as seen" });
        } else {
            res.status(404).json({ message: "Deviation not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

