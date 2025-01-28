import request from "supertest";
import bcrypt from "bcrypt";
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
        it("should return 200 status code.", async () => {
            //Act
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();

            //Assert
            expect(response.statusCode).toBe(200);
        });
        it("should return the user data.", async () => {
            //Arrange
            /**1.Register the user.
             * 2. Generate Token.
             * 3. Add token to cookie.
             */
            const userData = {
                firstName: "Yogesh",
                lastName: "Kantiwal",
                email: "yogesh@gmail.com",
                password: "password",
            };

            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            //Act
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();

            //Assert
            //Check if user id matches with registered user.
            expect((response.body as Record<string, string>).id).toBe(data.id);
        });
        it("should not return the password field.", async () => {
            //Arrange
            /**1.Register the user.
             * 2. Generate Token.
             * 3. Add token to cookie.
             */
            const userData = {
                firstName: "Yogesh",
                lastName: "Kantiwal",
                email: "yogesh@gmail.com",
                password: "password",
            };

            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            //Act
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();

            //Assert
            //Check if user id matches with registered user.
            expect(response.body as Record<string, string>).not.toHaveProperty(
                "password",
            );
        });
    });
});
