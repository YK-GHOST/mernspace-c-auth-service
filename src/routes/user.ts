import express, { Response, NextFunction, Request } from "express";
import authenticate from "../middlewares/authenticate";
import { isAuthorize } from "../middlewares/isAuthorize";
import { Roles } from "../constants";
import { UserController } from "../controller/UserController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import updateUserValidator from "../validators/update-user-validator";
import { UpdateUserRequest } from "../types";
import logger from "../config/logger";
import listUsersValidator from "../validators/list-users-validator";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

router.post("/", authenticate, isAuthorize([Roles.ADMIN]), (req, res, next) =>
    userController.create(req, res, next),
);

router.get(
    "/",
    authenticate,
    isAuthorize([Roles.ADMIN]),
    listUsersValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next),
);

router.patch(
    "/:id",
    authenticate,
    isAuthorize([Roles.ADMIN]),
    updateUserValidator,
    (req: UpdateUserRequest, res: Response, next: NextFunction) =>
        userController.update(req, res, next),
);

router.get("/:id", authenticate, isAuthorize([Roles.ADMIN]), (req, res, next) =>
    userController.getOne(req, res, next),
);

router.delete(
    "/:id",
    authenticate,
    isAuthorize([Roles.ADMIN]),
    (req, res, next) => userController.delete(req, res, next),
);

export default router;
