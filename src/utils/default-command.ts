import { Collection } from '@discordjs/collection'
import { Cli, Command, Option } from '@/core'

function createHelpCommandOption<T extends new (...args: any[]) => Command | Option>(Type: T, { name = 'help', description = 'Print help' } = {}): InstanceType<T> {
  return new Type(name, description) as InstanceType<T>
}

function createVersionCommand({ name = 'version', short = 'V', description = 'Print the app version' } = {}) {
  return new Option(name, description).short(short)
}

export function createDefaultCommands(instance: Cli) {
  const collection = new Collection<string, Command>()
  const help = createHelpCommandOption(Command, { description: 'Print this message or the help of the given subcommand(s)' })
    .action(() => { instance.help() })

  collection.set('help', help)

  return collection
}

export function createDefaultOptions(instance: Cli | Command) {
  const help = createHelpCommandOption(Option)
    .action(() => { instance.help() })

  const collection = new Collection<string, Option>()
  collection.set('help', help)

  if (instance instanceof Cli) {
    const version = createVersionCommand()
      .action(() => { console.log(instance.getVersion()) })
    collection.set('version', version)
  }

  return collection
}
