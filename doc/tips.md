# Tips

## Multi Device Key to One Device & Set Key Alias

In KV or D1 Database, Manually Set Records as follow:

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

So You Can use Both Keys to push message to your device.

## D1 Database Console Management

### Clear All Test or Deleted Token

Clear All Test Token

```
DELETE FROM devices WHERE token = '0000test0device0token0000';
```

Clear All Deleted Token

```
DELETE FROM devices WHERE token = 'deleted';
```

### Set Auto Increasement Sequence

Replace desiered_value with desiered value

```
UPDATE sqlite_sequence SET seq = desiered_value WHERE name = 'devices';
```

### Shift IDs

Shift IDs by distance

```
UPDATE devices SET id = id - desiered_distance WHERE id > desiered_index;
```

Shift IDs at where ID is Uncontinious

```
UPDATE devices
SET id = new_id
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY rowid) AS new_id
    FROM devices
) AS new_ids
WHERE devices.id = new_ids.id;
```

## D1 Worker Exception

On first deploy, D1 Version may throw Worker Exception, request API that can access Database can solve this.

```
curl https://SERVER_ADDRESS/info
```