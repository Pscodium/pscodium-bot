import { db } from "../../data-source";
import { UserInstance } from "../../models/tables/User";


class TicketDatabaseManager {

    async createTicket(userId: string, channelId: string, question: string) {
        const ticket = await db.Ticket.create({
            channelId: channelId,
            question: question,
            createdBy: userId
        });
        const user = await db.User.findOne({
            where: {
                id: userId
            }
        });
        if(!user) return;
        if(!ticket) return;
        user.addTicket(ticket);
    }

    async findUserByChannelId(channelId: string): Promise<UserInstance | undefined> {
        const user = await db.User.findOne({
            include: [
                {
                    model: db.Ticket,
                    where: {
                        isClosed: false,
                        channelId: channelId
                    }
                }
            ]
        });
        if (!user) return;
        return user;
    }

    async updateClaimByChannelId(channelId: string, adminId: string) {
        await db.Ticket.update({
            isClaimed: true,
            claimedBy: adminId
        }, {
            where: {
                channelId: channelId,
            }
        });
    }

    async closeTicketByChannelId(channelId: string, userId: string) {
        await db.Ticket.update({
            isClosed: true,
            closedBy: userId
        }, {
            where: {
                channelId: channelId,
            }
        });
    }

    async changeTagForMembersAddByChannelId(channelId: string, user: UserInstance) {
        const ticket = await db.Ticket.findOne({
            where: {
                channelId: channelId
            }
        });
        if (!ticket) return;
        await db.Ticket.update({
            isMultiple: true
        }, {
            where: {
                channelId: channelId
            }
        });
        user.addTicket(ticket);
    }

}

export const ticketDatabaseManager = new TicketDatabaseManager();
