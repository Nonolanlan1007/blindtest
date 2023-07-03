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
        title: string,
        artist: string,
        downloaded: boolean,
        path?: string,
        addedBy: string
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
        penaltyOnWrongAnswer: boolean,
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

export type GameState = "waiting_players" | "waiting_songs" | "playing" | "end"