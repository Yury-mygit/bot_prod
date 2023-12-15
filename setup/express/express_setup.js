"use strict";
// expressSetup.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupExpress = void 0;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const grammy_1 = require("grammy");
function setupExpress(app, bot, botToken, localPort) {
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use((0, cors_1.default)({
        origin: ['*', 'http://localhost:3002', 'http://localhost:3000', 'https://ebbc-176-115-195-132.ngrok-free.app/']
    }));
    // Define a route that handles your bot updates
    app.post(`/bot${botToken}`, (0, grammy_1.webhookCallback)(bot, 'express'));
    // Start the express server
    app.listen(localPort, () => {
        console.log(`Server is running on port ${localPort}`);
        // Check if the webhook needs to be set or updated
        // checkAndSetWebhook(); // Uncomment if you have this function defined elsewhere
    });
}
exports.setupExpress = setupExpress;
