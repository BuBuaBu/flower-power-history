flower-power-history
=================

node.js lib for decoding [Parrot Flower Power](http://www.parrot.com/usa/products/flower-power/) history file.


Install
-------

```sh
$ npm install flower-power-history
```

Usage
-----

```javascript
const FlowerPowerHistory = require('flower-power-history')
const fs = require('fs')

const history = FlowerPowerHistory(b64History, startupTime)
const stream = fs.createWriteStream('history.csv')
stream.once('open', (fd) => {
  history.writeCSV(stream)
  stream.end()
})
```


File structure
--------------

* Header

Size: 0X10

| Index | Type           | Value             |
| ----- | -------------- | ----------------- |
| 0x0   | unsigned int16 | Unknown           |
| 0x2   | unsigned int16 | Nb entries        |
| 0x4   | unsigned int32 | Last entry time   |
| 0x8   | unsigned int16 | First entry index |
| 0xA   | unsigned int16 | Last entry index  |
| 0xC   | unsigned int16 | Session ID        |
| 0xE   | unsigned int16 | Period            |

* Entry

Size: 0xC

| Index | Type           | Value            |
| ----- | -------------- | ---------------- |
| 0x0   | unsigned int16 | Air temperature  |
| 0x2   | unsigned int16 | Light            |
| 0x4   | unsigned int16 | Soil EC          |
| 0x6   | unsigned int16 | Soil temperature |
| 0x8   | unsigned int16 | Soil VWC         |
| 0xA   | unsigned int16 | Battery level    |


Conversions
-----------
* Temperature:

`0.0473711045 * value + -11.19891627 => °C`

* Light:

`10981.31391 * exp ( 1 / value) + -10981.3812 => mol / m² / d`

* Soil VWC:

`0.179814297 * value + -40.76741498 => %`

* Battery level:

`0.2865304553 * value + -177.3583506 => %`

* Soil EC:

`TODO`

TODO
----

  * convert soil EC raw value to dS/m
