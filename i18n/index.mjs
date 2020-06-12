import program from 'commander';
import createDefaultStructure from './create';
import exportLang from './exportLang';
import importLang from './importLang';
import { IMPORT_MODE } from './constants/mode';

const importI18NPlugin = () => {
  const SECOND_COMMAND = {
    CREATE: 'create',
    EXPORT_LANG: 'export',
    IMPORT_LANG: 'import',
  };

  program
    .command('i18n <command>')
    .option('-g', '--global', 'Use global mode')
    .option('-i', '--incremental', 'Use incremental mode')
    .description('')
    .action((command, path) => {
      switch (command) {
        case (SECOND_COMMAND.CREATE):
          createDefaultStructure(path);
          break;
        case (SECOND_COMMAND.EXPORT_LANG):
          exportLang(program.exportPath);
          break;
        case (SECOND_COMMAND.IMPORT_LANG):
          let mode;
          if (program.incremental) {
            mode = IMPORT_MODE.INCREMENTAL;
          } else if (program.global) {
            mode = IMPORT_MODE.GLOBAL;
          } else {
            mode = IMPORT_MODE.INCREMENTAL; // default mode is INCREMENTAL
          }
          importLang(mode);
          break;
        default:
      }
    });


  program.parse(process.argv);
};

export default importI18NPlugin;
