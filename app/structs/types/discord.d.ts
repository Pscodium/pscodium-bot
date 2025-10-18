import { ClientEvents as OriginalClientEvents } from "discord.js";
import { ExtendedClient } from "../ExtendedClient";
import { GameDTO } from "../../services/jobs/dto/GameDTO";

export interface JobClientEvent {
    client: ExtendedClient;
    channelIds: string[];
    game: GameDTO;
}

declare module "discord.js" {
  interface ClientEvents extends OriginalClientEvents {
    gameQueueJob: [job: JobClientEvent];
  }
}