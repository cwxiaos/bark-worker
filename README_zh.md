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

### Cloudflare D1版本即将推出.

## 如果您认为此项目对您有帮助,请Star!
