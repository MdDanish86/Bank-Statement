"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const geminiService_1 = require("./services/geminiService");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.post("/api/parse", async (req, res) => {
    try {
        const { text, mimeType, data } = req.body;
        let result;
        if (data && mimeType) {
            result = await (0, geminiService_1.parseTransactions)("", { mimeType, data });
        }
        else if (text) {
            result = await (0, geminiService_1.parseTransactions)(text);
        }
        else {
            return res.status(400).json({ error: "No input provided" });
        }
        res.send(result); // send raw CSV
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.listen(5000, () => {
    console.log("Backend running on port 5000");
});
