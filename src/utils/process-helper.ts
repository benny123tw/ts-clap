import { Cli, Command, Option } from '@/core'
import { logUnexpectedValueError } from '@/utils/console-helper'

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
  let rootContext: Context = createNewContext(true)
  let lastOption: string | null = null
  let currentContext: Context = rootContext
  let lastArgIndex: number = 0

  parts.forEach((part, index) => {
    const cliOrCmd: Cli | Command =
      (currentContext.command ? cli.commands.get(currentContext.command) : cli) || cli
    const option = cliOrCmd.options.find((o) => o.validate(Option.extractOption(lastOption || '')))

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
      (!currentContext.command && cli.commands.get(part)) ||
      (currentContext.command && cli.commands.get(currentContext.command)?.commands.get(part))
    ) {
      currentContext = handleNewCommand(part, currentContext, commandStack)
      return
    }

    if (registryArgs.length) {
      lastArgIndex = handleArg(part, rootContext, registryArgs, lastArgIndex)
      return
    }

    logUnexpectedValueError('argument', part)
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
  const option = cli.options.find((o) => o.validate(Option.extractOption(part)))
  if (option) {
    context.options.push({ name: option.name, value: null })
    return part
  } else {
    logUnexpectedValueError('option', part)
    process.exit(1)
  }
}

function handleOptionValue(part: string, context: Context) {
  const option = context.options.at(-1)
  if (option) {
    option.value = part
  }
}

function handleArg(
  part: string,
  rootContext: Context,
  registryArgs: string[],
  lastArgIndex: number,
) {
  if (lastArgIndex < registryArgs.length) {
    rootContext.args?.push({ name: registryArgs[lastArgIndex], value: part })
    return lastArgIndex + 1
  } else {
    logUnexpectedValueError('argument', part)
    process.exit(1)
  }
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
    if (!parentContext) {
      throw new Error('Something went wrong in parse function.')
    }

    if (commandStack.length > 0) {
      const lastContext = commandStack[commandStack.length - 1]
      lastContext.subcommand = parentContext
    } else {
      finalContext = parentContext
    }
  }
  return finalContext
}

export function executeParse(cli: Cli | Command, context: Context) {
  // If there's no command, we're at the root or an option context.
  if (!context.command) {
    executeOptions(cli, context)
    if (context.subcommand) {
      executeParse(cli, context.subcommand)
    }
    return
  }

  // Execute the command if it exists.
  const cmd = cli.commands.get(context.command)
  if (!cmd) {
    logUnexpectedValueError('command', context.command)
    process.exit(1)
  }

  cmd.doAction(...context.options)

  // Recursively execute subcommands if they exist.
  if (context.subcommand) {
    executeParse(cmd, context.subcommand)
  }
}

function executeOptions(cli: Cli | Command, context: Context) {
  context.options.forEach(({ name, value }) => {
    const option = cli.options.get(Option.extractOption(name))
    option?.doAction(value)
  })
}
