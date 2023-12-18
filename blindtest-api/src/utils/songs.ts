import { SpotifySearchOptions } from "./types";
// @ts-ignore
import Spotify from "spotify-finder";

export async function search (options: SpotifySearchOptions): Promise<any> {
    const SpotifyClient = new Spotify({
        consumer: {
            key: process.env.SPOTIFY_ID,
            secret: process.env.SPOTIFY_SECRET
        }
    })

    const res = await SpotifyClient.search(options)

    return res.tracks.items
}
