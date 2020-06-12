import fs from 'fs';
import getConfig from './utils/config';

const CONFIG = getConfig();
const standardFileName = CONFIG.DEFAULT_PATH.STANDARD_FILE_NAME_PREFIX;
const I18nDirPath = CONFIG.DEFAULT_PATH.I18N_DIR_PATH;
const I18nJsonDirPath = CONFIG.DEFAULT_PATH.EXPORT_DIR_PATH;
const kvReg = /const(.*?=.*?{(.|\n|\r\n|\r)*}(.|\n|\r\n|\r)*)export/i; // CRLF||LF
let filenameArray = readDirSync(I18nDirPath);
let changedKeys = [];
const backupFileAddress = CONFIG.DEFAULT_PATH.SNAPSHOT_PATH;
const standardFileAddress = `${I18nDirPath + standardFileName}.js`;

const EXPORT_UNTRANSLATED_ONLY = true; // only export the resources that haven't been translated

function compareJson(a, b) {
  const aProps = Object.getOwnPropertyNames(a);
  // didn't consider the situation about add or delete(aProps.length,bProps.length)
  const changedProp = [];

  for (let i = 0; i < aProps.length; i += 1) {
    const propName = aProps[i];
    if (a[propName] !== b[propName]) {
      changedProp.push(propName);// case: if changed to the same name carelessly
    }
  }

  return changedProp;
}

function copyFile(src, dist) {
  fs.writeFileSync(dist, fs.readFileSync(src));
}

function getStandardKeys(standardFileName) {
  const fileStr = fs.readFileSync(`${I18nDirPath + standardFileName}.js`, 'utf-8').toString();
  let result;
  let kv;
  let standardKeyArray;
  if ((result = kvReg.exec(fileStr)) != null) {
    eval(result[1]);
    standardKeyArray = Object.keys(kv);
  } else {
    console.error('Error: standard file error');
  }
  return standardKeyArray;
}

function checkDuplicatedValue(mJson) {
  const container = new Map();
  Object.keys(mJson).forEach((mJsonKey) => {
    const mJsonValue = mJson[mJsonKey];
    if (container.has(mJsonValue)) {
      container.set(mJsonValue, [...container.get(mJsonValue), mJsonKey]);
    } else {
      container.set(mJsonValue, [mJsonKey]);
    }
  });
  console.log('\n');
  container.forEach((containerValue) => {
    if (containerValue.length > 1) {
      containerValue.forEach((mJsonKey) => {
        console.log(`${mJsonKey}: ${mJson[mJsonKey]}`);
      });
      console.log('\n');
    }
  });
}

const exportLang = () => {
  // backup
  // if backup file exists
  if (fs.existsSync(backupFileAddress)) {
    const backupFileContent = fs.readFileSync(backupFileAddress).toString();
    const standardFileContent = fs.readFileSync(standardFileAddress).toString();
    let kv;
    let result;
    let backupKvValue;
    let standardKvValue;
    if ((result = kvReg.exec(backupFileContent)) != null) {
      eval(result[1]);
      backupKvValue = JSON.parse(JSON.stringify(kv));
    }
    if ((result = kvReg.exec(standardFileContent)) != null) {
      eval(result[1]);
      standardKvValue = JSON.parse(JSON.stringify(kv));
    }

    changedKeys = compareJson(standardKvValue, backupKvValue);
    // if standard file has not been changed
    if (changedKeys.length === 0
        && Object.keys(standardKvValue).length === Object.keys(backupKvValue).length) {
      console.log(`File: ${standardFileName}.js has not been changed.`);
    // if standard file has been changed
    } else {
      console.log(`File: ${standardFileName}.js has been changed!`);
      console.log('changed keys: ', JSON.stringify(changedKeys));
    }
    // if backupfile does not existed
  } else {
    copyFile(standardFileAddress, backupFileAddress);

    console.log('Backup file does not existed, backup file will be created.');
  }

  // generate dir
  fs.mkdir(I18nJsonDirPath, (error) => {
    if (error) {
      return false;
    }
    console.log('Generate i18nJson directory!');
  });

  const standardKeyArray = getStandardKeys(standardFileName);
  const keysUntranslated = new Set();
  filenameArray = filenameArray.filter((fileName) => fileName !== standardFileName)
    .concat(standardFileName);

  filenameArray.forEach((fileName) => {
    const fileStr = fs.readFileSync(`${I18nDirPath + fileName}.js`, 'utf-8').toString();
    let result;
    let kv;
    const kvEx = {};
    if ((result = kvReg.exec(fileStr)) != null) {
      eval(result[1]);
      standardKeyArray.map((kvItem) => {
        kvEx[kvItem] = {
          string: kv[kvItem] ? kv[kvItem] : '',
          context: '',
        };
      });
      if (fileName !== standardFileName) {
        if (changedKeys.length > 0) {
          changedKeys.map((keyName) => {
            kvEx[keyName].string = '';
            kvEx[keyName].context = '';
          });
        }
        if (EXPORT_UNTRANSLATED_ONLY) {
          standardKeyArray.map((kvItem) => {
            if (kvEx[kvItem].string) {
              delete kvEx[kvItem];
            } else {
              keysUntranslated.add(kvItem);
            }
          });
        }
      } else {
        checkDuplicatedValue(kv);
        if (EXPORT_UNTRANSLATED_ONLY) {
          standardKeyArray.map((kvItem) => {
            if (!keysUntranslated.has(kvItem)) {
              delete kvEx[kvItem];
            }
          });
        }
      }

      const str = JSON.stringify(kvEx, null, 4);
      fs.writeFileSync(`${I18nJsonDirPath + fileName}.json`, str);
      console.log(`${fileName} : ${Object.keys(kvEx).length} keys`);
    }
  });
};

function readDirSync(path) {
  const jsReg = /.js$/i;
  const pa = fs.readdirSync(path);
  const fileNameArray = [];
  let enusIndex = -1;
  pa.forEach((ele) => {
    const info = fs.statSync(`${path}/${ele}`);
    if (!info.isDirectory() && ele !== 'index.js' && jsReg.test(ele)) {
      fileNameArray.push(ele.replace(/.js$/i, ''));
    }
  });
  for (let i = 0; i < fileNameArray.length; i += 1) {
    if (fileNameArray[i] === standardFileName) {
      enusIndex = i;
    }
  }
  if (enusIndex !== -1) {
    fileNameArray.splice(enusIndex, 1);
    fileNameArray.splice(0, 0, standardFileName);
  } else {
    console.error(`No ${standardFileName}.js!`);
  }
  return fileNameArray;
}


export default exportLang;
