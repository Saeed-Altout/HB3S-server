import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { db } from "./lib/db";

const arduino = new SerialPort({
  path: "COM18",
  baudRate: 9600,
  autoOpen: false,
});

const parser = arduino.pipe(new ReadlineParser({ delimiter: "\r\n" }));

interface Point {
  value: number;
  sessionId: number;
}

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
        await db.point.create({
          data: {
            sessionId: session.id,
            value: glucoseValue,
          },
        });
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
