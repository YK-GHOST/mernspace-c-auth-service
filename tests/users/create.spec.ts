import request from "supertest";
import createJWKSMock from "mock-jwks";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("GET /auth/self", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        //Database Truncate
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(async () => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    //Happy Path
    describe("Given all fields", () => {
        it("should presist the user in the database.", async () => {
            //Arrange
            /**1.Register the user.
             * 2. Generate Token.
             * 3. Add token to cookie.
             */
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const userData = {
                firstName: "Yogesh",
                lastName: "Kantiwal",
                email: "yogesh@gmail.com",
                password: "password",
                tenantId: 1,
            };

            //Act
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            //Assert.
            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });
        it("should create a manager type user.", async () => {
            //Arrange
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const userData = {
                firstName: "Yogesh",
                lastName: "Kantiwal",
                email: "yogesh@gmail.com",
                password: "password",
                tenantId: 1,
            };

            //Act
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            //Assert.
            expect(users[0].role).toBe(Roles.MANAGER);
        });
        it.todo("should return 403 if non admin user tries to create a user.");
    });
});
