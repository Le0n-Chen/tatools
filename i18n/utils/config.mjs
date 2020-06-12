import getConfigAll from '../../utils/config';

const getConfigI18N = () => {
  const config = getConfigAll().i18n;
  if (config.DEFAULT_PATH
    && config.DEFAULT_PATH.I18N_DIR_PATH
    && config.DEFAULT_PATH.EXPORT_DIR_PATH
    && config.DEFAULT_PATH.IMPORT_DIR_PATH
    && config.DEFAULT_PATH.SNAPSHOT_PATH
    && config.DEFAULT_PATH.STANDARD_FILE_NAME_PREFIX) {
    return config;
  }

  console.log('PLEASE complete tatoolsconfig.json');
};

export default getConfigI18N;
