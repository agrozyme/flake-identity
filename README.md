# Flake Identity

這是用 JavaScript (TypeScript) 實作的一個全局全時的發號器，可以產生一個長度為 39 Bytes 的字串。

該字串為 16 進位字串，其中包括 3 個連字號 (Dash: - )。

我參考了 [flake](https://www.npmjs.com/package/flake) 這個模組來改寫。

主要的差異在於:

* 自動取得可能的 MAC Address
* 參考各項目的最大可能值來調整各欄位的長度

# 字串格式

* Format: [timestamp]-[count]-[pid]-[mac]
* Bytes: 14 - 4 - 6 - 12
* Total: 14 + 4 + 6 + 12 + 3 = 39

# 用法

JavaScript
``` javascript
const flake = require('flake-identity').default;
const identity = flake.make();
```

TypeScript
``` javascript
import flake from 'flake-identity';
const identity = flake.make();
```
