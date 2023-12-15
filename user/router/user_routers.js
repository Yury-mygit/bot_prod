"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_validator_1 = __importDefault(require("../validator/user_validator"));
const user_controller_1 = __importDefault(require("../controller/user_controller"));
const user_routers = express_1.default.Router();
user_routers.post('/pay/reminder', ...user_validator_1.default.notification(), user_controller_1.default.pay_reminder);
exports.default = user_routers;
/**
 * @openapi
 * paths:
 *   /user/pay/reminder:
 *     post:
 *       tags:
 *         - Payment
 *       summary: Your route summary
 *       description: Your route description
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                 telegram_id:
 *                   type: integer
 *                   description: The ID of the student to update
 *                   default: 565047052
 *                 note:
 *                   type: string
 *                   description: skip
 *                   default: Пожалуйса, не забудте оплатить занятие
 *                required:
 *                 - telegram_id
 *                 - note
 *
 *       responses:
 *         '200':
 *           description: Successful operation
 *
 */ 
