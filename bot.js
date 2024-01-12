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
const axios_1 = __importDefault(require("axios"));
const swagger_setup_1 = require("./setup/swagger/swagger_setup");
const express_setup_1 = require("./setup/express/express_setup");
const Index_1 = __importDefault(require("./keyboard/Index"));
const user_routers_1 = __importDefault(require("./user/router/user_routers"));
(0, dotenv_1.config)(); // Load environment variables from .env file
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
(0, express_setup_1.setupExpress)(app, exports.bot, botToken, localPort);
app.use('/user', user_routers_1.default);
exports.bot.use((0, grammy_1.session)({
    initial: () => ({ appealState: null }),
}));
const adminIds = [565047052];
(0, swagger_setup_1.setupSwagger)(app);
exports.bot.api.setMyCommands(desc_1.userCommands); // Default to user commands
exports.bot.command('start', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.from || !ctx.chat)
        return;
    const userId = ctx.from.id;
    console.log(`User ID: ${userId}`);
    yield ctx.reply('Для оплаты занятий нажмите, пожалуйста, "Оплатить ✅"', {
        reply_markup: Index_1.default.main,
    });
}));
// APPEAL
exports.bot.on('message', (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    if (ctx.session.appealState === 'awaiting_input' && (ctx.message.text || ctx.message.photo || ctx.message.video)) {
        for (const adminId of adminIds) {
            try {
                yield ctx.forwardMessage(adminId);
            }
            catch (error) {
                console.error(`Failed to forward message to admin with ID ${adminId}:`, error);
                // Optionally, send an error notification to the user or take other actions
            }
        }
        ctx.session.appealState = 'received_input';
        yield ctx.reply('Thank you for your appeal. What would you like to do next?', {
            reply_markup: Index_1.default.main,
        });
    }
    if ('successful_payment' in ctx.message) {
        const paymentInfo = ctx.message.successful_payment;
        if (!paymentInfo)
            throw new Error("Info is undefined");
        console.log('Payment received:', paymentInfo);
        // console.log('paymentInfo.invoice_payload:', paymentInfo.invoice_payload);
        yield ctx.reply('Спасибо за покупку!');
        const adminIds = [565047052, 733685428]; // Array of admin IDs
        const paymentDetails = `Получена оплата от ${(_a = ctx.from) === null || _a === void 0 ? void 0 : _a.first_name} ${(_b = ctx.from) === null || _b === void 0 ? void 0 : _b.last_name} (ID: ${(_c = ctx.from) === null || _c === void 0 ? void 0 : _c.id}) (@${(_d = ctx.from) === null || _d === void 0 ? void 0 : _d.username}):\nTotal amount: ${paymentInfo.total_amount / 100} ${paymentInfo.currency}\nInvoice payload: ${paymentInfo.invoice_payload}`;
        for (const adminId of adminIds) {
            try {
                yield ctx.api.sendMessage(adminId, paymentDetails);
            }
            catch (e) {
                console.log(`Failed to send message to admin with ID ${adminId}:`, e);
            }
        }
        // Define the URL and the payload for the POST request
        // const url = 'http://localhost:3002/payment/create';
        // const payload = {
        //     // user_id: ctx.from?.id,
        //     telegram_id: ctx.from?.id, // Assuming you want to use the Telegram user ID
        //     // product_id: paymentInfo.invoice_payload // Assuming the invoice_payload contains the product_id
        //     product_id: 2 // Assuming the invoice_payload contains the product_id
        // };
        //
        // // console.log('payload', payload)
        // try {
        //     const response = await axios.post(url, payload, {
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'accept': '*/*'
        //         }
        //     });
        //     console.log('POST request result:', response.data);
        // } catch (error:any) {
        //     if (error.response) {
        //         // The request was made and the server responded with a status code
        //         // that falls out of the range of 2xx
        //         console.error('Error data:', error.response.data);
        //         console.error('Error status:', error.response.status);
        //         console.error('Error headers:', error.response.headers);
        //     } else if (error.request) {
        //         // The request was made but no response was received
        //         console.error('Error request:', error.request);
        //     } else {
        //         // Something happened in setting up the request that triggered an Error
        //         console.error('Error message:', error.message);
        //     }
        //     console.error('Error config:', error.config);
        // }
    }
    yield next();
}));
exports.bot.callbackQuery('appeal', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.answerCallbackQuery();
    ctx.session.appealState = 'awaiting_input';
    yield ctx.reply('Please send the text of your appeal along with any photo or video.');
}));
exports.bot.command('appeal', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.appealState = 'awaiting_input';
    yield ctx.reply('Please send the text of your appeal along with any photo or video.');
}));
// Appeal end
exports.bot.command('about', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply(desc_1.about); // Replace with actual information
}));
exports.bot.command('terms', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply(desc_1.terms); // Replace with actual information
}));
exports.bot.callbackQuery('payCall', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.answerCallbackQuery();
    const paymentKeyboard = new grammy_1.InlineKeyboard();
    desc_1.paymentOptions.forEach((option, index) => {
        paymentKeyboard.text(`▫${option.label} - ${option.amount / 100} руб.`, `pay_${index}`).row();
    });
    yield ctx.reply('Выберите, пожалуйста, количество занятий:', {
        reply_markup: paymentKeyboard,
    });
}));
exports.bot.command('pay', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const paymentKeyboard = new grammy_1.InlineKeyboard();
    desc_1.paymentOptions.forEach((option, index) => {
        paymentKeyboard.text(`▫${option.label} - ${option.amount / 100} руб.`, `pay_${index}`).row();
    });
    yield ctx.reply('Выберите, пожалуйста, количество занятий:', {
        reply_markup: paymentKeyboard,
    });
}));
exports.bot.callbackQuery(/^pay_\d+$/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const optionIndex = parseInt(ctx.callbackQuery.data.split('_')[1]);
    const selectedOption = desc_1.paymentOptions[optionIndex];
    const prices = [
        { label: selectedOption.label, amount: selectedOption.amount },
    ];
    yield ctx.answerCallbackQuery(); // Acknowledge the callback query
    yield ctx.replyWithInvoice('Оплата', `Оплата ${optionIndex == 0 ? "занятия" : "занятий"}`, `Оплата за ${optionIndex == 0 ? "1 занятия" : selectedOption.label}`, botProviderToken, 'RUB', prices);
}));
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
exports.bot.callbackQuery('aboutCall', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('callbackQuery');
    yield ctx.answerCallbackQuery(); // Acknowledge the callback query
    yield ctx.reply(desc_1.about); // Replace with actual information
}));
exports.bot.callbackQuery('termsCall', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.answerCallbackQuery(); // Acknowledge the callback query
    yield ctx.reply(desc_1.terms); // Replace with actual terms of use
}));
exports.bot.callbackQuery('payment_history', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const telegramID = ctx.from.id;
    try {
        // Send a POST request to the payment service
        const response = yield axios_1.default.post('http://localhost:3002/payment/get_by_telegram_id', {
            telegram_id: telegramID
        });
        // console.log(response.data)
        // {
        //     pay_id: 25,
        //     user_id: 2,
        //     user_name: 'Gabe',
        //     product_name: 'subscription_4',
        //     product_desc: 'Разовое занятие',
        //     status: 'new',
        //     spend: 0,
        //     created: '2023-12-16T21:22:43.247Z'
        // },
        const pays = response.data; // Use the Pay interface here
        let message = `${ctx.from.first_name}, ваши платежи:\n`;
        pays.reverse().forEach((pay) => {
            message += `Абонемент: ${pay.product_desc}, Status: ${pay.status}, Spend: ${pay.spend}\n`;
            let date = new Date(pay.created);
            // console.log(  date.getDate()  )
        });
        // Send the formatted message to the user
        yield ctx.reply(message);
    }
    catch (error) {
        console.error('Error fetching payments:', error);
        yield ctx.reply('An error occurred while fetching your payments.');
    }
    yield ctx.answerCallbackQuery(); // Acknowledge the callback query
}));
// Handle graceful shutdown
function handleShutdown(signal) {
    console.log(`Received ${signal}. Bot is stopping...`);
    exports.bot.stop()
        .then(() => console.log('Bot has been stopped.'))
        .catch((err) => console.error('Error stopping the bot:', err));
}
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
// interface GrammyBot {
//     bot: Bot<Context>; // Instance of the Bot class
//     api: Api;          // Shortcut to the bot's Api instance
// }
function checkAndSetWebhook(bot) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const currentWebhookInfo = yield bot.api.getWebhookInfo();
            if (currentWebhookInfo.url !== `${webhookUrl}/bot${botToken}`) {
                console.log('Setting webhook...');
                yield bot.api.setWebhook(`${webhookUrl}/bot${botToken}`);
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
if (mode === 'WEBHOOK') {
    console.log("WEBHOOK on");
    checkAndSetWebhook(exports.bot);
}
else {
    exports.bot.start();
    console.log("Polling is running");
}
