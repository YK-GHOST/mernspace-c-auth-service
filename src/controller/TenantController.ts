import { NextFunction, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator";

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}

    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({ error: result.array() });
            return;
        }

        const { name, address } = req.body;
        this.logger.debug("request for create a tenant: ", req.body);

        try {
            const tenant = await this.tenantService.create({ name, address });
            res.status(201).json({ id: tenant.id });
        } catch (error) {
            next(error);
        }
        res.status(201).json();
    }
}
