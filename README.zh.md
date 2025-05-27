<p align="center">
    <h1 align="center">Bark-Worker</h1>
</p>

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

**[English](README.md)** | 中文文档

<!-- > [!CAUTION]
> Cloudflare Dashboard 目前(2024-07-27)存在Bug, 部署和变量编辑不可用, 在Cloudflare修复该问题之前请勿进行任何操作, 如果需要部署请使用wrangler. -->

<!-- > [!NOTE]
> Device token可能发生变化, 之前使用多Key或Key别名的方法可能会失效, 如有多Key使用需要参考[Tips](doc/tips.zh.md). -->

> [!NOTE]
> 批量推送有最高优先级, 如果指定了`device_keys`且不为空, `device_key`将被忽略.

<!-- > [!CAUTION]
> 对于D1 Alpha用户： 在2024-08-01之后， D1 Alpha数据库将停止接受SQL查询，需要使用新的D1数据库，参考[迁移指南](https://developers.cloudflare.com/d1/platform/alpha-migration/) -->

Bark-Worker 是一个 [Bark-Server](https://github.com/Finb/bark-server) 在 Cloudflare Worker 上的实现. 为隐私敏感的用户提供一个低成本且保证隐私的服务端.

### 什么是 [Bark](https://github.com/Finb/Bark)?
[Bark](https://github.com/Finb/Bark) 是一个允许向iPhone发送通知的iOS APP.

> [!NOTE]
> 如果worker.dev域名在当前国家/地区不可用，则需要一个自己的域名

## 特性
- 支持所有的Bark-Server API
    - `register`
    - `ping`
    - `healthz`
    - `info`
    - `push`
- 基于路径的参数解析
- 便于部署, 低成本且方便管理

## 部署

> [!NOTE]
> 从D1版本和KV版本中选择一个. 更推荐D1版本, D1版本的额度更高.

<!-- > [!CAUTION]
> 当Cloudfalre D1不再Beta后, KV版本的Database部分可能停止维护. -->

### 直接部署D1版本

> [!NOTE]
> Cloudflare API Token必须有D1权限

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cwxiaos/bark-worker)

### 或手动部署

参考 [部署指南](doc/setup_guide.zh.md)

#### Cloudflare D1 版本

创建一个Worker和D1 数据库, 将D1 数据库绑定至Worker并命名为 `database`

#### Cloudflare KV 版本

创建一个Worker和KV 存储, 将KV 存储绑定至Worker并命名为 `database`

## Tips

- 一个设备使用多个Key
- 设备Key别名
- D1数据库Console管理
- etc.

参考 [Tips](doc/tips.zh.md)
