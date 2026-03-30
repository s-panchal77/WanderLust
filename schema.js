// Schema.js
// This file defines the validation schemas for listings and reviews using Joi.
// It ensures that the data being processed meets the required structure and constraints.
// The listingSchema validates the structure of a listing object, ensuring that all required fields are present and correctly formatted.
// The reviewSchema validates the structure of a review object, ensuring that the rating is between 1 and 5 and that a comment is provided.

const Joi = require("joi");

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            url: Joi.string().allow('', null)
        }).optional(),
    }).required()
});

module.exports = { listingSchema };

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required()
});