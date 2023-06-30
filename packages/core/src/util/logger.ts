export enum LogLevel {
  None = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
}

type LogData = object | string | number | boolean

type LogDataFunction = () => LogData

export class Logger {
  private level: LogLevel
  private prefix: string

  constructor(initialLevel: LogLevel, prefix: string = "") {
    this.level = initialLevel
    this.prefix = prefix
  }

  setLevel(level: LogLevel) {
    this.level = level
  }

  context(prefix: string) {
    return new Logger(this.level, `${this.prefix} ${prefix}`)
  }

  error(msg: string, data?: LogData | LogDataFunction) {
    this.log(LogLevel.Error, msg, data)
  }

  warn(msg: string, data?: LogData | LogDataFunction) {
    this.log(LogLevel.Warn, msg, data)
  }

  info(msg: string, data?: LogData | LogDataFunction) {
    this.log(LogLevel.Info, msg, data)
  }

  debug(msg: string, data?: LogData | LogDataFunction) {
    this.log(LogLevel.Debug, msg, data)
  }

  private log(level: LogLevel, msg: string, data?: LogData | LogDataFunction) {
    if (this.level >= level) {
      let message = msg
      if (data) {
        const param = typeof data === "function" ? data() : data
        message +=
          " " +
          (typeof param === "string" ? param : JSON.stringify(param, null, 2))
      }
      console.log(
        `[${LogLevel[level].toLowerCase().substring(0, 1)}]${
          this.prefix ? ` ${this.prefix} |` : ""
        } ${message}`,
      )
    }
  }
}
