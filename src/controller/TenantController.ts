import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest, TenantQueryParams } from "../types";
import { Logger } from "winston";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";

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
    }

    async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({ error: result.array() });
            return;
        }
        const { name, address } = req.body;
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }
        try {
            await this.tenantService.update(Number(tenantId), {
                name,
                address,
            });
            res.json({ id: Number(tenantId) });
        } catch (err) {
            next(err);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true });
        try {
            const [tenants, count] = await this.tenantService.getAll(
                validatedQuery as TenantQueryParams,
            );

            this.logger.info("All tenant have been fetched");
            res.json({
                currentPage: validatedQuery.currentPage as number,
                perPage: validatedQuery.perPage as number,
                total: count,
                data: tenants,
            });
        } catch (err) {
            next(err);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid URL param."));
            return;
        }

        try {
            const tenant = await this.tenantService.getById(Number(tenantId));

            if (!tenant) {
                next(createHttpError(400, "Tenant does not exists"));
                return;
            }

            this.logger.info("Tenant has been fetched");
            res.json(tenant);
        } catch (err) {
            next(err);
        }
    }

    async deleteOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;
        if (!tenantId) {
            next(createHttpError(400, "Invalid URL param."));
            return;
        }
        try {
            await this.tenantService.deleteById(Number(tenantId));
            res.json({ id: tenantId });
        } catch (err) {
            next(err);
        }
    }
}
