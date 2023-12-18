import { WebSocket } from "ws";

export interface GameStructure {
    id: string,
    players: {
      name: string,
      avatar?: string, // chemin d'accès à l'avatar (undefined si pas d'avatar)
      points: number
    }[],
    state: GameState,
    songs: {
      id: string,
      title: string,
      artist: string,
      addedBy: string,
      cover?: string,
      explicit: boolean,
      url: string,
    }[],
    settings: {
      gameMode: "classic" | "firstnote",
      maxPlayers: number,
      winPointsOnSelfAddedSongs: boolean,
      songsLimitPerPlayer: number,
      pointsOnWin: {
        title: number,
        artist: number,
        bonus: number
      },
      penaltyOnWrongAnswer: number,
      banExplicitSongs: boolean
    }
}

export interface GameConnectionsStructure {
  gameId: string,
  connections: WebSocket[]
}

export interface WSMessageStructure {
  method: "GET" | "JOIN",
  value: string,
  data: any
}

export interface SpotifySearchOptions {
    q: string,
    type: "audiobook" | "artist" | "playlist" | "track" | "show" | "episode",
    market?: string,
    limit?: number,
    offset?: number,
    include_external?: "audio",
}

export type GameState = "waiting_players" | "waiting_songs" | "playing" | "end"
