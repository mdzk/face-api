import Joi from "joi";

const registerFaceValidation = Joi.object({
    userId: Joi.string().uuid().required(),
    face: Joi.any().required(),
});

const checkFaceValidation = Joi.object({
    userId: Joi.string().uuid().required(),
    face: Joi.any().required(),
});

export { registerFaceValidation, checkFaceValidation };
