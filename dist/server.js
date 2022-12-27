"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './config.env' });
const mongoose_1 = __importDefault(require("mongoose"));
process.on('uncaughtException', (err) => {
    console.log('Uncaughtexception server is shutting down.... 🤷‍♀️🤷‍♀️');
    console.log(err.name, err.message);
    process.exit(1);
});
const app_1 = __importDefault(require("./app"));
const DB_LOCAL = process.env.DB_LOCAL || '';
if (DB_LOCAL === '') {
    throw new Error('Please check the url DB');
}
mongoose_1.default
    .set('strictQuery', false)
    .connect(DB_LOCAL)
    .then(() => {
    console.log('Connected to DB 😍😍');
});
const PORT = process.env.PORT || 8000;
const server = app_1.default.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
process.on('unhandledRejection', (err) => {
    console.log(`unhandeled rejection Shuting down... 🤷‍♀️🤷‍♀️`);
    console.log(err.message, err.name);
    server.close(() => {
        process.exit(1);
    });
});
//# sourceMappingURL=server.js.map