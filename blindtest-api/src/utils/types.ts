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

export interface YoutubeSearchOptions {
    part: "snippet"
    channelId?: string
    channelType?: "channelTypUnspecified" | "any" | "show"
    eventType?: "eventTypeUnspecified" | "completed" | "live" | "upcoming"
    forContentOwner?: boolean
    forDeveloper?: boolean
    forMine?: boolean
    location?: string
    locationRadius?: string
    maxResults?: number
    onBehalfOfContentOwner?: string
    order?: "date" | "rating" | "relevance" | "title" | "videoCount" | "viewCount"
    pageToken?: string
    publishedAfter?: string
    publishedBefore?: string
    q?: string
    regionCode?: string
    relatedToVideoId?: string
    relevanceLanguage?: string
    safeSearch?: "moderate" | "none" | "strict"
    topicId?: string
    type?: "channel" | "playlist" | "video"
    videoCaption?: "any" | "closedCaption" | "none"
    videoCategoryId?: "10" | string
    videoDefinition?: "any" | "high" | "standard"
    videoDimension?: "2d" | "3d" | "any"
    videoDuration?: "any" | "long" | "medium" | "short"
    videoEmbeddable?: "any" | "true"
    videoLicense?: "any" | "creativeCommon" | "youtube"
    videoSyndicated?: "any" | "true"
    videoType?: "any" | "episode" | "movie"
    uploadType?: "event" | "none" | "scheduled"
    callback?: string
    fields?: string
    key: string
    alt?: "json"
    quotaUser?: string
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