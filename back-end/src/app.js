import express from 'express';
import userRoutes from './routes/user.routes.js';
import pacientRoutes from './routes/pacient.routes.js';


const app = express();

app.use(express.json());


app.use("/", userRoutes);
app.use("/pacient", pacientRoutes);

export default app;