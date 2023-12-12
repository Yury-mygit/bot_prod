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
const bot_1 = require("../../bot"); //grammy
class Payment_Contriller {
    constructor() {
        this.errorHandler = (err, res) => {
            console.log(err);
            if (err instanceof Error) {
                res.status(500).json({ error: err.message });
            }
            else {
                res.status(500).json({ error: 'An unknown error occurred' });
            }
        };
        this.getAllPays_v2 = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { telegram_id, notes } = req.body;
            try {
                // Send a message to the user with the specified telegram_id
                yield bot_1.bot.api.sendMessage(telegram_id, "Your message here.");
                // Respond with success message
                res.json({ "message": "Message sent successfully." });
            }
            catch (err) {
                this.errorHandler(err, res);
            }
        });
        // this.createPay = this.createPay.bind(this);
    }
}
exports.default = new Payment_Contriller();
