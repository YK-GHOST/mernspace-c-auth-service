import express, { NextFunction, Request, Response } from "express";
import { TenantController } from "../controller/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { isAuthorize } from "../middlewares/isAuthorize";
import { Roles } from "../constants";
import tenantValidator from "../validators/tenant-validator";

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
    "/",
    authenticate,
    tenantValidator,
    isAuthorize([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.create(req, res, next),
);

router.get(
    "/:id",
    authenticate,
    isAuthorize([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getOne(req, res, next),
);

router.patch(
    "/:id",
    authenticate,
    tenantValidator,
    isAuthorize([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.update(req, res, next),
);

router.delete(
    "/:id",
    authenticate,
    isAuthorize([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.deleteOne(req, res, next),
);

export default router;
