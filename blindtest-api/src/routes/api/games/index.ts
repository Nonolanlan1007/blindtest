import {Request, Response, Router} from 'express';
import { createGame } from '../../../utils/storage';

const router = Router();

router.post('/api/games', (req: Request, res: Response) => {
    function randomString(length: number) {
        var result = '';
        let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

    let code = randomString(6).toUpperCase();

    const game = createGame(code);

    if (!game) return res.status(500).send("Game already exists");

    res.status(200).send(game);
});

export default router;
export const disabled = false;