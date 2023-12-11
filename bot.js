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
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const dotenv_1 = require("dotenv");
const desc_1 = require("./desc");
(0, dotenv_1.config)(); // Load environment variables from .env file
const localPort = process.env.PORT; // The local port you are forwarding with ngrok
const webhookUrl = process.env.WEBHOOKURL;
const botToken = process.env.BOT_TOKEN;
const botProviderToken = process.env.PROVIDER_TOKEN;
const bot = new grammy_1.Bot(botToken);
// webhook ==========================================================
// const app = express();
// app.use(express.json());
//
// // Define a route that handles your bot updates
// app.post(`/bot${botToken}`, webhookCallback(bot, 'express'));
//
// // Start the express server
// app.listen(localPort, () => {
//     console.log(`Server is running on port ${localPort}`);
//     // Check if the webhook needs to be set or updated
//     checkAndSetWebhook();
// });
//
// async function checkAndSetWebhook() {
//     try {
//         const currentWebhookInfo = await bot.api.getWebhookInfo();
//         if (currentWebhookInfo.url !== `${webhookUrl}/bot${botToken}`) {
//             console.log('Setting webhook...');
//             await bot.api.setWebhook(`${webhookUrl}/bot${botToken}`);
//             console.log('Webhook set successfully');
//         } else {
//             console.log('Webhook is already set to the correct URL.');
//         }
//     } catch (error) {
//         handleWebhookError(error);
//     }
// }
//
// function handleWebhookError(error:any) {
//     if (error instanceof GrammyError && error.error_code === 429) {
//         const retryAfter = error.parameters?.retry_after;
//         if (typeof retryAfter === 'number') {
//             console.log(`Retrying to set webhook after ${retryAfter} seconds`);
//             setTimeout(checkAndSetWebhook, retryAfter * 1000);
//         } else {
//             console.error('Failed to set webhook due to rate limiting, but no retry_after provided.');
//         }
//     } else {
//         console.error('Failed to set webhook:', error);
//     }
// }
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// bot.api.setWebhook(`${webhookUrl}/bot${process.env.BOT_TOKEN}`);
bot.api.setMyCommands(desc_1.userCommands); // Default to user commands
bot.api.setChatMenuButton({
    menu_button: {
        type: 'commands' // Set the menu button to display commands
    }
});
//
bot.command('start', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.from || !ctx.chat)
        return;
    let inlineKeyboard = new grammy_1.InlineKeyboard()
        // .webApp('Перети на сайт', 'https://goldenspeak.ru/')
        .text('Оплатить ✅', 'pay').row()
        .text('О нас', "adout") // Add 'About' button
        .text('Правила использования', "terms"); // Add 'Terms of Use' button
    yield ctx.reply('Для оплаты занятий нажмите, пожалуйста, "Оплатить ✅"', {
        reply_markup: inlineKeyboard,
    });
}));
bot.callbackQuery('adout', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.answerCallbackQuery(); // Acknowledge the callback query
    yield ctx.reply(desc_1.about); // Replace with actual information
}));
bot.command('about', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.answerCallbackQuery(); // Acknowledge the callback query
    yield ctx.reply(desc_1.about); // Replace with actual information
}));
// Handler for the "Terms of Use" button
bot.callbackQuery('terms', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.answerCallbackQuery(); // Acknowledge the callback query
    yield ctx.reply(desc_1.terms); // Replace with actual terms of use
}));
bot.callbackQuery('pay', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
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
bot.command('pay', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
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
// Handle callback queries for payment options
bot.callbackQuery(/^pay_\d+$/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
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
    bot.stop()
        .then(() => console.log('Bot has been stopped.'))
        .catch((err) => console.error('Error stopping the bot:', err));
}
bot.on('pre_checkout_query', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // Perform validation checks here
    const isEverythingOk = true; // Replace with actual validation logic
    if (isEverythingOk) {
        yield ctx.answerPreCheckoutQuery(true); // Confirm the checkout
    }
    else {
        yield ctx.answerPreCheckoutQuery(false, "An error message explaining the issue");
    }
}));
bot.on('message:successful_payment', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
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
bot.catch((err) => {
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
bot.start(); // for polling uncomment
