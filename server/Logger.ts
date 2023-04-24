import log from 'npmlog';
import fs from 'fs';

class Logger {
  static targetFile = './JSON/logs.log';

  static info(message: string) {
    const date = this.getDate();
    log.info(date, message);
    this.writeFile(`info ${date} ${message}\n`);
  }

  static warn(message: string) {
    const date = this.getDate();
    log.warn(date, message);
    this.writeFile(`warn ${date} ${message}\n`);
  }

  static error(message: string) {
    const date = this.getDate();
    log.error(date, message);
    this.writeFile(`err ${date} ${message}\n`);
  }

  static writeFile(message: string) {
    fs.appendFileSync(this.targetFile, message);
  }

  static getDate(): string {
    return `[${new Date().toLocaleString('ru-RU')}]`;
  }
}

export default Logger;

// import winston, { format } from 'winston';

// class Logger {
//   public ERROR = 'error';
//   public WARN = 'warn';
//   public INFO = 'info';

//   private logger: winston.Logger;

//   constructor() {
//     this.logger = winston.createLogger({
//       level: 'info',
//       format: format.combine(
//         format.colorize(),
//         format.splat(),
//         format.simple(),
//         format.timestamp(),
//         format.prettyPrint(),    
//       ),
//       transports: [
//         new winston.transports.Console(),
//       ],
//     });
//   }

//   public log(level: string, message: string) {
//     this.logger.log(level, message);
//   }
// }

// export default Logger;