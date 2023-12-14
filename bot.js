"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
const grammy_1 = require("grammy");
const dotenv_1 = require("dotenv");
const desc_1 = require("./desc");
const express_1 = __importDefault(require("express"));
const grammy_2 = require("grammy");
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const cors_1 = __importDefault(require("cors"));
const cookieParser = require('cookie-parser');
(0, dotenv_1.config)(); // Load environment variables from .env file
const user_routers_1 = __importDefault(require("./user/router/user_routers"));
// const mode = process.env.MODE
// const localPort = process.env.PORT!; // The local port you are forwarding with ngrok
// const webhookUrl = process.env.WEBHOOKURL!;
// const botToken = process.env.BOT_TOKEN!
// // const botToken = process.env.BOT_TOKEN_test!
// const botProviderToken = process.env.PROVIDER_TOKEN!
// // const botProviderToken = process.env.PROVIDER_TOKEN_test!
const mode = process.env.MODE || 'POLLING';
const localPort = process.env.PORT || '4000';
const webhookUrl = process.env.WEBHOOKURL || '';
const botToken = process.env.BOT_TOKEN;
const botProviderToken = process.env.PROVIDER_TOKEN;
if (mode === 'WEBHOOK' && !webhookUrl) {
    console.error('WEBHOOKURL is required when MODE is set to "WEBHOOK"');
    process.exit(1);
}
exports.bot = new grammy_1.Bot(botToken);
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(cookieParser());
app.use((0, cors_1.default)({
    origin: ['http://localhost:3002', 'http://localhost:3000', 'https://ebbc-176-115-195-132.ngrok-free.app/']
}));
// Define a route that handles your bot updates
app.post(`/bot${botToken}`, (0, grammy_2.webhookCallback)(exports.bot, 'express'));
// Start the express server
app.listen(localPort, () => {
    console.log(`Server is running on port ${localPort}`);
    // Check if the webhook needs to be set or updated
    // checkAndSetWebhook();
});
app.use('/user', user_routers_1.default);
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My API',
            version: '1.0.0',
            description: 'A simple Express API',
        },
        servers: [
            {
                url: 'http://localhost:4001`',
            },
        ],
        tags: [
            { name: 'user' },
        ],
    },
    apis: [
        './src/routes/*.ts',
        './src/user/router/user_routers.ts'
    ], // files containing annotations as above
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
exports.bot.api.setMyCommands(desc_1.userCommands); // Default to user commands
//
exports.bot.command('start', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.from || !ctx.chat)
        return;
    let inlineKeyboard = new grammy_1.InlineKeyboard()
        // .webApp('Перети на сайт', 'https://goldenspeak.ru/')
        .text('Оплатить ✅', 'payCall').row()
        .text('О нас', "aboutCall") // Add 'About' button
        .text('Правила использования', "termsCall"); // Add 'Terms of Use' button
    yield ctx.reply('Для оплаты занятий нажмите, пожалуйста, "Оплатить ✅"', {
        reply_markup: inlineKeyboard,
    });
}));
exports.bot.command('pay', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch payment options from the server or use default
    // await fetchPaymentOptions();
    const paymentKeyboard = new grammy_1.InlineKeyboard();
    desc_1.paymentOptions.forEach((option, index) => {
        paymentKeyboard.text(`▫${option.label} - ${option.amount / 100} руб.`, `pay_${index}`).row();
    });
    yield ctx.reply('Выберите, пожалуйста, количество занятий:', {
        reply_markup: paymentKeyboard,
    });
}));
exports.bot.command('about', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // await ctx.answerCallbackQuery(); // Acknowledge the callback query
    yield ctx.reply(desc_1.about); // Replace with actual information
}));
exports.bot.command('terms', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // await ctx.answerCallbackQuery(); // Acknowledge the callback query
    yield ctx.reply(desc_1.terms); // Replace with actual information
}));
exports.bot.callbackQuery('payCall', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // Acknowledge the callback query to stop the 'pay' button from blinking
    yield ctx.answerCallbackQuery();
    const paymentKeyboard = new grammy_1.InlineKeyboard();
    desc_1.paymentOptions.forEach((option, index) => {
        paymentKeyboard.text(`▫${option.label} - ${option.amount / 100} руб.`, `pay_${index}`).row();
    });
    yield ctx.reply('Выберите, пожалуйста, количество занятий:', {
        reply_markup: paymentKeyboard,
    });
}));
exports.bot.callbackQuery('aboutCall', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('callbackQuery');
    yield ctx.answerCallbackQuery(); // Acknowledge the callback query
    yield ctx.reply(desc_1.about); // Replace with actual information
}));
exports.bot.callbackQuery('termsCall', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.answerCallbackQuery(); // Acknowledge the callback query
    yield ctx.reply(desc_1.terms); // Replace with actual terms of use
}));
// Handle callback queries for payment options
exports.bot.callbackQuery(/^pay_\d+$/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const optionIndex = parseInt(ctx.callbackQuery.data.split('_')[1]);
    const selectedOption = desc_1.paymentOptions[optionIndex];
    const prices = [
        { label: selectedOption.label, amount: selectedOption.amount },
    ];
    yield ctx.answerCallbackQuery(); // Acknowledge the callback query
    console.log(optionIndex);
    yield ctx.replyWithInvoice('Оплата', // title
    `Оплата ${optionIndex == 0 ? "занятия" : "занятий"}`, // description
    'Custom-Payload', // payload
    botProviderToken, // provider_token
    'RUB', // currency
    prices // prices
    // Add other optional parameters if needed
    );
}));
// Handle graceful shutdown
function handleShutdown(signal) {
    console.log(`Received ${signal}. Bot is stopping...`);
    exports.bot.stop()
        .then(() => console.log('Bot has been stopped.'))
        .catch((err) => console.error('Error stopping the bot:', err));
}
exports.bot.on('pre_checkout_query', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // Perform validation checks here
    const isEverythingOk = true; // Replace with actual validation logic
    if (isEverythingOk) {
        yield ctx.answerPreCheckoutQuery(true); // Confirm the checkout
    }
    else {
        yield ctx.answerPreCheckoutQuery(false, "An error message explaining the issue");
    }
}));
exports.bot.on('message:successful_payment', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    // Payment was successful
    const paymentInfo = ctx.message.successful_payment;
    console.log('Payment received:', paymentInfo);
    // You can now deliver the service or product and send a confirmation message to the user
    yield ctx.reply('Thank you for your purchase!');
    // Send the payment details to the user with ID 733685428
    const adminId = 733685428; // Telegram user ID of the person to notify
    const paymentDetails = `Payment received from ${(_a = ctx.from) === null || _a === void 0 ? void 0 : _a.first_name} ${(_b = ctx.from) === null || _b === void 0 ? void 0 : _b.last_name} (@${(_c = ctx.from) === null || _c === void 0 ? void 0 : _c.username}):\nTotal amount: ${paymentInfo.total_amount / 100} ${paymentInfo.currency}\nInvoice payload: ${paymentInfo.invoice_payload}`;
    yield ctx.api.sendMessage(adminId, paymentDetails);
}));
// Catch and log bot errors
exports.bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof grammy_1.GrammyError) {
        console.error("Error in request:", e.description);
    }
    else if (e instanceof grammy_1.HttpError) {
        console.error("Could not contact Telegram:", e);
    }
    else {
        console.error("Unknown error:", e);
    }
});
if (mode === 'WEBHOOK') {
    function checkAndSetWebhook() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentWebhookInfo = yield exports.bot.api.getWebhookInfo();
                if (currentWebhookInfo.url !== `${webhookUrl}/bot${botToken}`) {
                    console.log('Setting webhook...');
                    yield exports.bot.api.setWebhook(`${webhookUrl}/bot${botToken}`);
                    console.log('Webhook set successfully');
                }
                else {
                    console.log('Webhook is already set to the correct URL.');
                }
            }
            catch (error) {
                handleWebhookError(error);
            }
        });
    }
    function handleWebhookError(error) {
        var _a;
        if (error instanceof grammy_1.GrammyError && error.error_code === 429) {
            const retryAfter = (_a = error.parameters) === null || _a === void 0 ? void 0 : _a.retry_after;
            if (typeof retryAfter === 'number') {
                console.log(`Retrying to set webhook after ${retryAfter} seconds`);
                setTimeout(checkAndSetWebhook, retryAfter * 1000);
            }
            else {
                console.error('Failed to set webhook due to rate limiting, but no retry_after provided.');
            }
        }
        else {
            console.error('Failed to set webhook:', error);
        }
    }
}
else {
    exports.bot.start()
        .then(() => {
    });
    console.log("Polling is running");
}
