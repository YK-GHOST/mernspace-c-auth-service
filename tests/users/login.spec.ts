import request from "supertest";
import bcrypt, { hash } from "bcrypt";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("POST /auth/login", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        //Database Truncate
        await connection.dropDatabase();
        await connection.synchronize();

        const userRepository = connection.getRepository(User);
        const hashedPassword = await bcrypt.hash("password", 10);

        await userRepository.save({
            firstName: "Yogesh",
            lastName: "Kantiwal",
            email: "yogesh@gmail.com",
            password: hashedPassword,
            role: Roles.CUSTOMER,
        });
    });

    afterAll(async () => {
        await connection.destroy();
    });

    //Happy Path
    describe("Given all fields", () => {
        it("should return 200 status code.", async () => {
            //Arrange
            const userData = {
                email: "yogesh@gmail.com",
                password: "password",
            };
            //Act
            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(200);
        });
    });
});
