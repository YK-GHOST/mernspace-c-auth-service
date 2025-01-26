import { checkSchema } from "express-validator";
export default checkSchema({
    email: {
        trim: true,
        notEmpty: true,
        errorMessage: "Email is required!",
        isEmail: {
            errorMessage: "Email should be a valid email.",
        },
    },
    password: {
        errorMessage: "Password is required!",
        notEmpty: true,
    },
});
