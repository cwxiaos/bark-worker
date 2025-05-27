<p align="center">
    <h1 align="center">Bark-Worker</h1>
</p>

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

English | **[中文文档](README.zh.md)**

<!-- > [!CAUTION]
> There are bugs in Cloudflare Dashboard for now(2024-07-27), deploy and variables edit are not available, DONOT change anything before Cloudflare fix that. If you want to deploy, use wrangler. -->

<!-- > [!NOTE]
> Device token may change, the previous way to use multi-key or key alias may be unavailable, refer to [Tips](doc/tips.md) for more details. -->

> [!NOTE]
> Batch Push has the highest priority, if `device_keys` is specified and not empty, `device_key` will be ignored, in both V1 and V2 APIs.

<!-- > [!CAUTION]
> For D1 Alpha Users: On August 1, 2024, D1 alpha databases will stop accepting live SQL queries. See [Migration Guide](https://developers.cloudflare.com/d1/platform/alpha-migration/) -->

Bark-Worker is a [Bark-Server](https://github.com/Finb/bark-server) implenmention on Cloudflare Worker. It provides privacy-aware users with a cheap and private bark backend. 

### What is [Bark](https://github.com/Finb/Bark)?
[Bark](https://github.com/Finb/Bark) is an iOS App which allows you to push customed notifications to your iPhone.

> [!NOTE]
> A domain is required if worker.dev is unavailable in your country/region

## Features
- Full Bark-Server APIs support
    - `register`
    - `ping`
    - `healthz`
    - `info`
    - `push`
- Path based parameters resolve
- Easy to deploy, Cheap to use and Convenient to manage

## Setup

> [!NOTE]
> Select one, D1 or KV Version are both available. D1 Version is recommended for its higher usage than KV Version

<!-- > [!CAUTION]
> After Cloudflare D1 is not in Beta, KV Version maybe deprecated. -->

### Follow the instructions for D1 Version

> [!NOTE]
> The Cloudflare API Token must have D1 permission.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cwxiaos/bark-worker)

### Or manually deploy

Refer to [Setup Guide](doc/setup_guide.md)

#### Cloudflare D1 Version

Create a Worker and a D1 Database, bind D1 database to Worker with name `database`

#### Cloudflare KV Version

Create a Worker and a KV Storage, bind KV Storage to Worker with name `database`

## Tips

- Multi Device Key to one Device
- Device Key Alias
- D1 Database Manage in Console
- etc.

Refer to [Tips](doc/tips.md)
