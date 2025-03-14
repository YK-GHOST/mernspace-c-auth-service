import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("POST /tenants/:id", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;
    let id: number;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
        adminToken = jwks.token({
            sub: "1",
            role: Roles.ADMIN,
        });

        const tenantData = {
            name: "Tenant 1",
            address: "Address 1",
        };
        const response = await request(app)
            .post("/tenants")
            .set("Cookie", [`accessToken=${adminToken}`])
            .send(tenantData);

        id = response.body.id;
    });

    afterEach(async () => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    //Happy Path
    describe("Given all fields", () => {
        it("should return a tenant associated with the param id.", async () => {
            const getTenantResponse = await request(app)
                .get(`/tenants/${id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            expect(getTenantResponse.body.id).toBe(tenants[0].id);
        });
        it("should return updated tenant.", async () => {
            const updatedTenantData = {
                name: "Tenant2",
                address: "Address2",
            };

            const response = await request(app)
                .patch(`/tenants/${id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(updatedTenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.findOne({
                where: { id: response.body.id },
            });

            expect(tenant).not.toBeNull();
            expect(response.statusCode).toBe(200);
            expect(tenant?.name).toBe(updatedTenantData.name);
            expect(tenant?.address).toBe(updatedTenantData.address);
        });
        it("should delete tenant from database.", async () => {
            const response = await request(app)
                .delete(`/tenants/${id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            expect(response.statusCode).toBe(200);
            expect(tenants).toHaveLength(0);
        });
    });
});
