import fs from 'fs';
import getConfig from './utils/config';
import { IMPORT_MODE } from './constants/mode';

const CONFIG = getConfig();
const standardFileName = CONFIG.DEFAULT_PATH.STANDARD_FILE_NAME_PREFIX;
const I18nDirPath = CONFIG.DEFAULT_PATH.I18N_DIR_PATH;
const I18nJsonDirPath = CONFIG.DEFAULT_PATH.EXPORT_DIR_PATH;
const backupFileAddress = CONFIG.DEFAULT_PATH.SNAPSHOT_PATH;
const standardFileAddress = `${I18nDirPath + standardFileName}.js`;
const kvReg = /const(.*?=.*?{(.|\n|\r\n|\r)*}(.|\n|\r\n|\r)*)export/i; // CRLF||LF

function handleStr(langStr) {
  const str = `const kv = ${langStr};\nexport {kv};\n`;
  return str;
}

function copyFile(src, dist) {
  fs.writeFileSync(dist, fs.readFileSync(src));
}

function readDirSync(path) {
  const jsonReg = /.json$/i;
  const pa = fs.readdirSync(path);
  const fileNameArray = [];
  let enusIndex = -1;
  pa.forEach((ele) => {
    const info = fs.statSync(`${path}/${ele}`);
    if (!info.isDirectory() && ele !== 'index.js' && jsonReg.test(ele)) {
      fileNameArray.push(ele.replace(/.json$/i, ''));
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

const importLang = (mode) => {
  const selectedMode = mode;

  const fileNameArray = readDirSync(I18nJsonDirPath);
  fileNameArray.forEach((fileName) => {
    if (fileName === standardFileName) {
      return false;
    }
    const fileStr = fs.readFileSync(`${I18nJsonDirPath + fileName}.json`).toString();
    const langObj = JSON.parse(fileStr);
    const langObjEx = {};
    Object.keys(langObj).forEach((keyName) => {
      if (langObj[keyName].string.length === 0) {
        console.log(`language: ${fileName}, field: ${keyName} is Null`);
        return false;
      }
      langObjEx[keyName] = langObj[keyName].string;
    });

    if (selectedMode === IMPORT_MODE.GLOBAL) {
      const langStr = handleStr(JSON.stringify(langObjEx, null, 4));
      fs.writeFileSync(`${I18nDirPath + fileName}.js`, langStr, 'utf-8');
      console.log(`${fileName}: Success!`);
    } else if (selectedMode === IMPORT_MODE.INCREMENTAL) {
      const fileStr = fs.readFileSync(`${I18nDirPath + fileName}.js`, 'utf-8').toString();
      let result;
      // eslint-disable-next-line
      let kv = {};
      if ((result = kvReg.exec(fileStr)) != null) {
        console.log(result[1]);
        eval(result[1]);
        Object.keys(langObjEx).map((keyName) => {
          kv[keyName] = langObjEx[keyName];
        });
        const langStr = handleStr(JSON.stringify(kv, null, 4));
        fs.writeFileSync(`${I18nDirPath + fileName}.js`, langStr, 'utf-8');
        console.log(`${fileName}: Success!`);
      } else {
        console.error('Error! Wrong file format!');
      }
    }
  });

  copyFile(standardFileAddress, backupFileAddress);
};

export default importLang;
