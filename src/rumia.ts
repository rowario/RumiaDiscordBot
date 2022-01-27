import "reflect-metadata";
import { config } from "dotenv";
import findConfig from "find-config";
import { createConnection } from "typeorm";
import path from "path";
import { runBot } from "./libs/discord";

config({
    path: findConfig(".env") ?? "../.env"
});

async function bootstrap() {
    await createConnection({
        type: "mongodb",
        url: process.env["DATABASE_URL"],
        entities: [path.join(__dirname, "./entities/*.{ts,js}")],
        useUnifiedTopology: true
    });
    await runBot();
}

bootstrap().then(() => console.log("App started!"));
