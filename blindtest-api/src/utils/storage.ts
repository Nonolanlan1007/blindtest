const storage = new Map<string, GameStructure>()

type GameStructure = {
    id: string,
    players: {
        name: string,
        avatar?: string, // chemin d'accès à l'avatar (undefined si pas d'avatar)
        points: number
    }[],
    state: "waiting_players" | "waiting_songs" | "playing" | "end",
    songs: {
        title: string,
        artist: string,
        downloaded: boolean,
        path?: string
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
    }
} as GameStructure

export function createGame (code: string) {
    if (storage.has(`game-${code}`)) return undefined;

    let gameData = {
        ...defaultGameData,
        id: code
    }

    storage.set(`game-${code}`, gameData)

    return gameData
}

export function getGame (code: string) {
    if (!storage.has(`game-${code}`)) return undefined;

    return storage.get(`game-${code}`)
}

export function deleteGame (code: string) {
    if (!storage.has(`game-${code}`)) return false;

    storage.delete(`game-${code}`)

    return true
}

export function addPlayer (code: string, name: string, avatar?: string) {
    if (!storage.has(`game-${code}`)) return false;

    let gameData = storage.get(`game-${code}`)

    if (!gameData || gameData.players.length >= gameData.settings.maxPlayers || gameData.players.find(x => x.name === name)) return false;

    gameData.players.push({
        name,
        avatar,
        points: 0
    })

    return true
}

export function removePlayer (code: string, name: string) {
    if (!storage.has(`game-${code}`)) return false;

    let gameData = storage.get(`game-${code}`)

    if (!gameData) return false;

    gameData.players = gameData.players.filter(player => player.name !== name)

    return true
}