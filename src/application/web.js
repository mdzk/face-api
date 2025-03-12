import express from 'express';
import { publicRouter } from '../route/api.js';
import dotenv from 'dotenv';
dotenv.config()

export const web = express();
web.use(express.json());

web.use(publicRouter);
