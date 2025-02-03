import request from "supertest";
import bcrypt from "bcrypt";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { isJWT } from "../utils";

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
        it("should return the id of the logged in user.", async () => {
            //Arrange
            const userData = {
                email: "yogesh@gmail.com",
                password: "password",
            };

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            //Act
            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            //Assert
            expect(response.body).toHaveProperty("id");
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            );
        });
        it("should return the access token & refresh token inside a cookie.", async () => {
            //Arrange
            const userData = {
                email: "yogesh@gmail.com",
                password: "password",
            };

            interface Headers {
                ["set-cookie"]?: string[];
            }

            //Act
            const response = await request(app)
                .post("/auth/login")
                .send(userData);

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
    });
});
