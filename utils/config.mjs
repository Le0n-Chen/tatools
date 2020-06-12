import fs from 'fs';

const configFileName = 'tatoolsconfig.json';
const getConfig = () => {
  const fileStr = fs.readFileSync(configFileName).toString();
  return JSON.parse(fileStr);
};

export default getConfig;
