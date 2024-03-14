import chalk from 'chalk'

export enum LogType {
  Tips = 'tips',
  Error = 'error',
  Usage = 'Usage',
}

export interface Log { type: LogType, message: string }

const typeColorMapping: Record<LogType | string, (text: string) => string> = {
  [LogType.Tips]: chalk.green,
  [LogType.Error]: chalk.red,
  [LogType.Usage]: chalk.underline,
}

export class Logger {
  private static instance: Logger
  private logs: { type: LogType, message: string }[] = []

  private constructor() {}

  static getInstance() {
    if (!Logger.instance)
      Logger.instance = new Logger()

    return Logger.instance
  }

  append(log: { type: LogType, message: string }): void
  append(type: LogType, message: string): void
  append(typeOrLog: LogType | { type: LogType, message: string }, message?: string): void {
    if (typeOrLog instanceof Object) {
      this.logs.push(typeOrLog)
      return
    }

    if (message)
      this.logs.push({ type: typeOrLog as LogType, message: message || '' })
    else
      throw new Error('Empty message is not allowed.')
  }

  printLogs() {
    const maxTypeLength = this.calculateMaxTypeLength()
    const paddedLogs = this.getPaddedLogs(maxTypeLength)
    const isContainsError = this.logs.some(log => log.type === LogType.Error)

    paddedLogs.forEach(log => this.printLog(log))
    isContainsError && this.printHelpMessage()
  }

  private calculateMaxTypeLength() {
    return this.logs.reduce((currentMax, log) => Math.max(currentMax, log.type.length), 0)
  }

  private getPaddedLogs(maxTypeLength: number) {
    return this.logs.map(({ type, message }) => ({
      type,
      paddedType: type.padStart(maxTypeLength, ' '),
      message,
    }))
  }

  private printLog(log: { type: LogType, paddedType: string, message: string }) {
    const typeColor = typeColorMapping[log.type] || chalk.white
    const coloredType = typeColor(`${log.paddedType}:`)
    console.log(coloredType, log.message)
    // add a new line for the next log
    console.log()
  }

  private printHelpMessage() {
    const helpMessage = 'For more information, try \'--help\'.'
    console.log(helpMessage)
  }
}
