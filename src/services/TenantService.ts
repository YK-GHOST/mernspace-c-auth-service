import { Repository } from "typeorm";
import { ITenant, TenantQueryParams } from "../types";
import { Tenant } from "../entity/Tenant";

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}

    async create(tenantData: ITenant) {
        return await this.tenantRepository.save(tenantData);
    }

    async update(tenantId: number, tenantData: ITenant) {
        return await this.tenantRepository.update(tenantId, tenantData);
    }

    async getAll(validatedQuery: TenantQueryParams) {
        const queryBuilder = this.tenantRepository.createQueryBuilder("tenant");

        if (validatedQuery.q) {
            const searchTerm = `%${validatedQuery.q}%`;
            queryBuilder.andWhere(
                "LOWER(CONCAT(tenant.name, ' ', tenant.address)) ILIKE LOWER(:q)",
                { q: searchTerm },
            );
        }

        const currentPage = validatedQuery.currentPage ?? 1;
        const perPage = validatedQuery.perPage ?? 10;

        const result = await queryBuilder
            .skip((currentPage - 1) * perPage)
            .take(perPage)
            .orderBy("tenant.id", "DESC")
            .getManyAndCount();

        return result;
    }

    async getById(tenantId: number) {
        return await this.tenantRepository.findOne({ where: { id: tenantId } });
    }

    async deleteById(tenantId: number) {
        return await this.tenantRepository.delete(tenantId);
    }
}
