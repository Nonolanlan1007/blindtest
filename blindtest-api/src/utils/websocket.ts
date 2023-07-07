import { green } from "colors";
import { Server } from "ws"
import { addConnection, addPlayer, getConnections, getGame, removePlayer } from "./storage";
import { GameState, WSMessageStructure } from "./types";
import e from "express";
import { search } from "./songs";

export async function createWS (ws: Server) {
    ws.on("connection", (websocket, req) => {
        if (!req.url) return websocket.close();
        addConnection(req.url.split("/").slice(2)[1], websocket)
        console.log(`${green("[WEBSOCKET]")} New connection from ${req.socket.remoteAddress} on url ${req.url}`);

        websocket.on("message", (message) => {
            console.log(`${green("[WEBSOCKET]")} Message received from ${req.socket.remoteAddress}: ${message}`);

            const url = req.url?.split("/").slice(2);
            if (!url) return websocket.close();
            
            if (url[0] === "games" && getGame(url[1])) {
                handleMessage(message.toString()).then((response) => {
                    if (response.type === "GAME") {
                        websocket.send(JSON.stringify({
                            type: "GAME",
                            data: response.data
                        }))
                    } else if (response.type === "RESULTS") {
                        websocket.send(JSON.stringify({
                            type: "RESULTS",
                            data: response.data
                        }))
                    }
                }).catch((error) => {
                    websocket.send(JSON.stringify({
                        type: "ERROR",
                        data: {
                            message: error.message
                        }
                    }))
                });
            } else {
                websocket.send(JSON.stringify({
                    type: "ERROR",
                    data: {
                        message: "Unknown game"
                    }
                }));
            }
        });
    })
}

async function handleMessage (message: string): Promise<any> {
    const body: WSMessageStructure = JSON.parse(message)
    if (!body) throw new Error("Invalid message");

    if (body.method === "GET") {
        if (body.value === "GAME") {
            const game = getGame(body.data.id);
            if (!game) throw new Error("Unknown game");
            return { data: game, type: "GAME" };
        } else if (body.value === "RESULTS") {
            const game = getGame(body.data.id);
            if (!game) throw new Error("Unknown game");
            if (game.state !== "waiting_songs") throw new Error("Game is not in waiting_songs state");

            const results = await search({
                q: body.data.query,
                type: "track",
                limit: 5
            }).catch((error) => {
                throw new Error(error.message)
            })

            console.log(results)

            return { data: results, type: "RESULTS" };
        } else throw new Error("Invalid request");
    } else if (body.method === "JOIN") {
        if (body.data.id && body.data.name && body.data.avatar) {
            if (getGame(body.data.id)) {
                let game = getGame(body.data.id);
                if (!game) throw new Error("Unknown game");
                if (game.players.find(x => x.name === body.data.name)) throw new Error("Name already taken");
                if (game.players.length >= game.settings.maxPlayers) throw new Error("Game is full");
                addPlayer(body.data.id, body.data.name, body.data.avatar === 'none' ? undefined : body.data.avatar);

                game = getGame(body.data.id);
                if (!game) throw new Error("Unknown game")
                
                const connections = getConnections(body.data.id);
                if (!connections) return { data: game, type: "GAME" };

                connections.forEach((connection) => {
                    connection.send(JSON.stringify({
                        type: "GAME",
                        data: game
                    }))
                })

                return { data: game, type: "GAME" };
            } else throw new Error("Unknown game");
        } else throw new Error("Invalid request");
    } else if (body.method === "UPDATE") {
        if (body.value === "SETTING") {
            if (getGame(body.data.id)) {
                const game = getGame(body.data.id);
                if (!game) throw new Error("Unknown game");

                game.settings = body.data.settings;

                const connections = getConnections(body.data.id);
                if (!connections) return { data: game, type: "GAME" };

                connections.forEach((connection) => {
                    connection.send(JSON.stringify({
                        type: "GAME",
                        data: game
                    }))
                })
                
                return { data: game, type: "GAME" };
            } else throw new Error("Unknown game");
        } else if (body.value === 'STATE') {
            let game = getGame(body.data.id);
            if (!game) throw new Error("Unknown game");

            let state = body.data.state as GameState;
            game.state = state;

            const connections = getConnections(body.data.id);
            if (!connections) return { data: game, type: "GAME" };

            connections.forEach((connection) => {
                connection.send(JSON.stringify({
                    type: "GAME",
                    data: game
                }))
            })

            return { data: game, type: "GAME" };
        } else throw new Error("Invalid request");
    } else if (body.method === "DELETE") {
        if (body.value === "PLAYER") {
            let game = getGame(body.data.id);
            if (!game) throw new Error("Unknown game");

            removePlayer(body.data.id, body.data.name);

            const connections = getConnections(body.data.id);
            game = getGame(body.data.id);
            if (!game) throw new Error("Unknown game");
            if (!connections) return { data: game, type: "GAME" };

            connections.forEach((connection) => {
                connection.send(JSON.stringify({
                    type: "GAME",
                    data: game
                }))
            })

            return { data: game, type: "GAME" };
        } else throw new Error("Invalid request");
    } else throw new Error("Invalid request");
}