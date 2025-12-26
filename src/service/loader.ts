import fs from "fs";
import path from "path";
import {Env} from "./env";

const pathToWorlds = path.join("./", Env.storagePath, Env.worldsPath);
const pathToConfig = path.join("./", Env.storagePath);

export class Loader {
    static init() {
        try {
            fs.mkdirSync(pathToWorlds);
        } catch {}
    }

    static loadConfig() {
        const p = path.join(pathToConfig, "config.json");
        return fs.readFileSync(p) + "";
    }

    static loadWorlds() {
        const worldsFiles = fs.readdirSync(pathToWorlds);
        let worlds: Array<string> = [];
        for (const i of worldsFiles) {
            const p = path.join(pathToWorlds, i);
            const file = fs.readFileSync(p) + "";
            worlds.push(file);
        }

        return worlds;
    }
}