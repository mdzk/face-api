import express from 'express';
import healthController from '../controller/healthController.js';
import { register, check } from '../controller/faceController.js';
import multer from 'multer';

const upload = multer({ dest: "uploads/" });

const publicRouter = new express.Router();
publicRouter.get('/ping', healthController.ping);

// Route for user
publicRouter.post('/register', upload.single("face"), register);
publicRouter.post('/check', upload.single("face"), check);

export {
    publicRouter
}