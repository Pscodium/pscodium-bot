/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, Request } from "express";
import { db } from "../../app/data-source";

class BankController {

    async updateBankAccount(req: Request, res: Response) {
        try {
            const regex = /^[0-9]+$/;
            const changes: any = {};

            if (!req.body.balance && !req.body.bank) {
                return res.status(404).json({ message: "Invalid Body" });
            }

            if (req.body.bank && !regex.test(req.body.bank)) {
                return res.status(400).json({ message: "Invalid body value"});
            }

            if (req.body.balance && !regex.test(req.body.balance)) {
                return res.status(400).json({ message: "Invalid body value"});
            }

            if (req.body.bank) {
                changes.bank = Number(req.body.bank);
            }

            if (req.body.balance) {
                changes.balance = Number(req.body.balance);
            }

            if (!req.params.id) {
                await db.Bank.update(changes, {
                    where: { id: req.user.bankId }
                });

                return res.sendStatus(200);
            }

            const userBankId = await db.User.findOne({
                where: {
                    id: req.params.id
                },
                attributes: ['bankId']
            });
            if (!userBankId) {
                return res.status(404).json({ message: "User does not exists" });
            }

            await db.Bank.update(changes, {
                where: {
                    id: userBankId.bankId
                }
            });

            return res.sendStatus(200);
        } catch(err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }
    }
}

export const bankController = new BankController();