import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { truncateTables } from "../utils";
import { User } from "../../src/entity/User";

describe("POST /auth/register", () => {
    describe("Given all fields", () => {
        let connection: DataSource;

        beforeAll(async () => {
            connection = await AppDataSource.initialize();
        });

        beforeEach(async () => {
            //Database Truncate
            await truncateTables(connection);
        });

        afterAll(async () => {
            await connection.destroy();
        });

        it("should return 201 status code", async () => {
            /**
             * Format to write test.
             * AAA -> Arrange, Act, Assert
             */

            //Arrange -> Arrange the data needed for the test
            const userData = {
                firstName: "Yogesh",
                lastName: "Kantiwal",
                email: "yogesh@gmail.com",
                password: "secret",
            };

            //Act -> Doing actions or triggering the work to implement the test
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //Assert -> Asserting or expecting the output of the test
            expect(response.statusCode).toBe(201);
        });

        it("should return valid JSON resonse", async () => {
            //Arrange -> Arrange the data needed for the test
            const userData = {
                firstName: "Yogesh",
                lastName: "Kantiwal",
                email: "yogesh@gmail.com",
                password: "secret",
            };

            //Act -> Doing actions or triggering the work to implement the test
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //Assert -> Assert application/json utf-8
            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should presist the user in database", async () => {
            //Arrange
            const userData = {
                firstName: "Yogesh",
                lastName: "Kantiwal",
                email: "yogesh@gmail.com",
                password: "secret",
            };

            //Act
            await request(app).post("/auth/register").send(userData);

            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });
    });
    describe("Fields are missing", () => {});
});
