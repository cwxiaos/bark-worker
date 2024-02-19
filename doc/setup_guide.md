# Setup Guide

## Register Cloudflare Account

If you already have an account, goto [Create Worker](#create-worker)

Visit Cloudflare Website, Click Sign Up, Register an Account

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-26-05.png" width="500">
</p>

## Create Worker

After Sign Up or Login, Click `Workers & Pages` &rarr; `OverView` &rarr; `Create Worker`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-28-35.png" width="500">
</p>
<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-28-35.png" width="500">
</p>
<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-28-50.png" width="500">
</p>

Then Click `Deploy`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-29-05.png" width="500">
</p>

Then Click `Edit Code`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-29-29.png" width="500">
</p>

Copy Code From [main.js](../main.js) or [main_d1.js](../main_d1.js) and Paste It

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-30-20.png" width="500">
</p>

If it's First Deploy and Has no Device in Database, Modify `isAllowNewDevice` to `true` in order to allow Registeration

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-33-54.png" width="500">
</p>

Then Click `Save`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-30-29.png" width="500">
</p>

## Create Database

Click `Workers & Pages` &rarr; `D1` or `KV` &rarr; `Create`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-31-34.png" width="500">
</p>

Fill a name and Click `Save`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-31-49.png" width="500">
</p>

## Bind Database

Click `Workers & Pages` &rarr; `OverView` &rarr; `The Worker You Just Created`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-32-14.png" width="500">
</p>

Then Click `Settings` &rarr; `Variables` 

Click `D1 Database Bindings` or `KV Namesapce Bindings` Base on D1 or KV Version

Then Click `Edit Variables` &rarr; `Add Binding`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-32-14.png" width="500">
</p>

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-32-36.png" width="500">
</p>

Select the Namespace and Name it as `database`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-32-49.png" width="500">
</p>

Then Click `Save`

> [!CAUTION]
> The name MUST be `database`, Otherwise, Worker will throw exception

## Database Initialize

If you are using KV Version, goto [Register](#register)

After Modify `isAllowQueryNums` to `ture`, Send Request on path `/info`

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-34-28.png" width="500">
</p>

If you see Response includes `devices: 0`, the Deploy is Succeed

## Register

Now you can use Bark APP to add the Server, or you can use curl or browser to test the server

<p align="center">
    <img src="images/setup/Screenshot from 2024-02-19 08-35-13.png" width="500">
</p>