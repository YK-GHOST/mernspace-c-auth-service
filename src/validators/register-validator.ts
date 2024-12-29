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
    firstName: {
        errorMessage: "Firstname is required!",
        notEmpty: true,
    },
    lastName: {
        errorMessage: "LastName is required!",
        notEmpty: true,
    },
    password: {
        errorMessage: "Password is required!",
        notEmpty: true,
        isLength: {
            options: {
                min: 8,
            },
            errorMessage: "Password must contain atleast 8 characters",
        },
    },
});
// export default [body("email").notEmpty().withMessage("Email is required!")];
