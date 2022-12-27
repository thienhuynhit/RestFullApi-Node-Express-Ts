"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const bookRouter_1 = __importDefault(require("./routers/bookRouter"));
const appError_1 = __importDefault(require("./utils/appError"));
const errorController_1 = __importDefault(require("./controllers/errorController"));
const userRouter_1 = __importDefault(require("./routers/userRouter"));
const reviewRouter_1 = __importDefault(require("./routers/reviewRouter"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const hpp_1 = __importDefault(require("hpp"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
const limiter = (0, express_rate_limit_1.default)({
    max: 100,
    windowMs: 60 * 60,
    message: 'Too many requests from this Ip! Please try again!!',
});
app.use('/api', limiter);
app.use((0, cors_1.default)());
app.use(express_1.default.static(`${__dirname}/public`));
app.use(express_1.default.json({ limit: '10kb' }));
app.use((0, express_mongo_sanitize_1.default)());
app.use((0, xss_clean_1.default)());
app.use((0, hpp_1.default)({
    whitelist: ['type', 'rating', 'price'],
}));
app.use('/api/v1/bookstore', bookRouter_1.default);
app.use('/api/v1/user', userRouter_1.default);
app.use('/api/v1/review', reviewRouter_1.default);
app.use('*', (req, res, next) => {
    next(new appError_1.default(`can't find ${req.originalUrl} on this server!!`, 404));
});
app.use(errorController_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map