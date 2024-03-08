import chalk from 'chalk'
import Cli from '@/core/Cli'
import { CliComponent } from '@/core/CliComponent'
import { Option } from '@/core/Option'
import { Collection } from '@/utils/Collection'
import { Command } from '@/core/Command'

type Options = {
  maxWidth: number
  paddingLeft: number
}

export function calculateMaxWidth(cli: Cli | Command) {
  let components: Collection<string, CliComponent>[] = [cli.commands, cli.options]
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

    const padding = ' '.repeat(maxWidth - arg.name.length)
    const padding_left = ' '.repeat(paddingLeft)
    console.log(`${padding_left}${arg.name}${padding}  ${arg.getDescription()}`)
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
  console.log(t.desc ? chalk.italic(`${t.desc}\n`) : '')

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
