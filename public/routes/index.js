"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zipCode_router_1 = __importDefault(require("./zipCode.router"));
const user_router_1 = __importDefault(require("./user.router"));
const company_router_1 = __importDefault(require("./company.router"));
const trade_router_1 = __importDefault(require("./trade.router"));
const token_router_1 = __importDefault(require("./token.router"));
const class_router_1 = __importDefault(require("./class.router"));
const stripe_router_1 = __importDefault(require("./stripe.router"));
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send("back deploy railway");
});
router.use("/", zipCode_router_1.default);
router.use("/", user_router_1.default);
router.use("/", company_router_1.default);
router.use("/", trade_router_1.default);
router.use("/", token_router_1.default);
router.use("/", class_router_1.default);
router.use("/", stripe_router_1.default);
exports.default = router;
