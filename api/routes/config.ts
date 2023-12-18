/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from "express";
import { userRoutes } from './user.routes';
import { AuthService } from "../middleware/authenticate";

export function routeInitialization(app: Router, auth: AuthService) {
    userRoutes.init(app, auth);
    return app;
}