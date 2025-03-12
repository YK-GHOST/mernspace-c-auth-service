import { checkSchema } from "express-validator";

export default checkSchema({
    name: {
        trim: true,
        notEmpty: true,
        errorMessage: "Tenant name is required.",
    },
    address: {
        trim: true,
        notEmpty: true,
        errorMessage: "Tenant address is required.",
    },
});
