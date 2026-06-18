import 'dotenv/config';
import { db } from '../config/db';

async function main() {
  try {
    const users = await db.user.findMany({
      include: {
        trustProfile: true
      }
    });
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();
