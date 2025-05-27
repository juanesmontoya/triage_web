import express from 'express';
import userRoutes from './routes/user.routes.js';
import cors from 'cors';
import pacientRoutes from './routes/pacient.routes.js';
import triageRoutes from './routes/triage.routes.js';
import symptomRoutes from './routes/symptom.routes.js';

const app = express();

app.use(cors());


app.use(express.json());


app.use("/", userRoutes);
app.use("/pacient", pacientRoutes);
app.use("/triage", triageRoutes);
app.use("/symptoms", symptomRoutes);


export default app;