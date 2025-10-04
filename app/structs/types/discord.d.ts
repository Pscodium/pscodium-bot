import { ClientEvents as OriginalClientEvents } from "discord.js";
import { ExtendedClient } from "../ExtendedClient";
import { Game } from "../../services/jobs/types/game";

export interface JobClientEvent {
    client: ExtendedClient;
    channelIds: string[];
    game: Game;
}

declare module "discord.js" {
  interface ClientEvents extends OriginalClientEvents {
    gameQueueJob: [job: JobClientEvent];
  }
}