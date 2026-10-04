import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDatabase } from './config/db.js';
import listingRoutes from './routes/listingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '200kb' })); app.use(morgan('dev'));
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/listings', listingRoutes); app.use('/api/reviews', reviewRoutes); app.use('/api/dashboard', dashboardRoutes);
app.use(errorHandler);
connectDatabase().then(() => app.listen(process.env.PORT || 5001, () => console.log(`API listening on ${process.env.PORT || 5001}`))).catch((error) => { console.error(error.message); process.exit(1); });
