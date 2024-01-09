"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
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
                url: 'http://localhost:4001',
            },
        ],
        tags: [
            { name: 'user' },
        ],
    },
    apis: [
        './src/routes/*.ts',
        './src/user/router/user_routers.ts'
    ],
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
function setupSwagger(app) {
    app.use('/api.ts-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
}
exports.setupSwagger = setupSwagger;
