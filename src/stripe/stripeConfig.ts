import Stripe from "stripe";
import dotenv from "dotenv";

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Obtén el valor de la variable de entorno y proporciona un valor predeterminado si es `undefined`
const apiSecretStripe = process.env.API_SECRET_STRIPE ?? '';

// Crea una nueva instancia de Stripe utilizando la variable de entorno
const stripe = new Stripe(apiSecretStripe);

export default stripe;
