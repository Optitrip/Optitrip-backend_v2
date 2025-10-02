import express from "express";
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

// Middleware para CORS - DEBE IR PRIMERO
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

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

// IMPORTANTE: Las rutas NO deben tener el prefijo /.netlify/functions/server
// Netlify lo agrega automáticamente
app.get("/users", getUsers);
app.get("/users/admin", getUsersAdmin);
app.get("/users/driver", getUsersDriver);
app.get("/user/:id", getUserById);
app.post("/users", createUser);
app.put("/user/:id", updateUser);
app.delete("/user/:id", deleteUser);
app.post("/login", login);
app.post("/reset-password/:id", resetPassword);
app.post("/move-account/", moveAccount);
app.post("/routes", createRoute);
app.get("/route/:codeRoute", getRouteByCodeRoute);
app.get("/route/driver/:driverId", getRoutesByDriverId);
app.patch("/route/status/:codeRoute", updateRouteStatus);
app.post("/task", upload.array('images'), createTask);
app.post("/report/details/driver", getReportDetailsByDriver);
app.post("/report/details/status", getReportDetailsByStatus);
app.post("/report/details/customer", getReportDetailsByCustomer);
app.post("/report/details/codeRoute", getReportDetailsByCodeRoute);
app.post("/track", trackDriverLocation);

setInterval(async () => {
  console.log('Running tracking status update...');
  await updateTrackingStatuses();
}, 60000);

// Exportar el handler
export const handler = serverless(app);

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
  });
}