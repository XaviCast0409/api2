"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const dbConnect_1 = __importDefault(require("./config/dbConnect"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(routes_1.default);
// Obtiene el puerto de la variable de entorno, si no está definido, utiliza el puerto 3000
const port = process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000;
dbConnect_1.default.sequelize.sync({ force: true }).then(() => {
    app.listen(port, "0.0.0.0", () => {
        console.log(`${process.env.APP_NAME} on port ${port}`);
    });
});
