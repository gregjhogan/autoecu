import assert from 'assert'

export default {
  parse(data) {
    var idx = 0

    var indicatorBytes = data.slice(0,3).toString()
    idx += 3
  
    // only CAN flashing rwd files are supported
    if (indicatorBytes !== '\x5a\x0d\x0a') {
      return { supported: false }
    }
  
    var headers = []
    for(let i=0; i<6; i++) {
      // first byte is number of values
      var count = data[idx]
      idx += 1
  
      var header = []
      for (let j=0; j<count; j++) {
        // first byte is length of value
        var length = data[idx]
        idx += 1
  
        var v = data.slice(idx, idx+length)
        idx += length
  
        header.push(v)
      }
      headers.push(header)
    }
  
    var start = data.readUInt32BE(idx)
    idx += 4
  
    var size = data.readUInt32BE(idx)
    idx += 4
  
    var firmware = data.slice(idx, data.byteLength-4)
    idx += firmware.byteLength
  
    var checksum = data.readUInt32LE(idx)
    idx += 4
  
    assert(idx === data.byteLength, 'not at end of file after unpacking')
    assert(headers[3].length === headers[4].length, 'different number of versions and security access tokens')

    var versions = {}
    for (let i=0; i<headers[3].length; i++) {
      let version = headers[3][i].toString()
      versions[version] = Buffer.from(headers[4][i])
    }
    
    return {
      supported: true,
      canAddress: 0x18DA00F1 | (headers[2][0][0] << 8),
      compatibleVersions: versions,
      firmware: {
        start: start,
        size: size,
        data: firmware,
        decryptionKey: Buffer.from(headers[5][0])
      },
      checksum: checksum,
    }
  }
}