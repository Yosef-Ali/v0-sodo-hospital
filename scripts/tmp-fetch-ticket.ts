import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from '../lib/db';
import { people, vehicles, importPermits, companyRegistrations, permits } from '../lib/db/schema';
import { isNotNull } from 'drizzle-orm';

async function main() {
  try {
    const tables = [
      { name: 'people', table: people },
      { name: 'vehicles', table: vehicles },
      { name: 'importPermits', table: importPermits },
      { name: 'companyRegistrations', table: companyRegistrations },
      { name: 'permits', table: permits }
    ];

    for (const { name, table } of tables) {
      const result = await db.select({ ticketNumber: (table as any).ticketNumber }).from(table as any).where(isNotNull((table as any).ticketNumber)).limit(1);
      if (result.length > 0) {
        console.log(JSON.stringify({ table: name, ticketNumber: result[0].ticketNumber }));
        process.exit(0);
      }
    }

    console.log("No ticket numbers found in any table");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
