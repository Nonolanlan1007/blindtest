import { WebSocket } from "ws";
import { GameConnectionsStructure, GameStructure } from "./types";

const games = new Map<string, GameStructure>()
const connections = new Map<string, GameConnectionsStructure>()

const defaultGameData = {
    id: "",
    players: [],
    state: "waiting_players",
    songs: [],
    settings: {
        gameMode: "classic",
        maxPlayers: 25,
        winPointsOnSelfAddedSongs: true,
        songsLimitPerPlayer: 5,
        pointsOnWin: {
            title: 1,
            artist: 1,
            bonus: 1
        },
        penaltyOnWrongAnswer: true,
        banExplicitSongs: false
    },
    connections: []
} as GameStructure

export function createGame (code: string) {
    if (games.has(`game-${code}`)) return undefined;

    let gameData = JSON.parse(JSON.stringify(defaultGameData));
    gameData.id = code;

    games.set(`game-${code}`, gameData)

    return gameData
}

export function getGame (code: string) {
    if (!games.has(`game-${code}`)) return undefined;

    return games.get(`game-${code}`)
}

export function deleteGame (code: string) {
    if (!games.has(`game-${code}`)) return false;

    games.delete(`game-${code}`)

    return true
}

export function addPlayer (code: string, name: string, avatar?: string) {
    if (!games.has(`game-${code}`)) return false;

    let gameData = games.get(`game-${code}`)

    if (!gameData || gameData.players.length >= gameData.settings.maxPlayers || gameData.players.find(x => x.name === name)) return false;

    gameData.players.push({
        name,
        avatar,
        points: 0
    })

    return true
}

export function removePlayer (code: string, name: string) {
    if (!games.has(`game-${code}`)) return false;

    let gameData = games.get(`game-${code}`)

    if (!gameData) return false;

    gameData.players = gameData.players.filter(player => player.name !== name)

    return true
}

export function addConnection (code: string, ws: WebSocket) {
    if (!games.has(`game-${code}`)) return false;

    let Connections = connections.get(`connections-${code}`)

    if (!Connections) return connections.set(`connections-${code}`, {
        gameId: code,
        connections: [ws]
    })

    Connections.connections.push(ws)

    return true
}

export function getConnections (code: string): GameConnectionsStructure["connections"] | false {
    if (!games.has(`game-${code}`)) return false;

    let Connections = connections.get(`connections-${code}`)

    if (!Connections) return false;

    return Connections.connections
}