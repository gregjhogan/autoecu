import assert from 'assert'

import Panda from '@commaai/pandajs'
import { UdsClient, DATA_IDENTIFIER_TYPE, SESSION_TYPE, ACCESS_TYPE, ROUTINE_CONTROL_TYPE, ROUTINE_IDENTIFIER_TYPE } from './uds'
import { NegativeResponseError } from './uds'
import FileReaderAsync from './FileReaderAsync'
import rwd from './rwd'
import sleep from './sleep'

class EcuWorker {
  constructor() {
    console.log('initializing ...')
    this.panda = Panda()
    this.panda.onError(this._onError)

    this.client = new UdsClient(this.panda)
    this.rwd = undefined
    this.softwareVersion = undefined

    this._connectWebWorker = this._connectWebWorker.bind(this)
    this._onError = this._onError.bind(this)
    this._ping = this._ping.bind(this)
    this.setFirmwareFile = this.setFirmwareFile.bind(this)
    this.getFirmwareInfo = this.getFirmwareInfo.bind(this)
    this.connect = this.connect.bind(this)
    this.getApplicationSoftwareId = this.getApplicationSoftwareId.bind(this)
    this.getSecurityAccessSeed = this.getSecurityAccessSeed.bind(this)
    this.getSecurityAccessKey = this.getSecurityAccessKey.bind(this)
    this.flash = this.flash.bind(this)
  }

  async _connectWebWorker(serialNumber) {
    // TODO: pass in something that allows grabbing a specific device instead of the first device
    let devices = await navigator.usb.getDevices()
    for (let device of devices) {
      if (device.serialNumber === serialNumber) {
        this.panda.device.device = device
        await this.panda.device.device.open();
        await this.panda.device.device.selectConfiguration(1);
        await this.panda.device.device.claimInterface(0);
        // use SAFETY_ALLOUTPUT
        await this.panda.setSafetyMode(17)
        // use OBD port
        await this.panda.setObd(await this.panda.hasObd())
        await this.panda.unpause()
        return
      }
    }

    throw new Error(`failed to find device with serial number: ${serialNumber}`)
  }

  _onError(err) {
    console.error(err)
  }

  async _ping(raise) {
    console.log('tester present ...')
    try {
      await this.client.tester_present()
    } catch (e) {
      if (raise) {
        throw e
      }
      console.error(e)
    }
    this.pingHandle = setTimeout(this._ping, 1000)
  }

  async setFirmwareFile(file) {
    if (file) {
      console.log('parse rwd file ...')
      console.log(file.name)
      var data = await FileReaderAsync(file)
      this.rwd = rwd.parse(data)
    }
  }

  async getFirmwareInfo() {
    return {
      supported: this.rwd.supported,
      canAddress: this.rwd.canAddress,
      compatibleVersions: this.rwd.compatibleVersions
    }
  }

  async connect(serialNumber) {
    if (this.pingHandle) {
      console.log("stop pinging ...")
      clearTimeout(this.pingHandle)
      this.pingHandle = undefined
    }

    console.log('connecting ...')
    console.log(serialNumber)
    // can not use panda.start() because it calls requestDevice which is not supported from a Web Worker
    //await this.panda.start()
    await this._connectWebWorker(serialNumber)
    if (this.rwd && this.rwd.canAddress) {
      console.log(`0x${this.rwd.canAddress.toString(16)}`)
      var bus = await this.panda.hasObd() ? 1 : 0
      await this.client.init(this.rwd.canAddress, undefined, bus)
      await this._ping(true)
    }
    else {
      console.log('missing CAN address!')
    }

    return serialNumber
  }

  async getApplicationSoftwareId() {
    console.log('read data by id: application software id ...')
    var data = await this.client.read_data_by_identifier(DATA_IDENTIFIER_TYPE.APPLICATION_SOFTWARE_IDENTIFICATION)
    this.softwareVersion = data.toString()
    console.log(this.softwareVersion)
    return this.softwareVersion
  }

  async getSecurityAccessSeed() {
    while (true) {
      try {
        var seed = await this.client.security_access(ACCESS_TYPE.REQUEST_SEED)
        console.log(`-seed: 0x${seed.toString('hex')}`)
        return seed
      }
      catch (e) {
        if (e instanceof NegativeResponseError && e.error_code === 0x37) {
          console.log('-sleep ... (required time delay not expired)')
          await sleep(1000)
          continue
        }
        throw e
      }
    }
  }

  getSecurityAccessKey(seed) {
    if (!this.rwd || !this.rwd.compatibleVersions[this.softwareVersion]) {
      throw new Error(`failed to find security access algorithm keys for version: ${this.softwareVersion}`)
    }

    let s = seed.readUInt16BE(0)
    let keys = this.rwd.compatibleVersions[this.softwareVersion]
    let k1 = keys.readUInt16BE(0)
    let k2 = keys.readUInt16BE(2)
    let k3 = 0
    if (keys.byteLength == 6) {
      k3 = keys.readUInt16BE(4)
    }

    let sa_key = ((k3 !== 0 ? s * k2 % k3 : s * k2) ^ (s + k1)) & 0xFFFF
    console.log(`-key: 0x${sa_key.toString(16)}`)

    let buf = new Buffer(2)
    buf.writeUInt16BE(sa_key)
    return buf
  }

  async flash(postMessage) {
    console.log('session: extended diagnostic ...')
    postMessage({ command: 'flash-status', result: 'entering extended diagnostic session ...' })
    await this.client.diagnostic_session_control(SESSION_TYPE.EXTENDED_DIAGNOSTIC)

    console.log('security access: request seed ...')
    postMessage({ command: 'flash-status', result: 'send security access request ...' })
    let sa_seed = await this.getSecurityAccessSeed()

    console.log('security access: send key ...')
    postMessage({ command: 'flash-status', result: 'send security access response ...' })
    await this.client.security_access(ACCESS_TYPE.SEND_KEY, this.getSecurityAccessKey(sa_seed))

    console.log('session: programming ...')
    postMessage({ command: 'flash-status', result: 'entering programming session ...' })
    await this.client.diagnostic_session_control(SESSION_TYPE.PROGRAMMING)

    console.log('routine control: erase memory ...')
    postMessage({ command: 'flash-status', result: 'erase memory ...' })
    await this.client.routine_control(ROUTINE_CONTROL_TYPE.START, ROUTINE_IDENTIFIER_TYPE.ERASE_MEMORY)

    console.log('write data by id: set programming key ...')
    postMessage({ command: 'flash-status', result: 'set programming key ...' })
    await this.client.write_data_by_identifier(0xF101, this.rwd.firmware.decryptionKey)

    console.log('request download ...')
    postMessage({ command: 'flash-status', result: 'flash firmware ...' })    
    console.log(`-start addr: 0x${this.rwd.firmware.start.toString(16)}`)
    console.log(`-data length: 0x${this.rwd.firmware.size.toString(16)}`)
    var block_size = await this.client.request_download(this.rwd.firmware.start, this.rwd.firmware.size)
    console.log(`-block size: 0x${block_size.toString(16)}`)

    console.log('transfer data ...')
    postMessage({ command: 'flash-progress', result: 0 })
    // account for service id and block sequence count (one byte each)
    var chunk_size = block_size - 2
    var cnt = 0
    for (let i=0; i<this.rwd.firmware.data.byteLength; i += chunk_size) {
      cnt += 1
      let chunk = this.rwd.firmware.data.slice(i, i+chunk_size)
      console.log(`${cnt}: 0x${i.toString(16)} - 0x${(i+chunk_size).toString(16)}`)
      await this.client.transfer_data(cnt & 0xFF, chunk)
      // bitwise | converts float to int
      postMessage({ command: 'flash-progress', result: (i/this.rwd.firmware.data.byteLength*100) | 0 })
    }
    postMessage({ command: 'flash-progress', result: 100 })

    console.log('request transfer exit ...')
    await this.client.request_transfer_exit()

    console.log('routine control: check dependencies ...')
    postMessage({ command: 'flash-status', result: 'check dependencies ...' })
    await this.client.routine_control(ROUTINE_CONTROL_TYPE.START, ROUTINE_IDENTIFIER_TYPE.CHECK_PROGRAMMING_DEPENDENCIES)

    console.log('done!')
    postMessage({ command: 'flash-status', result: 'complete!' })
    return true
  }
}

// event handlers
self.addEventListener('message', _messageHandler) // eslint-disable-line no-restricted-globals

var ecuWorker = new EcuWorker()
async function _messageHandler(e) {
  if (!e) {
    return
  }

  if (!e.data || !e.data.command) {
    throw new Error('invalid message')
  }

  var result = undefined
  try {
    switch (e.data.command) {
      case 'set-firmware-file':
        await ecuWorker.setFirmwareFile(e.data.params)
        break
      case 'get-firmware-info':
        result = await ecuWorker.getFirmwareInfo()
        break
      case 'connect':
        result = await ecuWorker.connect(e.data.params)
        break
      case 'get-app-software-id':
        result = await ecuWorker.getApplicationSoftwareId()
        break
      case 'flash':
        result = await ecuWorker.flash(postMessage)
        break
      default:
        throw new Error('invalid command: ' + e.data.command)
    }

    if (result !== undefined) {
      postMessage({command: e.data.command, result: result})
    }
  }
  catch (error) {
    console.error(error)
    let cmd = e && e.data && e.data.command ? e.data.command : ''
    postMessage({ command: 'error', result: { cmd: cmd, message: error.toString() } })
  }
}
