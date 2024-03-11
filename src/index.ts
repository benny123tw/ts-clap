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
      .setAction((...flags) => {
        if (flags.find(({ name }) => name === 'path')) {
          console.log('showing the path')
        }
      })
      .option(
        new Option('path').short('pts').description('Showing the current version of the cli app.'),
      ),
  )
  .command(new Command('list').description('list all the available versions of Java'))
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
