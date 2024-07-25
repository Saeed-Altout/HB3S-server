import express, { Request, Response } from "express";

const router = express.Router();

interface CreateSessionRequestBody {
  duration: number;
}

const stopSessionAfterDuration = async (
  sessionId: number,
  duration: number
): Promise<void> => {};

router.post(
  "/api/session/create",
  async (req: Request<{}, {}, CreateSessionRequestBody>, res: Response) => {}
);

export { router };
