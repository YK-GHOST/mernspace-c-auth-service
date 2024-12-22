import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
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
    });
    describe("Fields are missing", () => {});
});
