import { green } from "colors";
import { Server } from "ws"
import { addConnection, addPlayer, getConnections, getGame, removePlayer } from "./storage";
import { GameState, GameStructure, WSMessageStructure } from "./types";
import e from "express";

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
                    websocket.send(JSON.stringify({
                        type: "GAME",
                        data: response
                    }))
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

async function handleMessage (message: string): Promise<GameStructure> {
    const body: WSMessageStructure = JSON.parse(message)
    if (!body) throw new Error("Invalid message");

    if (body.method === "GET") {
        if (body.value === "GAME") {
            const game = getGame(body.data.id);
            if (!game) throw new Error("Unknown game");
            return game;
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
                if (!connections) return game;

                connections.forEach((connection) => {
                    connection.send(JSON.stringify({
                        type: "GAME",
                        data: game
                    }))
                })

                return game;
            } else throw new Error("Unknown game");
        } else throw new Error("Invalid request");
    } else if (body.method === "UPDATE") {
        if (body.value === "SETTING") {
            if (getGame(body.data.id)) {
                const game = getGame(body.data.id);
                if (!game) throw new Error("Unknown game");

                game.settings = body.data.settings;

                const connections = getConnections(body.data.id);
                if (!connections) return game;

                connections.forEach((connection) => {
                    connection.send(JSON.stringify({
                        type: "GAME",
                        data: game
                    }))
                })
                
                return game;
            } else throw new Error("Unknown game");
        } else if (body.value === 'STATE') {
            let game = getGame(body.data.id);
            if (!game) throw new Error("Unknown game");

            let state = body.data.state as GameState;
            game.state = state;

            const connections = getConnections(body.data.id);
            if (!connections) return game;

            connections.forEach((connection) => {
                connection.send(JSON.stringify({
                    type: "GAME",
                    data: game
                }))
            })

            return game;
        } else throw new Error("Invalid request");
    } else if (body.method === "DELETE") {
        if (body.value === "PLAYER") {
            let game = getGame(body.data.id);
            if (!game) throw new Error("Unknown game");

            removePlayer(body.data.id, body.data.name);

            const connections = getConnections(body.data.id);
            game = getGame(body.data.id);
            if (!game) throw new Error("Unknown game");
            if (!connections) return game;

            connections.forEach((connection) => {
                connection.send(JSON.stringify({
                    type: "GAME",
                    data: game
                }))
            })

            return game;
        } else throw new Error("Invalid request");
    } else throw new Error("Invalid request");
}