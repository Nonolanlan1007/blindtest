import {Request, Response, Router} from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.render("index")
});

export default router;
export const disabled = false;