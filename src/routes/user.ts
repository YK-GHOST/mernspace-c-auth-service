import express from "express";
import authenticate from "../middlewares/authenticate";
import { isAuthorize } from "../middlewares/isAuthorize";
import { Roles } from "../constants";

import { UserController } from "../controller/UserController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post("/", authenticate, isAuthorize([Roles.ADMIN]), (req, res, next) =>
    userController.create(req, res, next),
);

export default router;
