import { Config } from "./config";
import app from "./app";
import logger from "./config/logger";
import { AppDataSource } from "./config/data-source";

const startServer = async () => {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();
        logger.info("Database connected successfully");
        app.listen(PORT, () => {
            logger.info("Server is listening on PORT", { port: PORT });
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

void startServer();
