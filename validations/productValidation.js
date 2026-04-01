import Joi from "joi";

export const productSchema = Joi.object({
    name: Joi.string().min(3).required(),
    price: Joi.number().positive().required(),
})