import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import connectDB from "./database/ConnectionDB.js";
import bodyParser from "body-parser";
import path from 'path';
import cron from 'node-cron';
import './tasks/ScheduleTasks.js';
import { getUsers, getUsersAdmin, getUsersDriver, getUserById, createUser, updateUser, deleteUser } from "./controller/UserController.js";
import { resetPassword } from "./controller/ResetPasswordController.js";
import { login } from "./controller/LoginController.js";
import { swaggerUi, specs } from "./swagger.js";
import { moveAccount } from "./controller/MoveAccount.js";
import { getRouteByCodeRoute, getRoutesByDriverId, createRoute, updateRouteStatus } from "./controller/RouteController.js";
import { createTask } from "./controller/TaskController.js";
import { getReportDetailsByDriver, getReportDetailsByStatus, getReportDetailsByCustomer, getReportDetailsByCodeRoute } from "./controller/ReportController.js";
import { trackDriverLocation, updateTrackingStatuses } from "./controller/TrackingController.js";
import multer from 'multer';

const __dirname = path.join(process.cwd(), 'functions');

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://optitrip-backend.netlify.app'], // Agrega aquí tu dominio de frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

// Middleware adicional para asegurar headers CORS en todas las respuestas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Responder a preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Configuración de multer para manejar multipart/form-data
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Conectar a la base de datos
connectDB();

// Servir archivos de Swagger
app.use('/api-docs/swagger-ui-bundle.js', express.static(path.join(__dirname, 'swagger-ui', 'swagger-ui-bundle.js')));
app.use('/api-docs/swagger-ui.css', express.static(path.join(__dirname, 'swagger-ui', 'swagger-ui.css')));
app.use('/api-docs/swagger-ui-standalone-preset.js', express.static(path.join(__dirname, 'swagger-ui', 'swagger-ui-standalone-preset.js')));
app.use('/api-docs/favicon-16x16.png', express.static(path.join(__dirname, 'swagger-ui', 'favicon-16x16.png')));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

const router = express.Router();
router.get("/users", getUsers);
router.get("/users/admin", getUsersAdmin);
router.get("/users/driver", getUsersDriver);
router.get("/user/:id", getUserById);
router.post("/users", createUser);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);
router.post("/login", login);
router.post("/reset-password/:id", resetPassword);
router.post("/move-account/", moveAccount);
router.post("/routes", createRoute);
router.get("/route/:codeRoute", getRouteByCodeRoute);
router.get("/route/driver/:driverId", getRoutesByDriverId);
router.patch("/route/status/:codeRoute", updateRouteStatus);
router.post("/task", upload.array('images'), createTask);
router.post("/report/details/driver", getReportDetailsByDriver);
router.post("/report/details/status", getReportDetailsByStatus);
router.post("/report/details/customer", getReportDetailsByCustomer);
router.post("/report/details/codeRoute", getReportDetailsByCodeRoute);
router.post("/track", trackDriverLocation);

setInterval(async () => {
  console.log('Running tracking status update...');
  await updateTrackingStatuses();
}, 60000);

app.use('/.netlify/functions/server', router);

// Wrapper del handler con headers CORS adicionales
const handler = async (event, context) => {
  const serverlessHandler = serverless(app);
  const result = await serverlessHandler(event, context);
  
  // Asegurar headers CORS en la respuesta
  return {
    ...result,
    headers: {
      ...result.headers,
      'Access-Control-Allow-Origin': event.headers.origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
      'Access-Control-Allow-Credentials': 'true',
    }
  };
};

export { handler };

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
  });
}