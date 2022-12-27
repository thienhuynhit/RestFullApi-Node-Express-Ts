"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (options) => {
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: '6394957c1083bf',
            pass: 'd4801b10bd00eb',
        },
    });
    const mailOptions = {
        from: 'harvey huynh <thienhuynh.it@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    await transporter.sendMail(mailOptions);
};
exports.default = sendEmail;
//# sourceMappingURL=email.js.map