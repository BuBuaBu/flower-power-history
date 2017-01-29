const HEADER_SIZE = 0x10

function minmax(value, min, max) {
  return Math.max(Math.min(value, max), min)
}

function convertBatteryData (value) {
  return minmax(0.2865304553 * value + -177.3583506, 0, 100)
}

function convertTemperatureData (value) {
  return 0.0473711045 * value + -11.19891627
}

function convertMoistureData (value) {
  return minmax(0.179814297 * value + -40.76741498, 0, 100)
}

function convertLightData (value) {
  return 10981.31391 * Math.exp( 1 / value) + -10981.3812
}

class History {
  constructor(b64History, startupTime = 0) {
    const buf = Buffer.from(b64History, 'base64')
    const dv = new DataView(toArrayBuffer(buf))

    this.header = {
      '0x00': dv.getUint8(0x0),
      '0x01': dv.getUint8(0x1),
      nbEntries: dv.getUint16(0x2),
      lastIndexTime: dv.getUint32(0x4),
      firstIndex: dv.getUint16(0x8),
      lastIndex: dv.getUint16(0xa),
      sessionId: dv.getUint16(0xc),
      period: dv.getUint16(0xe)
    }

    this.entries = []
    for (let i = 0; i < this.header.nbEntries; i++) {
      const offset = HEADER_SIZE + (i*12)

      this.entries.push({
        date: startupTime + this.header.lastIndexTime - (this.header.lastIndex - i) * this.header.period * 1000,
        airTemp: dv.getUint16(offset + 0x0),
        light: dv.getUint16(offset + 0x2),
        soilEC: dv.getUint16(offset + 0x4),
        soilTemp: dv.getUint16(offset + 0x6),
        soilVWC: dv.getUint16(offset + 0x8),
        batteryLevel: dv.getUint16(offset + 0xa)
      })
    }
  }

  write(stream, convertFunctions = {}) {
    this.entries.forEach((entry) => {
      const cols = []
      cols.push(convert(convertFunctions.date, entry.date))
      cols.push(convert(convertFunctions.airTemp, entry.airTemp))
      cols.push(convert(convertFunctions.light, entry.light))
      cols.push(convert(convertFunctions.soilEC, entry.soilEC))
      cols.push(convert(convertFunctions.soilTemp, entry.soilTemp))
      cols.push(convert(convertFunctions.soilVWC, entry.soilVWC))
      cols.push(convert(convertFunctions.batteryLevel, entry.batteryLevel))
      stream.write(cols.join(','))
      stream.write('\n')
    })
  }

  writeRawCSV(stream) {
    stream.write('Date, Air temperature, Light, Soil EC, Soil temperature, Soil VWC, Battery level\n')
    this.write(stream)
  }

  writeCSV(stream) {
    stream.write('Date, Air temperature (°C), Light (mol/m²/d), Soil EC (?), Soil temperature (°C), Soil VWC (%), Battery level (%)\n')
    this.write(stream, {
      airTemp: convertTemperatureData,
      light: convertLightData,
      soilTemp: convertTemperatureData,
      soilVWC: convertMoistureData,
      batteryLevel: convertBatteryData
    })
  }
}

function convert(fn = (v) => v, value) {
  return fn(value)
}

function readHistory (b64History, startupTime) {
  return new History(b64History, startupTime)
}

function toArrayBuffer(buf) {
  const ab = new ArrayBuffer(buf.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

module.exports = readHistory
