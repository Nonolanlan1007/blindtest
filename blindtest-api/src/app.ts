import {blue, green, yellow, cyan} from "colors";
import "dotenv/config";
import express from 'express';
import fs, {existsSync} from "fs";
import {createServer} from "http";
import morgan from "morgan";
import path from "path";
import cors from "cors";
import {Server} from "ws";
import { createWS } from "./utils/websocket";
import { search } from "./utils/songs";

const app = express();
const server = createServer(app);
const websocket = new Server({
  server,
  maxPayload: 1024 * 1024 * 10
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan(`${blue("[LOGS]")} [:date[iso]] [:remote-addr] :method :status :url`));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/../public'));
app.set('views', path.join(__dirname, '/views'));
app.use(cors());

app.use((req, _res, next) => {
  req.app.locals.ws = websocket;
  next();
});

createWS(websocket);

function readDirectory(directory: string) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach(async (file) => {
    const filePath = path.join(directory, file.name)

    if (file.isDirectory()) readDirectory(filePath);
    else if (file.name.endsWith(process.argv[2] === "--dev" ? ".ts" : ".js")) {
      const routeName = file.name.split('.')[0];
      const dirName = directory.split(path.sep);
      const files = dirName.splice(dirName.findIndex(x => x === "routes") + 1);

      app.use(`/${routeName === "index" ? "" : routeName}`, await import(filePath).then(x => x.default));
      console.log(`${!existsSync("src/views" + files.join("/").replace(/\/\[(\w+)\]/g, (match, param) => `/:${param}`) + "/" + routeName + ".ejs") ? yellow("[SERVER]") : cyan("[SERVER]")} Route /${files.join("/").replace(/\/\[(\w+)\]/g, (match, param) => `/:${param}`)}${routeName === "index" ? "" : "/" + routeName} loaded`);
    }
  });
}

readDirectory(path.join(__dirname, 'routes'));

server.listen(process.env.PORT, () => console.log(`${green("[SERVER]")} Listening on port ${process.env.PORT}`));