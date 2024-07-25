import { arduino } from "../arduino";

export const sendCommand = async (command: string) => {
  if (arduino.isOpen) {
    arduino.write(command, (err) => {
      if (err) {
        return console.log("Error writing to port: ", err.message);
      }
      console.log(`Command sent: ${command}`);
    });
  } else {
    console.log("Serial port is not open.");
  }
};

module.exports = {
  sendCommand,
};
