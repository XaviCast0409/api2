import express from "express";
import dotenv from "dotenv";
import router from "./routes";
import cors from 'cors';
import db from "./config/dbConnect";

dotenv.config();

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

// Obtiene el puerto de la variable de entorno, si no está definido, utiliza el puerto 3000
const port = process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000;

db.sequelize.sync({ alert: true }).then(() => {
  app.listen(port, "0.0.0.0", () => {
    console.log(`${process.env.APP_NAME} on port ${port}`);
  });
});