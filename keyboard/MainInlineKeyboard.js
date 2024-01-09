"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
// v 1.1
// let inlineKeyboard = new InlineKeyboard()
//     .text('Оплатить ✅', 'payCall')
//     .text('Мои платежи' , 'payment_history').row()
//     .text('Абонемент' , 'subscription')
//     .text('О нас', "aboutCall").row()
//     .text('Правила', "termsCall")
//     .text('Написать нам', "appeal")
//     .text('test', "test")
// v 0.7
let inlineKeyboard = new grammy_1.InlineKeyboard()
    .text('Оплатить ✅', 'payCall')
    // .text('Мои платежи' , 'payment_history').row()
    // .text('Абонемент' , 'subscription')
    .text('О нас', "aboutCall").row()
    .text('Правила', "termsCall");
// .text('Написать нам', "appeal")
// .text('test', "test")
exports.default = inlineKeyboard;
