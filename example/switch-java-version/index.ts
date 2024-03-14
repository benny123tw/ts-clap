import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import { Arg, Cli, Command, Option } from 'ts-clap'

const cli = new Cli('switch-java-version')
  .description('This simple cli app is used to switch between different versions of Java.')
  .command('test', 'does testing thing')
  .command(
    new Command('current')
      .description('output the current version of Java')
      .action(() => {
        console.log(chalk.underline('Java Home'))
        console.log(process.env.JAVA_HOME)

        console.log(chalk.underline('Java Version'))
        console.log(path.basename(process.env.JAVA_HOME!))
      }).option(new Option('home', 'showing JAVA_HOME path')),
  )
  .command(
    new Command('list')
      .description('list all the available versions of Java')
      .action(() => { console.log('list is not implemented yet') })
      .subCommand(new Command('sub', 'subCommand test')
        .option(new Option('deep', 'more deep inside the subcommand').value('FILE'))
        .subCommand(new Command('subsub', 'subsubCommand test').option('test', 'test2'))),
  )
  .arg(new Arg('name').description('This is first description of the first arg'))
  .arg(new Arg('count').description('This is second description for second arg'))
  .option(
    new Option('config')
      .description('This config is used to set the path of the config file.')
      .value('FILE')
      .action((file) => {
        console.log('file', file)
      }),
  )
  .option(new Option('debug').description('This is option to set debug mode.'))
  .option(
    new Option('path').short('pts').description('Showing the current version of the cli app.'),
  )

cli.exec()
