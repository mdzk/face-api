import '@tensorflow/tfjs-node';
import * as faceapi from '@vladmandic/face-api';
import { Canvas, Image, ImageData, loadImage } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';
import { ResponseError } from '../error/responseError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FaceApiService {
    constructor() {
        this.booted = false;
        this.modelPath = path.join(__dirname, './facemodels');
    }

    async boot() {
        if (this.booted) {
            return;
        }
        this.booted = true;
        faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

        try {
            await faceapi.nets.faceRecognitionNet.loadFromDisk(this.modelPath);
            await faceapi.nets.faceLandmark68Net.loadFromDisk(this.modelPath);
            await faceapi.nets.ssdMobilenetv1.loadFromDisk(this.modelPath);
        } catch (error) {
            throw new ResponseError(500, 'Gagal memuat model Face API');
        }
    }

    async tranformToDescriptor(imagePath) {
        try {
            const image = await loadImage(imagePath);
            const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

            if (!detections.length) {
                throw new ResponseError(422, 'Tidak ada wajah yang terdeteksi dalam gambar');
            }

            const descriptor = detections[0]?.descriptor;

            return {
                descriptor,
                toString: () => JSON.stringify(descriptor),
            };
        } catch (error) {
            throw new ResponseError(500, 'Gagal memproses gambar untuk deteksi wajah');
        }
    }

    loadFromString(descriptorString) {
        try {
            return {
                descriptor: Float32Array.from(Object.values(JSON.parse(descriptorString))),
                toString: () => descriptorString,
            };
        } catch (error) {
            throw new ResponseError(400, 'Format descriptor tidak valid');
        }
    }

    matcher(referenceDescriptor, queryDescriptor) {
        try {
            const faceMatcher = new faceapi.FaceMatcher([referenceDescriptor]);
            const match = faceMatcher.findBestMatch(queryDescriptor);
            return match.distance < 0.4;
        } catch (error) {
            throw new ResponseError(500, 'Gagal mencocokkan wajah');
        }
    }
}

export default new FaceApiService();
