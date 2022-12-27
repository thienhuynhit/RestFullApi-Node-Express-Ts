import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });
import mongoose from 'mongoose';

// handel unexception
process.on('uncaughtException', (err: Error) => {
  console.log('Uncaughtexception server is shutting down.... 🤷‍♀️🤷‍♀️');
  console.log(err.name, err.message);
  process.exit(1);
});

import app from './app';

// connect to DB
const DB_LOCAL = process.env.DB_LOCAL || '';
if (DB_LOCAL === '') {
  throw new Error('Please check the url DB');
}
mongoose
  .set('strictQuery', false)
  .connect(DB_LOCAL)
  .then(() => {
    console.log('Connected to DB 😍😍');
  });
// start server
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

// handel unhandel rejection
process.on('unhandledRejection', (err: Error) => {
  console.log(`unhandeled rejection Shuting down... 🤷‍♀️🤷‍♀️`);
  console.log(err.message, err.name);
  server.close(() => {
    process.exit(1);
  });
});
