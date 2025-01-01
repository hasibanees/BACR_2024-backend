import mongoose from "mongoose"
import express from "express"
import cors from "cors"
import teamRoutes from "./Routes/TeamRoutes.js"
import certificateRoutes from "./Routes/CertificateRoutes.js";
import BrandRoutes from "./Routes/BrandRoutes.js";
import projectRoutes from "./Routes/projectRoutes.js";
import clientRoutes from "./Routes/clientRoutes.js";
import productRoutes from "./Routes/productRoutes.js";
import blogRoutes from "./Routes/blogRoutes.js";
import CategoryRoutes from "./Routes/CategoryRoutes.js";
import contactRoutes from "./Routes/contactRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
import rolesRoutes from "./Routes/rolesRoutes.js";
import TagRoutes from "./Routes/TagRoutes.js";
import DepartRoutes from "./Routes/DepartRoutes.js";
import careerRoutes from "./Routes/careerRoutes.js";
import protectedRoutes from "./Routes/protectedRoutes.js";
import moduleRoutes from "./Routes/moduleRoutes.js";
import RoleAccess from "./middleware/RoleAccess.js";
import JobRoutes from "./Routes/JobRoutes.js";
import blogCatRoutes from "./Routes/blogCatRoutes.js";
import contactDetRoutes from "./Routes/contactDetRoutes.js";
import AppointmentRoutes from "./Routes/AppointmentRoutes.js";
import SubscribersRoutes from "./Routes/SubscribersRoutes.js";
import path,{ dirname } from 'path';
import Mixpanel from 'mixpanel';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const app = express();
dotenv.config();
console.log("SS", process.env.SERVERNAME);

export const mixpanel = Mixpanel.init("df6068b6944b69e78c4324ee5a9edeae");


mongoose.connect('mongodb+srv://huzaifa:Izaan511@cluster0.6lzhfpl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/BACR', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

app.use(express.json());

app.use(cors({
  origin: "*", // Allow all origins (replace '*' with specific origins if needed)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));
const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);
app.use('/uploads', express.static(`${__dirname}/uploads`));
// app.use("/api", protectedRoutes);


app.use('/api', teamRoutes);
app.use("/api", certificateRoutes); // Use the certificate routes
app.use("/api", BrandRoutes); 
app.use("/api", projectRoutes);
app.use("/api", clientRoutes);
app.use("/api", productRoutes);
app.use("/api", blogRoutes);
app.use('/api', contactRoutes);
app.use('/api', CategoryRoutes);
app.use('/api', userRoutes);
app.use('/api', blogCatRoutes);
app.use('/api', TagRoutes);
app.use('/api', JobRoutes);
app.use('/api', moduleRoutes);
app.use('/api', rolesRoutes);
app.use('/api', DepartRoutes);
app.use('/api', contactDetRoutes);
app.use('/api', SubscribersRoutes);
app.use('/api', careerRoutes);
app.use('/api', AppointmentRoutes);
app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(__dirname, './uploads/sitemap.xml');
  res.sendFile(sitemapPath);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));