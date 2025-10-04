
import { Game } from "../types/game"; // tipagem completa anterior
export interface GameDTO {
  id: number;
  name: string;
  slug: string;
  backgroundImage: string;
  released: string;
  rating: number;
  metacritic: number;
  platforms: string[];
  stores: string[];
  genres: string[];
  tags: string[];
}

// export function toGameDTO(game: Game): Partial<GameDTO> {
//     return {
//         id: game.id,
//         name: game.name,
//         slug: game.slug,
//         backgroundImage: game.background_image,
//         released: game.released,
//         rating: game.rating,
//         metacritic: game.metacritic,
//         platforms: game.platforms.map(p => p.platform.name),
//         stores: game.stores.map(s => s.store.name),
//         genres: game.genres.map(g => g.name),
//         tags: game.tags.map(t => t.name),
//     };
// }