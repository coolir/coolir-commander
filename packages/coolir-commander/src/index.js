import { prompt } from '@pyramation/prompt';
import { makeAutocompleteFunctionWithInput } from 'coolir-commander-utils';

export class Prompt {
  constructor(cmds) {
    this.cmds = cmds;
  }
  resolveAlias(cmd) {
    const aliases = Object.keys(this.cmds).reduce((m, v) => {
      m[v] = this.cmds[v].aliases;
      return m;
    }, {});
    Object.keys(aliases).forEach(aliasCmd => {
      if (
        aliases[aliasCmd] &&
        aliases[aliasCmd].length &&
        aliases[aliasCmd].includes(cmd)
      ) {
        cmd = aliasCmd;
      }
    });
    return cmd;
  }

  async getCommandName(argv) {
    const searchCmds = makeAutocompleteFunctionWithInput(
      Object.keys(this.cmds)
    );
    const cmdQuestion = [
      {
        _: true,
        type: 'autocomplete',
        name: 'cmd',
        message: 'what do you want to create?',
        source: searchCmds,
      },
    ];
    let { cmd } = await prompt(cmdQuestion, argv);
    if (!this.cmds.hasOwnProperty(cmd)) {
      cmd = this.resolveAlias(cmd);
      if (!this.cmds.hasOwnProperty(cmd)) {
        console.error(`${cmd} does not exist!`);
        return process.exit(0);
      }
    }

    return cmd;
  }

  async getFunction(argv) {
    const cmd = await this.getCommandName(argv);
    const questions = this.cmds[cmd].questions || [];
    const fn = this.cmds[cmd];
    return async () => {
      const results = await prompt(questions, argv);
      await fn(results);
    };
  }
}

export const cli = async cmds => {
  const argv = process.argv.slice(2);
  const prompter = new Prompt(cmds);
  const fn = await prompter.getFunction(argv);
  const result = await fn();
};
