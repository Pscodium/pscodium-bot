import { Response, Request } from "express";
import { db } from '../../app/data-source';

class UserController {
    async getUsers(req: Request, res: Response) {
        try {
            const users = await db.User.findAll({
                include: [
                    {
                        model: db.Permissions,
                        attributes: {
                            exclude: ['id', 'createdAt', 'updatedAt', 'userId']
                        }
                    },
                    {
                        model: db.Bank,
                        attributes: {
                            exclude: ['id', 'createdAt', 'updatedAt'],
                            include: [
                                [db.sequelize.literal('bank + balance'), "total"]
                            ]
                        }
                    },
                    {
                        model: db.Game,
                        attributes: {
                            exclude: ['id', 'createdAt', 'updatedAt']
                        }
                    }
                ],
                attributes: {
                    exclude: ['permissionId', 'bankId', 'gameId']
                }
            });

            return res.status(200).json(users);
        } catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    }

    async getReqUser(req: Request, res: Response) {
        try {
            if (!req.userId) {
                return res.sendStatus(403);
            }

            const user = await db.User.findOne({
                where: {
                    id: req.userId
                },
                include: [
                    {
                        model: db.Permissions,
                        attributes: {
                            exclude: ['id', 'createdAt', 'updatedAt', 'userId']
                        }
                    },
                    {
                        model: db.Bank,
                        attributes: {
                            exclude: ['id', 'createdAt', 'updatedAt'],
                            include: [
                                [db.sequelize.literal('bank + balance'), "total"]
                            ]
                        }
                    },
                    {
                        model: db.Game,
                        attributes: {
                            exclude: ['id', 'createdAt', 'updatedAt']
                        }
                    }
                ],
                attributes: {
                    exclude: ['permissionId', 'bankId', 'gameId']
                }
            });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json(user);
        } catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    }
}

export const userController = new UserController();