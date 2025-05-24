import express from 'express';
import userRoutes from './routes/user.routes.js';
import cors from 'cors';

const app = express();

app.use(cors());


app.use(express.json());


app.use("/triage", userRoutes);

export default app;