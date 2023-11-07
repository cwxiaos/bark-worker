## Setup

**这是一个bark-server的兼容实现, ~~一些特性还不可用~~!!! (目前基本测试OK,有Bug请提Issue)**

**我会尽量保持API和[[bark-server](https://github.com/Finb/bark-server)]一致**

### ~~一个域名~~ 只要可以被访问即可.

创建一个Worker和KV, 将KV绑定到Worker, 命名为'database'

<img src="doc/images/Screenshot from 2023-10-24 08-54-05.png">

<img src="doc/images/Screenshot from 2023-10-24 08-54-31.png">

绑定KV的入口在这里:

<img src="doc/images/Screenshot from 2023-10-25 22-05-51.png">

如果有禁止新设备注册的需求,修改这里:

<img src="doc/images/Screenshot from 2023-10-25 22-05-13.png">


## TODO

### !12月25日前暂停更新!
已知BUG

- ciphertext在V1 API下无法使用
- 在使用V2 API 情况下无法通过V1 API传key
- register逻辑优化
- ...

### ~~Cloudflare D1版本即将推出.~~

D1版本暂时不会出,由于Worker免费额度是100000/day,同时KV免费读取次数也是100000/day; D1数据库的一些Query存在比较复杂的情况,我还要研究一下;使用D1的情况下要么使用KV存authToken(意义不大),要么用D1存(需要额外建表同时还要考虑Duration),同时Worker的免费额度对于少量用户完全够用,D1版本对Cloudlfare付费用户才有意义(人数少也没意义),所以D1短时间内不会搞.

### 保持原生开发,如果包含三方库导出的代码比较长,不便于部署.

## 如果您认为此项目对您有帮助,请Star!
