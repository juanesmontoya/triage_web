import app from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./database/config.js";

dotenv.config();

const port = process.env.APP_PORT || 3000;

connectDB();

app.listen(port);

console.log(`Server is running on port ${port}`);