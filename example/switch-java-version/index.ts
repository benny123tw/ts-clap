import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import { Cli } from '@/core/Cli'
import { Command } from '@/core/Command'
import { Arg } from '@/core/Arg'
import { Option } from '@/core/Option'

new Cli('My new app')
  .description('This is a description for my cli app.')
  .command('test', 'does testing thing')
  .command(
    new Command('current')
      .description('output the current version of Java')
      .setAction(() => {
        console.log(chalk.underline('Java Home'))
        console.log(process.env.JAVA_HOME)

        console.log(chalk.underline('Java Version'))
        console.log(path.basename(process.env.JAVA_HOME!))
      }),
  )
  .command(
    new Command('list').description('list all the available versions of Java').setAction(() => {}),
  )
  .arg(new Arg('name').description('This is first description of the first arg'))
  .arg(new Arg('count').description('This is second description for second arg'))
  .option(
    new Option('config')
      .description('This config is used to set the path of the config file.')
      .value('FILE')
      .setAction((file) => {
        console.log('file', file)
      }),
  )
  .option(new Option('debug').description('This is option to set debug mode.'))
  .option(
    new Option('path').short('pts').description('Showing the current version of the cli app.'),
  )
  .exec()
