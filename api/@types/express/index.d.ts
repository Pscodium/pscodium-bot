/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserInstance } from '../app/models/tables/User';
import * as http from 'http';

declare module 'express-serve-static-core' {
    export interface Request extends http.IncomingMessage, Express.Request {
        userId?: string;
        user: UserInstance
        is_master_admin: boolean;
    }
}
