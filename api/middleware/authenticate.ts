import { NextFunction, Request, Response } from "express";
import { db } from '../../app/data-source';

class AuthService {

    async session(req: Request, res: Response, next: NextFunction) {
        const { authorization } = req.headers;

        if (!authorization) {
            return res.sendStatus(401);
        }

        const token = authorization.replace("Bearer", '').trim();

        if (!token) {
            return res.sendStatus(401);
        }

        const data = await db.Session.findOne({
            where: {
                expiration_date: db.sequelize.literal('expiration_date > NOW()'),
                sessionId: token
            }
        });

        if (!data) {
            return res.status(401).json({ error: "Invalid sessionId." });
        }

        const user = await db.User.findOne({
            where: { id: data.userId },
            include: {
                model: db.Permissions,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'id']
                }
            }
        });
        if (!user) {
            throw new Error("User not found");
        }

        req.user = user;
        req.userId = user.id;
        req.is_master_admin = user.permission.master_admin_level;

        return next();
    }
}

export { AuthService };
export const authenticate = new AuthService();