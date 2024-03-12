# Tips

## 一个设备多个Key或Key别名

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