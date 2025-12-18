const { Client } = require('pg');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function waitForDatabase() {
  const maxRetries = 30;
  const retryDelay = 2000;

  const dbConfig = {
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'feedlypet',
    password: process.env.DB_PASSWORD || 'feedlypet_password',
    database: process.env.DB_NAME || 'feedlypet_db',
  };

  for (let i = 0; i < maxRetries; i++) {
    const client = new Client(dbConfig);
    try {
      console.log(`Attempting to connect to database (attempt ${i + 1}/${maxRetries})...`);
      await client.connect();
      console.log('Successfully connected to database!');
      await client.end();
      return true;
    } catch (error) {
      console.log(`Database not ready: ${error.message}`);
      if (i < maxRetries - 1) {
        console.log(`Waiting ${retryDelay / 1000} seconds before retry...`);
        await sleep(retryDelay);
      }
    }
  }

  console.error('Failed to connect to database after maximum retries');
  process.exit(1);
}

waitForDatabase().then(() => {
  console.log('Database is ready!');
  process.exit(0);
}).catch((error) => {
  console.error('Error waiting for database:', error);
  process.exit(1);
});