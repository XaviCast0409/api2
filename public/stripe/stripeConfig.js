"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
// Carga las variables de entorno desde el archivo .env
dotenv_1.default.config();
// Obtén el valor de la variable de entorno y proporciona un valor predeterminado si es `undefined`
const apiSecretStripe = (_a = process.env.API_SECRET_STRIPE) !== null && _a !== void 0 ? _a : '';
// Crea una nueva instancia de Stripe utilizando la variable de entorno
const stripe = new stripe_1.default(apiSecretStripe);
exports.default = stripe;
