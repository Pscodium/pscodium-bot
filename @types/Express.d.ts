import { UserInstance } from '../app/models/tables/User';

declare global {
    namespace Express {
        interface Request {
            userId: string;
            user: UserInstance
            is_master_admin: boolean;
        }
    }
}