import { Router } from "express";
import { userController } from "../controller/user.controller";
import { AuthService } from "../middleware/authenticate";

class UserRoutes {
    init(app: Router, auth: AuthService) {
        app.get('/users', auth.session, userController.getUsers);
        app.get('/user', auth.session, userController.getReqUser);
    }
}
export const userRoutes = new UserRoutes();