import process from 'node:process'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import chalk from 'chalk'
import { LogType } from '../src/utils/Logger'
import { Cli, Command, Option } from '@/core'
import { BaseArgument } from '@/core/BaseArgument'
import { logUnexpectedArgumentError, printSimilarArg } from '@/utils/console-helper'

const mockCli = new Cli('My new app')
  .description('This is a description for my cli app.')
  .command(
    new Command('hello', 'does testing thing')
      .action((...flags) => {
        const name = flags.find(flag => flag.name === 'name')?.value || 'World'
        console.log(`Hello, ${name}!`)
      })
      .option(new Option('name').description('Greet the user by name.').value('NAME')),
  )
  .option(
    new Option('config')
      .description('This config is used to set the path of the config file.')
      .value('FILE')
      .action((file) => {
        console.log(file)
      }),
  )

describe('parse command line', () => {
  const consoleMock = vi.spyOn(console, 'log').mockImplementation(() => undefined)

  beforeAll(() => {
    vi.spyOn(process, 'exit').mockImplementation(() => ({ exitCode: 0 } as never))
  })

  afterAll(() => {
    consoleMock.mockReset()
  })

  it('should parse the correct command', () => {
    process.argv = ['npx', 'ts-clap', 'hello']
    const parsed = mockCli.parse()
    expect(parsed).toStrictEqual({
      command: null,
      subcommand: { args: [], command: 'hello', subcommand: null, options: [] },
      options: [],
      args: [],
    })
  })

  it('should parse the correct options', () => {
    process.argv = ['npx', 'ts-clap', '--config', 'path/to/config', 'hello', '-n', 'John']
    const parsed = mockCli.parse()
    expect(parsed).toStrictEqual({
      command: null,
      subcommand: {
        args: [],
        command: 'hello',
        subcommand: null,
        options: [{ name: 'name', value: 'John' }],
      },
      options: [
        {
          name: 'config',
          value: 'path/to/config',
        },
      ],
      args: [],
    })
  })

  it('should print the helper text due to unexpected argument', () => {
    process.argv = ['npx', 'ts-clap', '--config', 'path/to/config', 'wrong-argument']
    const { type, message } = logUnexpectedArgumentError('argument', 'wrong-argument')
    expect(type).to.eq('error')
    expect(message).to.eq(`unexpected argument '${chalk.yellow('wrong-argument')}' found`)
  })

  it('should only print the helper text even the command is provided', () => {
    process.argv = ['npx', 'ts-clap', 'hello', '--name', 'John', '--help']

    mockCli.exec()

    expect(consoleMock).toHaveBeenCalledWith('hello')
    expect(consoleMock).toHaveBeenCalledWith(chalk.italic('does testing thing\n'))
    expect(consoleMock).toHaveBeenCalledWith(chalk.underline('Options'))
    expect(consoleMock).toHaveBeenCalledWith('  -h, --help         Print help')
    expect(consoleMock).toHaveBeenCalledWith('  -n, --name <NAME>  Greet the user by name.')
    expect(consoleMock).toHaveBeenCalledWith()
  })

  it('should greet the user by name', () => {
    process.argv = ['npx', 'ts-clap', 'hello', '--name', 'John']
    mockCli.exec()

    expect(consoleMock).toHaveBeenCalledWith('Hello, John!')
  })

  it('should find similar option', () => {
    process.argv = ['npx', 'ts-clap', 'hello', '--nam']
    const parentCommand = mockCli.commands.get('hello')
    expect(parentCommand).toBeDefined()

    const errorLog = logUnexpectedArgumentError('option', '--nam')

    expect(errorLog.type).to.eq(LogType.Error)
    expect(errorLog.message).to.eq(`unexpected option '${chalk.yellow('--nam')}' found`)

    const similar = BaseArgument.findSimilarName('--nam', parentCommand!.options)
    expect(similar).to.deep.equals(parentCommand!.options.get('name'))

    const similarLog = printSimilarArg('option', `--${similar?.name}`)
    expect(similarLog.type).to.eq(LogType.Tips)
    expect(similarLog.message).to.eq(`a similar option exists: '${chalk.green(`--${similar!.name}`)}'`)
  })
})
