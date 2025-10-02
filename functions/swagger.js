import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from 'path';

const __dirname = path.join(process.cwd(), 'functions');

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Optitrip API",
            version: "1.0.0",
            description: "API documentation for Optitrip",
        },
        servers: [
            {
                url: "https://optitrip-backend.netlify.app/.netlify/functions/server",
                description: "Production server",
            },
            {
                url: "http://localhost:5000/.netlify/functions/server",
                description: "Development server",
            },
        ],
    },
    apis: [path.join(__dirname, './controller/*.js')],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
