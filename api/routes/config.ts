/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from "express";
import { userRoutes } from './user.routes';
import { AuthService } from "../middleware/authenticate";
import { bankRoutes } from "./bank.routes";

export function routeInitialization(app: Router, auth: AuthService) {
    userRoutes.init(app, auth);
    bankRoutes.init(app, auth);
    return app;
}