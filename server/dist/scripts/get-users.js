"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../config/db");
async function main() {
    try {
        const users = await db_1.db.user.findMany({
            include: {
                trustProfile: true
            }
        });
        console.log(JSON.stringify(users, null, 2));
    }
    catch (err) {
        console.error(err);
    }
    finally {
        process.exit(0);
    }
}
main();
