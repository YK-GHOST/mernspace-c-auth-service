import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { isJWT } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

jest.setTimeout(30000);

describe("POST /auth/register", () => {
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

    describe("Given all fields", () => {
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
                password: "password",
            };

            //Act -> Doing actions or triggering the work to implement the test
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //Assert -> Asserting or expecting the output of the test
            expect(response.statusCode).toBe(201);
        });

        it("should return valid JSON response", async () => {
            //Arrange -> Arrange the data needed for the test
            const userData = {
                firstName: "Yogesh",
                lastName: "Kantiwal",
                email: "yogesh@gmail.com",
                password: "password",
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
                password: "password",
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
                password: "password",
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
                password: "password",
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
                password: "password",
            };

            //Act
            await request(app).post("/auth/register").send(userData);

            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find({ select: ["password"] });
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it("should return 400 status code if email is already exists.", async () => {
            //Arrange
            const userData = {
                firstName: "Yogesh",
                lastName: "Kantiwal",
                email: "yogesh@gmail.com",
                password: "password",
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });

            //Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const users = await userRepository.find();
            //Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });

        it("should return the access token & refresh token inside a cookie.", async () => {
            //Arrange
            const userData = {
                firstName: "Yogesh",
                lastName: "Kantiwal",
                email: "yogesh@gmail.com",
                password: "password",
            };

            //Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            interface Headers {
                ["set-cookie"]?: string[];
            }

            //Assert
            let accessToken = null;
            let refreshToken = null;
            const cookies = (response.headers as Headers)["set-cookie"] || [];
            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });

            expect(accessToken).not.toBe(null);
            expect(refreshToken).not.toBe(null);
            expect(isJWT(accessToken)).toBeTruthy();
            expect(isJWT(refreshToken)).toBeTruthy();
        });

        it("should store the refreshToken in the database.", async () => {
            //Arrange
            const userData = {
                firstName: "Yogesh",
                lastName: "Kantiwal",
                email: "yogesh@gmail.com",
                password: "password",
            };

            //Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //Assert
            const refreshTokenRepo = connection.getRepository(RefreshToken);
            const refreshTokens = await refreshTokenRepo.find();
            const tokens = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: response.body.id,
                })
                .getMany();

            expect(refreshTokens).toHaveLength(1);
            expect(tokens).toHaveLength(1);
        });
    });
    describe("Fields are missing", () => {
        it("should return 400 status code if email field is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if firstName is missing.", async () => {
            // Arrange
            const userData = {
                firstName: "",
                lastName: "Kantiwal",
                email: "yogesh@gmail.com",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if lastName is missing.", async () => {
            // Arrange
            const userData = {
                firstName: "Yogesh",
                lastName: "",
                email: "yogesh@gmail.com",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if password is missing.", async () => {
            // Arrange
            const userData = {
                firstName: "Yogesh",
                lastName: "Kantiwal",
                email: "yogesh@gmail.com",
                password: "",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });
    describe("Fields are not in proper format.", () => {
        it("should trim the email field.", async () => {
            // Arrange
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: " yogesh@gmail.com ",
                password: "password",
            };
            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];

            expect(user.email).toBe("yogesh@gmail.com");
        });
        it("should return 400 status code if email is not a valid email.", async () => {
            // Arrange
            const userData = {
                firstName: "Yogesh",
                lastName: "Kantiwal",
                email: "yogesh@gmail",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if password length is less than 8 characters.", async () => {
            // Arrange
            const userData = {
                firstName: "Yogesh",
                lastName: "Kantiwal",
                email: "yogesh@gmail.com",
                password: "pass",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });
});
