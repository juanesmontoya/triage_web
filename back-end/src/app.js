import express from 'express';
import userRoutes from './routes/user.routes.js';
import cors from 'cors';
import pacientRoutes from './routes/pacient.routes.js';
import triageRoutes from './routes/triage.routes.js';
import symptomRoutes from './routes/symptom.routes.js';

const app = express();

const allowedOrigins = [
  'https://triage-frontend.purpleflower-c7eae35a.brazilsouth.azurecontainerapps.io'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use(express.json());


app.use("/", userRoutes);
app.use("/pacient", pacientRoutes);
app.use("/triage", triageRoutes);
app.use("/symptoms", symptomRoutes);


export default app;