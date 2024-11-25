# 部署指南

## 注册 Cloudflare 账户

如果已有 Cloudflare 账号, 跳转至 [创建Worker](#创建-worker)

访问 Cloudflare 网址, 点击 Sign Up, 注册一个账号

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-26-05.png">
</p>

## 创建 Worker

当注册或登陆后, 点击 `Workers & Pages` &rarr; `OverView` &rarr; `Create Worker`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-28-35.png">
</p>
<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-28-35.png">
</p>
<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-28-50.png">
</p>

点击 `Deploy`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-29-05.png">
</p>

点击 `Edit Code`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-29-29.png">
</p>

从 [main.js](../main.js) 或 [main_kv.js](../main_kv.js) 复制代码并粘贴

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-30-20.png">
</p>

如果是第一次部署且数据库中没有设备, 需要将 `isAllowNewDevice` 改为 `true` 以允许新设备注册

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-33-54.png">
</p>

点击 `Save`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-30-29.png">
</p>

## 创建数据库

点击 `Workers & Pages` &rarr; `D1` 或 `KV` &rarr; `Create`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-31-34.png">
</p>

选择一个名称并点击 `Save`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-31-49.png">
</p>

## 绑定数据库

点击 `Workers & Pages` &rarr; `OverView` &rarr; `刚才创建的Worker`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-32-14.png">
</p>

点击 `Settings` &rarr; `Variables` 

根据代码版本点击 `D1 Database Bindings` 或 `KV Namesapce Bindings`

点击 `Edit Variables` &rarr; `Add Binding`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-32-28.png">
</p>

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-32-36.png">
</p>

选择数据库并将其命名为 `database`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-32-49.png">
</p>

点击 `Save`

> [!CAUTION]
> 名称必须为 `database`, 否则Worker会报错

## 初始化数据库

如果使用KV版本, 跳转至 [注册](#注册)

把 `isAllowQueryNums` 修改为 `ture`, 使用 `/info` 发送请求

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-34-28.png">
</p>

当返回中包含 `devices: 0`, 说明部署成功

## 注册

至此, 可以使用 Bark APP 或 浏览器等工具测试服务器

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-35-13.png">
</p>