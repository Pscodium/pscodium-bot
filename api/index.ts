import dotenv from 'dotenv';
dotenv.config();

import express, { Router, Express } from 'express';
import { routeInitialization } from './routes/config';
import { logs } from './middleware/logs';
import { authenticate } from './middleware/authenticate';
import os from 'os';
import cors from 'cors';
import bodyParser from 'body-parser';


class ApiInitializer {
    public app: Express;
    constructor() {
        this.app = express();
    }

    start() {
        try {
            const allowedOrigins = [process.env.FRONTEND_ORIGIN];
            const port = process.env.WEBSERVER_PORT;
            const network = os.networkInterfaces();
            let address;
            if (!network.eth0) {
                address = 'http://localhost';
            } else {
                address = `http://${network.eth0[0].address}`;
            }


            const options = {
                origin: String(allowedOrigins)
            };

            const router = Router();
            const routes = routeInitialization(router, authenticate);

            this.app.use(bodyParser.json());
            this.app.use(cors(options));
            this.app.use(logs);
            this.app.use(routes);

            this.app.listen(port);


            console.log(`API WebServer started on ${address}:${port}`);
        } catch (err) {
            console.log(`[Server Error] - ${err}`);
            console.error(`[Server Error] - ${err}`);
        }
    }
}

export const api = new ApiInitializer();