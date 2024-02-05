# Bark Server On Cloudflare Worker

This is a Bark Server On Cloudflare Worker.

## What is Bark

<img src="https://wx3.sinaimg.cn/mw690/0060lm7Tly1g0nfnjjxbbj30sg0sg757.jpg" width=200px height=200px />

[Bark](https://github.com/Finb/Bark) is an iOS App which allows you to push customed notifications to your iPhone.

## Setup [[中文]](README_zh.md)

### An availiable domian.

For Cloudflare Worker users, Create a new worker with KV, bind your KV to the bark-worker as 'database'.

<img src="doc/images/Screenshot from 2023-10-24 08-54-05.png">

<img src="doc/images/Screenshot from 2023-10-24 08-54-31.png">


Here's where to bing KV:

<img src="doc/images/Screenshot from 2023-10-25 22-05-51.png">

If you want to block new registeration, modify code at here:

<img src="doc/images/Screenshot from 2023-10-25 22-05-13.png">

## If you think this project is helpful to you, please Star it.

