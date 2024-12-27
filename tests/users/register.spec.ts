import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("POST /auth/register", () => {
    describe("Given all fields", () => {
        let connection: DataSource;

        beforeAll(async () => {
            connection = await AppDataSource.initialize();
        });

        beforeEach(async () => {
            //Database Truncate
            await connection.dropDatabase();
            await connection.synchronize();
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

        it("should return the id of the created user", async () => {
            //we need the user
            //we need to pass the user to the request
            //we need to assert that the repsonse.body must contain a property of id
            //we need to assert that the reponse.body.id must be equal to the user stored in the database.
            //Arrange
            const userData = {
                firstName: "Yogesh",
                lastName: "Kantiwal",
                email: "yogesh@gmail.com",
                password: "secret",
            };

            //Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const respository = connection.getRepository(User);
            const users = await respository.find();

            //Assert
            expect(response.body).toHaveProperty("id");
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            );
        });

        it("should assign a customer role.", async () => {
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
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it("should store the password in the database.", async () => {
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
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });
    });
    describe("Fields are missing", () => {});
});
