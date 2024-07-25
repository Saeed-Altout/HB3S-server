import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { db } from "./lib/db";

const portPath: string | undefined = process.env.SERIALPORT_PATH;
const baudRate: number = Number(process.env.SERIALPORT_BAUD_RATE);

if (!portPath || isNaN(baudRate)) {
  throw new Error(
    "Serial port path or baud rate is not defined correctly in environment variables."
  );
}

const arduino = new SerialPort({
  path: portPath,
  baudRate: baudRate,
  autoOpen: false,
});

const parser = arduino.pipe(new ReadlineParser({ delimiter: "\r\n" }));

interface Point {
  value: number;
  sessionId: number;
}

let points: Point[] = [];

arduino.on("open", () => {
  console.log("Serial port opened");

  parser.on("data", async (data: any) => {
    console.log(data);

    const glucoseValue: number = parseFloat(
      data.split(":")[1].replace("mg/dL", "")
    );

    try {
      const session = await db.session.findFirst({
        orderBy: { id: "desc" },
      });

      if (session) {
        const point = await db.point.create({
          data: {
            value: glucoseValue,
            sessionId: session.id,
          },
        });
        points.push(point);
      }
    } catch (error) {
      console.error("Error handling data:", (error as Error).message);
    }
  });

  arduino.on("error", (err: Error) => {
    console.error("Error: ", err.message);
  });
});

arduino.open((err: Error | null) => {
  if (err) {
    console.error("Error opening port: ", err.message);
  }
});

export { arduino, parser };
