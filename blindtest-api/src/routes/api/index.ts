import {Request, Response, Router} from 'express';

const router = Router();

router.get('/api', (req: Request, res: Response) => {
  res.status(200).send("Hey! Here is the API!")
});

export default router;
export const disabled = false;