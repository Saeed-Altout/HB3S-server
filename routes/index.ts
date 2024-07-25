import express, { Request, Response } from "express";
import { sendCommand } from "../utils/send-command";
import { db } from "../lib/db";

const router = express.Router();

interface CreateSessionRequestBody {
  duration: number;
}

const stopSessionAfterDuration = async (
  sessionId: number,
  duration: number
): Promise<void> => {
  setTimeout(async () => {
    try {
      const points = await db.point.findMany({
        where: { sessionId: sessionId },
      });

      if (points.length > 0) {
        const totalGlucose = points.reduce(
          (sum, point) => sum + point.value,
          0
        );
        const averageGlucose = totalGlucose / points.length;

        await db.session.update({
          where: { id: sessionId },
          data: {
            stopTime: new Date(),
            glucose: +averageGlucose.toFixed(2),
          },
        });
      } else {
        await db.session.update({
          where: { id: sessionId },
          data: {
            stopTime: new Date(),
          },
        });
      }

      sendCommand("0");
    } catch (error) {
      console.error(
        `Error stopping session ${sessionId}:`,
        (error as Error).message
      );
    }
  }, duration * 1000);
};

router.post(
  "/api/session/create",
  async (req: Request<{}, {}, CreateSessionRequestBody>, res: Response) => {
    try {
      const { duration } = req.body;

      if (typeof duration !== "number" || duration <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Valid duration is required.",
          data: null,
          code: "400",
        });
      }

      const session = await db.session.create({
        data: {
          glucose: 0,
          duration: duration,
          createdAt: new Date(),
        },
      });

      sendCommand("1");
      stopSessionAfterDuration(session.id, duration);

      return res.json({
        status: "success",
        message: "Arduino started successfully.",
        data: session,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: (error as Error).message || "Error starting Arduino",
        data: null,
        code: "500",
      });
    }
  }
);

export { router };
