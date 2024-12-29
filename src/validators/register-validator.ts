import { checkSchema } from "express-validator";
export default checkSchema({
    email: {
        errorMessage: "Email is required!",
        notEmpty: true,
        trim: true,
    },
    firstName: {
        errorMessage: "Firstname is required!",
        notEmpty: true,
    },
    lastName: {
        errorMessage: "LastName is required!",
        notEmpty: true,
    },
});
// export default [body("email").notEmpty().withMessage("Email is required!")];
