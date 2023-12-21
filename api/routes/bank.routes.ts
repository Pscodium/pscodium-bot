import { Router } from "express";
import { bankController } from "../controller/bank.controller";
import { AuthService } from "../middleware/authenticate";

class BankRoutes {
    init(app: Router, auth: AuthService) {
        app.put('/balance/user/:id', auth.session, bankController.updateBankAccount);
        app.put('/balance/user', auth.session, bankController.updateBankAccount);
    }
}
export const bankRoutes = new BankRoutes();