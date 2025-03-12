import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import express from "express";
import FaceApiService from "../services/faceApiService.js";
import { registerFaceValidation, checkFaceValidation } from "../validation/faceValidation.js";

const prisma = new PrismaClient();
const upload = multer({ dest: "uploads/" });

const register = async (req, res) => {
    try {
        const { error, value } = registerFaceValidation.validate({ userId: req.body.userId, face: req.file });
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { userId } = value;
        const facePath = req.file.path;

        await FaceApiService.boot();
        const faceDescriptor = await FaceApiService.tranformToDescriptor(facePath);
        if (!faceDescriptor) {
            return res.status(422).json({ message: "File yang diunggah tidak mengandung wajah" });
        }

        const fileName = `${uuidv4()}.json`;
        const filePath = path.join("uploads", fileName);
        await fs.writeFile(filePath, faceDescriptor.toString());

        const faceModel = await prisma.faces.upsert({
            where: { userId },
            update: { file: { path: filePath } },
            create: { userId, file: { path: filePath } },
        });

        return res.status(202).json({ success: true, message: "Registrasi wajah berhasil!", data: faceModel });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const check = async (req, res) => {
    try {
        const { error, value } = checkFaceValidation.validate({ userId: req.body.userId, face: req.file });
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { userId } = value;
        const facePath = req.file.path;

        await FaceApiService.boot();
        const userFace = await prisma.faces.findUnique({ where: { userId } });
        if (!userFace) return res.json({ message: "Wajah belum didaftarkan" });

        const faceRefData = await fs.readFile(userFace.file.path, "utf-8");
        const faceRef = FaceApiService.loadFromString(faceRefData).descriptor;
        const faceQuery = (await FaceApiService.tranformToDescriptor(facePath))?.descriptor;

        if (!faceQuery) return res.json({ message: "Wajah tidak terdeteksi" });

        if (!FaceApiService.matcher(faceRef, faceQuery)) return res.json({ message: "Wajah tidak cocok" });

        return res.json({ message: "Wajah berhasil diverifikasi!" });
    } catch (error) {
        return res.status(422).json({ message: error.message });
    }
};

export { register, check };
