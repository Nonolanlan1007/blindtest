import { SpotifySearchOptions } from "./types";
import axios from "axios";
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



    // const res = await axios.get(`https://www.googleapis.com/youtube/v3/search`, { params: options })
    // console.log(JSON.stringify(res.data.items[0], null, 2))
    // if (res.status !== 200) throw new Error(res.data.error)

    // return res.data;
}

export async function findVideoId (query: string): Promise<string | undefined> {
    const res = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
            key: process.env.YOUTUBE_TOKEN,
            part: "snippet",
            q: `${query} lyrics`,
            type: "video"
        }
    })

    if (res.status !== 200) throw new Error(res.data.error)

    return res.data.items[0].id.videoId;
}