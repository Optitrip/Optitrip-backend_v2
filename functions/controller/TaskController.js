import Task from '../models/Task.js';
import Route from '../models/Route.js';

/**
 * @swagger
 * /task:
 *   post:
 *     summary: Create a new task
 *     description: Create a new task in the database
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *               taskStatus:
 *                 type: string
 *               deliveryStatus:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *               comments:
 *                 type: string
 *               codeRoute:
 *                 type: string
 *               pointName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     signature:
 *                       type: string
 *                     taskStatus:
 *                       type: string
 *                     deliveryStatus:
 *                       type: string
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           imageUrl:
 *                             type: string
 *                     comments:
 *                       type: string
 *                     codeRoute:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request, required parameters missing or invalid
 *       500:
 *         description: Internal server error
 */
export const createTask = async (req, res) => {
    try {
        const {
            signature,
            taskStatus,
            deliveryStatus,
            comments,
            codeRoute,
            point,
            images
        } = req.body;

        if (!point) {
             return res.status(400).json({ message: "Field 'point' is required" });
        }

        let pointArray;
        try {
            pointArray = JSON.parse(point); 
        } catch (error) {
            throw new Error("Invalid JSON format for point: " + error);
        }

        // Obtenemos el nombre desde el array parseado
        const pointNameFromData = pointArray[0] ? pointArray[0].name : null;

        if (!pointNameFromData) {
            return res.status(400).json({ message: "Point name is missing inside point object" });
        }

        // Verifica que images sea un string
        if (typeof images !== 'string') {
            throw new Error("Images should be a string");
        }

        // Parsear el string JSON a un array de objetos
        let imagesArray;
        try {
            imagesArray = JSON.parse(images);
        } catch (error) {
            throw new Error("Invalid JSON format for images: " + error);
        }

        // Normaliza el array de imágenes para manejar objetos y strings mezclados
        const normalizedImagesArray = imagesArray.map(image => {
            if (typeof image === 'string') {
                try {
                    return JSON.parse(image);
                } catch (error) {
                    throw new Error("Invalid image object format in array: " + error);
                }
            }
            return image;
        });

        // Verifica que normalizedImagesArray sea un array de objetos con la propiedad imageUrl
        if (!Array.isArray(normalizedImagesArray) || !normalizedImagesArray.every(image => typeof image === 'object' && image.imageUrl)) {
            throw new Error("Images should have the format [{ \"imageUrl\": \"...\" }]");
        }

        // Genera la fecha createdAt desde el servidor
        const createdAt = new Date().toISOString();

        // Verifica la existencia de la ruta y el punto
        const route = await Route.findOne({ codeRoute });
        if (!route) {
            return res.status(400).json({ message: "Route not found" });
        }

        // Encuentra y actualiza el punto
        let pointUpdated = false;
        
        const updatePointStatus = (pointItem) => {
            if (pointItem && pointItem.name === pointNameFromData) {
                pointItem.status = "Completado";
                pointUpdated = true;
            }
        };

        if (route.waypoints) {
            route.waypoints.forEach(updatePointStatus);
        }
        
        if (route.destination) {
            updatePointStatus(route.destination);
        }

        if (!pointUpdated) {
            return res.status(400).json({ message: `Point name '${pointNameFromData}' not found in the route` });
        }

        // Verificar si todos los waypoints y el destino tienen el estado "Completado"
        const allPointsToCheck = [...(route.waypoints || [])];
        if (route.destination) allPointsToCheck.push(route.destination);
        
        const allPointsCompleted = allPointsToCheck.every(p => p.status === "Completado");
        
        if (allPointsCompleted) {
            route.status = "Completado";
        }

        // Crea una nueva tarea
        const newTask = new Task({
            signature,
            taskStatus,
            deliveryStatus,
            images: normalizedImagesArray, // Almacenar las imágenes tal cual vienen
            comments,
            codeRoute,
            point: pointArray,
            createdAt
        });

        // Guarda la nueva tarea en la base de datos
        await newTask.save();

        // Si la tarea se guarda correctamente, actualiza el estado del punto y guarda la ruta
        if (newTask) {
            await route.save();
        }

        // Responde con un código 201 y la tarea creada
        res.status(201).json({ message: "Task created successfully", task: newTask });
    } catch (error) {
        console.error("Error en createTask:", error);
        // Maneja los errores y responde con un código 500 en caso de error interno del servidor
        res.status(500).json({ message: error.message });
    }
};
