# Tips

## 一个设备多个Key或Key别名

> [!NOTE]
> 设备token可能会随时间变化.如有多Key使用需求,直接在App中添加多次服务器即可.如果需要使用别名,先在App中添加一次服务器,在数据库中手动修改Key为别名,随后在App中使用重置Key功能指定Key别名.

在KV或D1数据库中, 按如下格式手动修改数据:

D1:
```
id  key                     token
1   short_key               00fc13adff785122b4ad28809a3420982341241421348097878e577c991de8f0
2   t8eb6ELE5ZzyVxhIe9icA8  00fc13adff785122b4ad28809a3420982341241421348097878e577c991de8f0
3   meSud8TZYBoyAi6cKuBNLi  00fc13adff785122b4ad28809a3420982341241421348097878e577c991de8f0
```

KV:
```
key                     value
short_key               00fc13adff785122b4ad28809a3420982341241421348097878e577c991de8f0
t8eb6ELE5ZzyVxhIe9icA8  00fc13adff785122b4ad28809a3420982341241421348097878e577c991de8f0
meSud8TZYBoyAi6cKuBNLi  00fc13adff785122b4ad28809a3420982341241421348097878e577c991de8f0
```

这样, 就可以使用自定义的Key向设备发送信息

## 自定义根路径

修改 `rootPath` 为需要的路径:

```diff
 // 根路径
-- const rootPath = '/'
++ const rootPath = '/custome-path/'
```

> [!NOTE]
> 注意 `rootPath` 的开头和结尾必须是 `/`,使用时 API 地址从 `https://SERVER_ADDRESS` 改为 `https://SERVER_ADDRESS/custome-path`,注意填在 Bark APP 中不要带最后的 `/`。

此功能可配合Cloudflare Routes实现防御.

<!-- <p align="center">
    <img src="images/tips/Screenshot from 2024-06-16 00-11-33.png" width="500">
</p> -->

## Basic Auth
按如下方式设置 `basicAuth`:
```
const basicAuth = 'username:password'
```

<p align="center">
    <img src="images/tips/Screenshot from 2024-09-18 18-13-07.png">
</p>

在发送请求时需要设置Header中的 `Authorization` 为 `Basic base64(username:password)`

## D1 数据库 Console 管理

### 清理测试或Deleted设备

清理所有测试设备

```
DELETE FROM devices WHERE token = '0000test0device0token0000';
```

清理所有deleted设备

```
DELETE FROM devices WHERE token = 'deleted';
```

### 设置AUTOINCREACE的值

将 desiered_value 替换为想要的值

```
UPDATE sqlite_sequence SET seq = desiered_value WHERE name = 'devices';
```

### 移动ID

将某一ID之后的ID向前移动

```
UPDATE devices SET id = id - desiered_distance WHERE id > desiered_index;
```

移动不连续的ID, 每次移动一个不连续ID

```
UPDATE devices
SET id = new_id
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY rowid) AS new_id
    FROM devices
) AS new_ids
WHERE devices.id = new_ids.id;
```

## D1 Worker 报错

初次部署时, 如果数据库为空, 由于db.exec()的延时, 可能导致Query空数据库, 此时访问能访问数据库的API直到数据库创建完成即可

```
curl https://SERVER_ADDRESS/info
```
