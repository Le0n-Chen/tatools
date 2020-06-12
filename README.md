# tatools
Export/Import translation
这个脚本用来方便的进行internationalization操作

# 资源JS的规范：

```
// i18n/zh-CN.js
const kv = {
  "test": "测试"
}
export {kv}；
```

# 待翻译/待引入的规范：

```
//i18nJSON/en_US.json
{
  "test": {
        "string": "test",
        "context": ""
    }
}
```

# tatools配置文件规范：

```
{
    "i18n": {
        "DEFAULT_PATH": {
            "I18N_DIR_PATH": "/Users/user/example/src/i18n/",
            "STANDARD_FILE_NAME_PREFIX": "en_US",
            "EXPORT_DIR_PATH": "/Users/user/example/i18nJson/",
            "IMPORT_DIR_PATH": "/Users/user/example/i18nJson/",
            "SNAPSHOT_PATH": "/Users/user/example/src/en_US_snapshot.js"
        }
    }
}
```
