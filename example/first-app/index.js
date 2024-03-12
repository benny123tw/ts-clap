import { Cli, Command } from 'ts-clap'

new Cli('Coolest App')
  .description('This is the coolest app ever!')
  .version('1.0.0')
  .command(
    new Command('hello', 'Say hello to the world!').action(() => console.log('Hello, World!')),
  ).exec()

new Cli('Test app Ok')
  .description('This is the coolest app ever!')
  .version('1.0.0')
  .command(new Command('hello', 'Say hello to the world!')
    .action(() => console.log('Hello, World!'))).exec()
