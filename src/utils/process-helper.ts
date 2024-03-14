import process from 'node:process'
import type { Cli, Command } from '@/core'
import { CliComponent, Option } from '@/core'
import { logUnexpectedArgumentError, logUnrecognizedCommandError, printSimilarArg } from '@/utils/console-helper'
import { Logger } from '@/utils/Logger'

const logger = Logger.getInstance()

export interface OptionValue {
  name: string
  value: string | null
}

export interface ArgValue {
  name: string
  value: string
}

export interface Context {
  command: string | null
  subcommand: Context | null
  options: OptionValue[]
  args?: ArgValue[]
}

export function parseCommandLine(cli: Cli) {
  const registryArgs = Array.from(cli.args.keys())

  const parts = process.argv.slice(2)
  const commandStack: Context[] = []
  const rootContext: Context = createNewContext(true)
  let lastOption: string | null = null
  let currentContext: Context = rootContext
  let lastArgIndex: number = 0

  parts.forEach((part) => {
    const cliOrCmd: Cli | Command
      = (currentContext.command ? cli.commands.get(currentContext.command) : cli) || cli
    const option = cliOrCmd.options.find(o => o.validate(Option.extractOption(lastOption || '')))

    if (part.match(/^-/)) {
      lastOption = handleOption(cliOrCmd, part, currentContext)
      return
    }

    if (option && option.getValue() && lastOption) {
      handleOptionValue(part, currentContext)
      lastOption = null
      return
    }

    if (
      (!currentContext.command && cli.commands.get(part))
      || (currentContext.command && cli.commands.get(currentContext.command)?.commands.get(part))
    ) {
      currentContext = handleNewCommand(part, currentContext, commandStack)
      return
    }

    if (registryArgs.length && lastArgIndex < registryArgs.length) {
      lastArgIndex = handleArg(part, rootContext, registryArgs, lastArgIndex)
      return
    }

    const similar = CliComponent.findSimilarName(part, cli.commands)

    if (similar) {
      const errorLog = logUnrecognizedCommandError('subcommand', part)
      logger.append(errorLog)

      const similarLog = printSimilarArg('subcommand', similar.name)
      logger.append(similarLog)
    }
    else {
      const errorLog = logUnexpectedArgumentError('argument', part)
      logger.append(errorLog)
    }

    process.exit(1)
  })

  // Unwind the stack to build the final structure
  return unwindCommandStack(commandStack, rootContext)
}

function createNewContext(hasArgs: boolean = false): Context {
  return {
    command: null,
    subcommand: null,
    options: [],
    ...(hasArgs ? { args: [] } : {}),
  }
}

function handleOption(cli: Cli | Command, part: string, context: Context) {
  const option = cli.options.find(o => o.validate(Option.extractOption(part)))
  if (option) {
    context.options.push({ name: option.name, value: null })
    return part
  }

  const errorLog = logUnexpectedArgumentError('option', part)
  logger.append(errorLog)

  const similar = CliComponent.findSimilarName(part, cli.options)

  if (similar) {
    const similarLog = printSimilarArg('argument', `--${similar.name}`)
    logger.append(similarLog)
  }
  else {
    const tipsLog = Option.printTip(part)
    logger.append(tipsLog)
  }

  process.exit(1)
}

function handleOptionValue(part: string, context: Context) {
  const option = context.options.at(-1)
  if (option)
    option.value = part
}

function handleArg(
  part: string,
  rootContext: Context,
  registryArgs: string[],
  lastArgIndex: number,
) {
  rootContext.args?.push({ name: registryArgs[lastArgIndex], value: part })
  return lastArgIndex + 1
}

function handleNewCommand(part: string, currentContext: Context, commandStack: Context[]): Context {
  const newContext = createNewContext()
  newContext.command = part
  currentContext.subcommand = newContext
  commandStack.push(currentContext)
  return newContext
}

function unwindCommandStack(commandStack: Context[], currentContext: Context): Context {
  let finalContext = commandStack.length > 0 ? commandStack[0] : currentContext
  while (commandStack.length > 0) {
    const parentContext = commandStack.pop()
    if (!parentContext)
      throw new Error('Something went wrong in parse function.')

    if (commandStack.length > 0) {
      const lastContext = commandStack[commandStack.length - 1]
      lastContext.subcommand = parentContext
    }
    else {
      finalContext = parentContext
    }
  }
  return finalContext
}

export function executeParse(cli: Cli | Command, context: Context) {
  // If there's no command, we're at the root or an option context.
  if (!context.command) {
    executeOptions(cli, context)

    if (context.subcommand)
      executeParse(cli, context.subcommand)

    return
  }

  // Execute the command if it exists.
  const cmd = cli.commands.get(context.command)
  if (!cmd) {
    const errorLog = logUnexpectedArgumentError('command', context.command)
    logger.append(errorLog)

    process.exit(1)
  }

  cmd.execute(...context.options)

  // Recursively execute subcommands if they exist.
  if (context.subcommand)
    executeParse(cmd, context.subcommand)
}

function executeOptions(cli: Cli | Command, context: Context) {
  context.options.forEach(({ name, value }) => {
    const option = cli.options.get(Option.extractOption(name))
    option?.execute(value)
  })
}
