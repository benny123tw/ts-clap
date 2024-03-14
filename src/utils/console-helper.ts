import type { Collection } from '@discordjs/collection'
import chalk from 'chalk'
import type { CliComponent, Command, Option } from '@/core'
import { Arg, Cli } from '@/core'
import { LogType } from '@/utils/Logger'

interface Options {
  maxWidth: number
  paddingLeft: number
}

export function calculateMaxWidth(cli: Cli | Command) {
  const components: Collection<string, CliComponent>[] = [cli.commands, cli.options]
  return components
    .concat(cli instanceof Cli ? [cli.args] : [])
    .reduce(
      (max, collection) =>
        collection.reduce((innerMax, arg) => Math.max(innerMax, arg.toString().length), max),
      0,
    )
}

export function printWithDescription(
  args: Collection<string, CliComponent>,
  { maxWidth, paddingLeft }: Options,
) {
  args.forEach((arg) => {
    if (!arg.getDescription()) {
      console.log(arg.name)
      return
    }

    let argName = arg.name
    if (arg instanceof Arg)
      argName = `[${argName.toUpperCase()}]`

    const padding = ' '.repeat(maxWidth - argName.length)
    const padding_left = ' '.repeat(paddingLeft)
    console.log(`${padding_left}${argName}${padding}  ${arg.getDescription()}`)
  })
  console.log()
}

export function printOptionWithDescription(
  options: Collection<string, Option>,
  { maxWidth, paddingLeft }: Options,
) {
  const padding_left = ' '.repeat(paddingLeft)

  options.forEach((option) => {
    if (!option.getDescription()) {
      console.log(`${padding_left}${option.toString()}`)
      return
    }

    const padding = ' '.repeat(maxWidth - option.toString().length)
    console.log(`${padding_left}${option.toString()}${padding}  ${option.getDescription()}`)
  })
  console.log()
}

export function printHelperText(t: Command | Cli) {
  console.log(t.name)
  console.log(t.getDescription() ? chalk.italic(`${t.getDescription()}\n`) : '')

  const usageLog = t.getUsageLog()
  console.log(`${chalk.underline(`${usageLog.type}:`)} ${usageLog.message}`)
  console.log()

  const maxWidth = calculateMaxWidth(t)

  // commands
  if (t.commands.size) {
    console.log(chalk.underline('Commands'))
    printWithDescription(t.commands, { maxWidth, paddingLeft: 2 })
  }

  // arguments
  if (t instanceof Cli && t.args.size) {
    console.log(chalk.underline('Arguments'))
    printWithDescription(t.args, { maxWidth, paddingLeft: 2 })
  }

  // options
  if (t.options.size) {
    console.log(chalk.underline('Options'))
    printOptionWithDescription(t.options, { maxWidth, paddingLeft: 2 })
  }
}

export function printSimilarArg(type: string, similar: string) {
  const similarMessage = `a similar ${type} exists: '${chalk.green(similar)}'`

  return {
    type: LogType.Tips,
    message: similarMessage,
  }
}

export function printHelpMessage() {
  const helpMessage = 'For more information, try \'--help\'.'
  console.log(helpMessage)
}

export function logUnexpectedArgumentError(type: string, arg: string) {
  const unexpectedValueMessage = `unexpected ${type} '${chalk.yellow(arg)}' found`

  return {
    type: LogType.Error,
    message: unexpectedValueMessage,
  }
}

export function logUnrecognizedCommandError(type: string, command: string) {
  const unrecognizedCommandMessage = `unrecognized ${type} '${chalk.yellow(command)}'`

  return {
    type: LogType.Error,
    message: unrecognizedCommandMessage,
  }
}
