import {Request, Response, Router} from 'express';
import { getGame } from '../../../../utils/storage';

const router = Router();

router.get('/api/games/:id', (req: Request, res: Response) => {
  const {id} = req.params;

  const game = getGame(id);

  if (!game) return res.status(404).send("Game not found");
  
  res.status(200).send(game);
});

export default router;
export const disabled = false;