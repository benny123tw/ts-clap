import Cli from '@/core/Cli'
import chalk from 'chalk'
import { Command } from '@/core/Command'
import { Option } from '@/core/Option'

export type Context = {
  command: string | null
  options: string[]
  subcommands: Context[]
}

export function parseCommandLine() {
  const parts = process.argv.slice(2)
  const commandStack: Context[] = []
  let currentContext: Context = {
    command: null,
    options: [],
    subcommands: [],
  }

  parts.forEach((part) => {
    if (!part.startsWith('-')) {
      if (currentContext.command === null) {
        if (!currentContext.options.length) {
          currentContext.command = part
          return
        }
      }

      // Non-option arguments are commands or subcommands
      const newContext = {
        command: part,
        options: [],
        subcommands: [],
      }
      currentContext.subcommands.push(newContext)
      commandStack.push(currentContext) // Push the current context onto the stack
      currentContext = newContext // Set the new context as the current one
    } else {
      // Option arguments are added to the current context's options
      currentContext.options.push(part)
    }
  })

  // Unwind the stack to build the final structure
  let finalContext = commandStack.length > 0 ? commandStack[0] : currentContext
  while (commandStack.length > 0) {
    const parentContext = commandStack.pop()
    if (!parentContext) {
      throw new Error('Something went wrong in parse function.')
    }

    if (commandStack.length > 0) {
      const lastContext = commandStack[commandStack.length - 1]
      lastContext.subcommands[lastContext.subcommands.length - 1] = parentContext
    } else {
      finalContext = parentContext
    }
  }

  return finalContext
}

export function executePrase(cli: Cli | Command, context: Context) {
  if (context.command) {
    const cmd = cli.commands.get(context.command)

    if (!cmd) {
      console.log(chalk.red('Cannot find the command:', context.command))
      console.log()
      cli.help()
      return
    }

    cmd.doAction(...context.options)

    if (context.subcommands.length) {
      executePrase(cmd, context.subcommands[0])
    }
  } else {
    if (context.options.length) {
      context.options.forEach((key) => {
        cli.options.get(Option.extractOption(key))?.doAction()
      })
    }
  }
}
