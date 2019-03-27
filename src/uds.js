import assert from 'assert'
import { packCAN } from 'can-message'
import sleep from './sleep'

export const SERVICE_TYPE = {
  DIAGNOSTIC_SESSION_CONTROL         : 0x10,
  ECU_RESET                          : 0x11,
  SECURITY_ACCESS                    : 0x27,
  COMMUNICATION_CONTROL              : 0x28,
  TESTER_PRESENT                     : 0x3E,
  ACCESS_TIMING_PARAMETER            : 0x83,
  SECURED_DATA_TRANSMISSION          : 0x84,
  CONTROL_DTC_SETTING                : 0x85,
  RESPONSE_ON_EVENT                  : 0x86,
  LINK_CONTROL                       : 0x87,
  READ_DATA_BY_IDENTIFIER            : 0x22,
  READ_MEMORY_BY_ADDRESS             : 0x23,
  READ_SCALING_DATA_BY_IDENTIFIER    : 0x24,
  READ_DATA_BY_PERIODIC_IDENTIFIER   : 0x2A,
  DYNAMICALLY_DEFINE_DATA_IDENTIFIER : 0x2C,
  WRITE_DATA_BY_IDENTIFIER           : 0x2E,
  WRITE_MEMORY_BY_ADDRESS            : 0x3D,
  CLEAR_DIAGNOSTIC_INFORMATION       : 0x14,
  READ_DTC_INFORMATION               : 0x19,
  INPUT_OUTPUT_CONTROL_BY_IDENTIFIER : 0x2F,
  ROUTINE_CONTROL                    : 0x31,
  REQUEST_DOWNLOAD                   : 0x34,
  REQUEST_UPLOAD                     : 0x35,
  TRANSFER_DATA                      : 0x36,
  REQUEST_TRANSFER_EXIT              : 0x37,
}

export const SESSION_TYPE = {
  DEFAULT : 1,
  PROGRAMMING : 2,
  EXTENDED_DIAGNOSTIC : 3,
  SAFETY_SYSTEM_DIAGNOSTIC : 4,
}

export const RESET_TYPE = {
  HARD : 1,
  KEY_OFF_ON : 2,
  SOFT : 3,
  ENABLE_RAPID_POWER_SHUTDOWN : 4,
  DISABLE_RAPID_POWER_SHUTDOWN : 5,
}

export const ACCESS_TYPE = {
  REQUEST_SEED : 1,
  SEND_KEY : 2,
}

export const CONTROL_TYPE = {
  ENABLE_RX_ENABLE_TX : 0,
  ENABLE_RX_DISABLE_TX : 1,
  DISABLE_RX_ENABLE_TX : 2,
  DISABLE_RX_DISABLE_TX : 3,
}

export const MESSAGE_TYPE = {
  NORMAL : 1,
  NETWORK_MANAGEMENT : 2,
  NORMAL_AND_NETWORK_MANAGEMENT : 3,
}

export const TIMING_PARAMETER_TYPE = {
  READ_EXTENDED_SET : 1,
  SET_TO_DEFAULT_VALUES : 2,
  READ_CURRENTLY_ACTIVE : 3,
  SET_TO_GIVEN_VALUES : 4,
}

export const DTC_SETTING_TYPE = {
  ON : 1,
  OFF : 2,
}

export const RESPONSE_EVENT_TYPE = {
  STOP_RESPONSE_ON_EVENT : 0,
  ON_DTC_STATUS_CHANGE : 1,
  ON_TIMER_INTERRUPT : 2,
  ON_CHANGE_OF_DATA_IDENTIFIER : 3,
  REPORT_ACTIVATED_EVENTS : 4,
  START_RESPONSE_ON_EVENT : 5,
  CLEAR_RESPONSE_ON_EVENT : 6,
  ON_COMPARISON_OF_VALUES : 7,
}

export const LINK_CONTROL_TYPE = {
  VERIFY_BAUDRATE_TRANSITION_WITH_FIXED_BAUDRATE : 1,
  VERIFY_BAUDRATE_TRANSITION_WITH_SPECIFIC_BAUDRATE : 2,
  TRANSITION_BAUDRATE : 3,
}

export const BAUD_RATE_TYPE = {
  PC9600 : 1,
  PC19200 : 2,
  PC38400 : 3,
  PC57600 : 4,
  PC115200 : 5,
  CAN125000 : 16,
  CAN250000 : 17,
  CAN500000 : 18,
  CAN1000000 : 19,
}

export const DATA_IDENTIFIER_TYPE = {
  BOOT_SOFTWARE_IDENTIFICATION : 0XF180,
  APPLICATION_SOFTWARE_IDENTIFICATION : 0XF181,
  APPLICATION_DATA_IDENTIFICATION : 0XF182,
  BOOT_SOFTWARE_FINGERPRINT : 0XF183,
  APPLICATION_SOFTWARE_FINGERPRINT : 0XF184,
  APPLICATION_DATA_FINGERPRINT : 0XF185,
  ACTIVE_DIAGNOSTIC_SESSION : 0XF186,
  VEHICLE_MANUFACTURER_SPARE_PART_NUMBER : 0XF187,
  VEHICLE_MANUFACTURER_ECU_SOFTWARE_NUMBER : 0XF188,
  VEHICLE_MANUFACTURER_ECU_SOFTWARE_VERSION_NUMBER : 0XF189,
  SYSTEM_SUPPLIER_IDENTIFIER : 0XF18A,
  ECU_MANUFACTURING_DATE : 0XF18B,
  ECU_SERIAL_NUMBER : 0XF18C,
  SUPPORTED_FUNCTIONAL_UNITS : 0XF18D,
  VEHICLE_MANUFACTURER_KIT_ASSEMBLY_PART_NUMBER : 0XF18E,
  VIN : 0XF190,
  VEHICLE_MANUFACTURER_ECU_HARDWARE_NUMBER : 0XF191,
  SYSTEM_SUPPLIER_ECU_HARDWARE_NUMBER : 0XF192,
  SYSTEM_SUPPLIER_ECU_HARDWARE_VERSION_NUMBER : 0XF193,
  SYSTEM_SUPPLIER_ECU_SOFTWARE_NUMBER : 0XF194,
  SYSTEM_SUPPLIER_ECU_SOFTWARE_VERSION_NUMBER : 0XF195,
  EXHAUST_REGULATION_OR_TYPE_APPROVAL_NUMBER : 0XF196,
  SYSTEM_NAME_OR_ENGINE_TYPE : 0XF197,
  REPAIR_SHOP_CODE_OR_TESTER_SERIAL_NUMBER : 0XF198,
  PROGRAMMING_DATE : 0XF199,
  CALIBRATION_REPAIR_SHOP_CODE_OR_CALIBRATION_EQUIPMENT_SERIAL_NUMBER : 0XF19A,
  CALIBRATION_DATE : 0XF19B,
  CALIBRATION_EQUIPMENT_SOFTWARE_NUMBER : 0XF19C,
  ECU_INSTALLATION_DATE : 0XF19D,
  ODX_FILE : 0XF19E,
  ENTITY : 0XF19F,
}

export const TRANSMISSION_MODE_TYPE = {
  SEND_AT_SLOW_RATE : 1,
  SEND_AT_MEDIUM_RATE : 2,
  SEND_AT_FAST_RATE : 3,
  STOP_SENDING : 4,
}

export const DYNAMIC_DEFINITION_TYPE = {
  DEFINE_BY_IDENTIFIER : 1,
  DEFINE_BY_MEMORY_ADDRESS : 2,
  CLEAR_DYNAMICALLY_DEFINED_DATA_IDENTIFIER : 3,
}

export const DTC_GROUP_TYPE = {
  EMISSIONS : 0x000000,
  ALL : 0xFFFFFF,
}

export const DTC_REPORT_TYPE = {
  NUMBER_OF_DTC_BY_STATUS_MASK : 0x01,
  DTC_BY_STATUS_MASK : 0x02,
  DTC_SNAPSHOT_IDENTIFICATION : 0x03,
  DTC_SNAPSHOT_RECORD_BY_DTC_NUMBER : 0x04,
  DTC_SNAPSHOT_RECORD_BY_RECORD_NUMBER : 0x05,
  DTC_EXTENDED_DATA_RECORD_BY_DTC_NUMBER : 0x06,
  NUMBER_OF_DTC_BY_SEVERITY_MASK_RECORD : 0x07,
  DTC_BY_SEVERITY_MASK_RECORD : 0x08,
  SEVERITY_INFORMATION_OF_DTC : 0x09,
  SUPPORTED_DTC : 0x0A,
  FIRST_TEST_FAILED_DTC : 0x0B,
  FIRST_CONFIRMED_DTC : 0x0C,
  MOST_RECENT_TEST_FAILED_DTC : 0x0D,
  MOST_RECENT_CONFIRMED_DTC : 0x0E,
  MIRROR_MEMORY_DTC_BY_STATUS_MASK : 0x0F,
  MIRROR_MEMORY_DTC_EXTENDED_DATA_RECORD_BY_DTC_NUMBER : 0x10,
  NUMBER_OF_MIRROR_MEMORY_DTC_BY_STATUS_MASK : 0x11,
  NUMBER_OF_EMISSIONS_RELATED_OBD_DTC_BY_STATUS_MASK : 0x12,
  EMISSIONS_RELATED_OBD_DTC_BY_STATUS_MASK : 0x13,
  DTC_FAULT_DETECTION_COUNTER : 0x14,
  DTC_WITH_PERMANENT_STATUS : 0x15,
}

export const DTC_STATUS_MASK_TYPE = {
  TEST_FAILED : 0x01,
  TEST_FAILED_THIS_OPERATION_CYCLE : 0x02,
  PENDING_DTC : 0x04,
  CONFIRMED_DTC : 0x08,
  TEST_NOT_COMPLETED_SINCE_LAST_CLEAR : 0x10,
  TEST_FAILED_SINCE_LAST_CLEAR : 0x20,
  TEST_NOT_COMPLETED_THIS_OPERATION_CYCLE : 0x40,
  WARNING_INDICATOR_REQUESTED : 0x80,
  ALL : 0xFF,
}

export const DTC_SEVERITY_MASK_TYPE = {
  MAINTENANCE_ONLY : 0x20,
  CHECK_AT_NEXT_HALT : 0x40,
  CHECK_IMMEDIATELY : 0x80,
  ALL : 0xE0,
}

export const CONTROL_OPTION_TYPE = {
  RETURN_CONTROL_TO_ECU : 0,
  RESET_TO_DEFAULT : 1,
  FREEZE_CURRENT_STATE : 2,
  SHORT_TERM_ADJUSTMENT : 3,
}

export const ROUTINE_CONTROL_TYPE = {
  START : 1,
  STOP : 2,
  REQUEST_RESULTS : 3,
}

export const ROUTINE_IDENTIFIER_TYPE = {
  ERASE_MEMORY : 0xFF00,
  CHECK_PROGRAMMING_DEPENDENCIES : 0xFF01,
  ERASE_MIRROR_MEMORY_DTCS : 0xFF02,
}

export class MessageTimeoutError extends Error {}

export class NegativeResponseError extends Error {
  constructor(message, service_id, error_code) {
    super(message)
    this.service_id = service_id
    this.error_code = error_code
  }
}

export class InvalidServiceIdError extends Error {}

export class InvalidSubFunctioneError extends Error {}

const NEGATIVE_RESPONSE_ID = 0x7F

const _negative_response_codes = {
    0x00: 'positive response',
    0x10: 'general reject',
    0x11: 'service not supported',
    0x12: 'sub-function not supported',
    0x13: 'incorrect message length or invalid format',
    0x14: 'response too long',
    0x21: 'busy repeat request',
    0x22: 'conditions not correct',
    0x24: 'request sequence error',
    0x25: 'no response from subnet component',
    0x26: 'failure prevents execution of requested action',
    0x31: 'request out of range',
    0x33: 'security access denied',
    0x35: 'invalid key',
    0x36: 'exceed number of attempts',
    0x37: 'required time delay not expired',
    0x70: 'upload download not accepted',
    0x71: 'transfer data suspended',
    0x72: 'general programming failure',
    0x73: 'wrong block sequence counter',
    0x78: 'request correctly received - response pending',
    0x7e: 'sub-function not supported in active session',
    0x7f: 'service not supported in active session',
    0x81: 'rpm too high',
    0x82: 'rpm too low',
    0x83: 'engine is running',
    0x84: 'engine is not running',
    0x85: 'engine run time too low',
    0x86: 'temperature too high',
    0x87: 'temperature too low',
    0x88: 'vehicle speed too high',
    0x89: 'vehicle speed too low',
    0x8a: 'throttle/pedal too high',
    0x8b: 'throttle/pedal too low',
    0x8c: 'transmission not in neutral',
    0x8d: 'transmission not in gear',
    0x8f: 'brake switch(es) not closed',
    0x90: 'shifter lever not in park',
    0x91: 'torque converter clutch locked',
    0x92: 'voltage too high',
    0x93: 'voltage too low',
}

export const lookup = (e, v) => {
  return e[Object.keys(e).find((x) => x === v)]
}

export class UdsClient {
  constructor(panda, timeout=10, debug=false) {
    this.panda = panda
    this.debug = debug
    this.timeout = timeout
    this.tx_queue = []
    this.rx_queue = []
    this.panda.onMessage(this._isotp_response)
  }
  
  init = async (tx_addr, rx_addr=undefined, bus=0) => {
    var id = Math.random()
    this.tx_queue.push(id)
    try {
      // wait your turn
      while (this.tx_queue[0] !== id) {
        await sleep(100)
      }

      this._reset_frame()

      this.bus = bus
      this.tx_addr = tx_addr
      if (rx_addr === undefined) {
        if (tx_addr < 0xFFF8) {
          this.rx_addr = tx_addr+8
        }
        else if (tx_addr > 0x10000000 && tx_addr < 0xFFFFFFFF) {
          this.rx_addr = (tx_addr & 0xFFFF0000) + ((tx_addr<<8) & 0xFF00) + ((tx_addr>>8) & 0xFF)
        }
        else {
          throw new Error(`invalid tx_addr: ${tx_addr}`)
        }
      }
  
      // TODO: fix the exception that this throws
      // TypeError: Cannot read property 'toString' of undefined
      try {
        await this.panda.setSafetyMode(0x1337)
      } catch {}
      
      // forgot to implement can clear in pandajs ?!?
      await this.panda.vendorWrite(`CAN clear: TX ${this.bus}`, {request: 0xF1, value: this.bus, index: 0});
      await this.panda.vendorWrite('CAN clear: RX', {request: 0xF1, value: 0xFFFF, index: 0});
    }
    finally {
      this.tx_queue.shift()
    }
  }

  _reset_frame = () => {
    this.rx_frame = {size: 0, data: "", idx: 0, done: true}
    this.tx_frame = {size: 0, data: "", idx: 0, done: true}
  }

  _can_send = async (data) => {
    var msg = packCAN({address: this.tx_addr, data: data, bus: this.bus})
    if (this.debug) console.log(`S: 0x${this.tx_addr.toString(16)} ${data.toString('hex')}`)
    // forgot to implement can send in pandajs ?!?
    await this.panda.device.device.transferOut(3, msg)
  }

  _isotp_request = async (data) => {
    assert(this.tx_frame.done === true, 'tx: concurrent messages not supported')
    assert(this.rx_frame.done === true, 'rx: concurrent messages not supported')

    this._reset_frame()
    this.tx_frame.data = data
    this.tx_frame.size = data.byteLength
    var msg = Buffer.alloc(8)

    if (this.tx_frame.size < 8) {
      // single frame
      this.tx_frame.done = true
      msg.writeUInt8(this.tx_frame.size, 0)
      this.tx_frame.data.copy(msg, 1)
      await this._can_send(msg)
    }
    else {
      // first frame
      this.tx_frame.done = false
      msg.writeUInt16BE(0x1000 | this.tx_frame.size)
      this.tx_frame.data.copy(msg, 2, 0, 6)
      await this._can_send(msg)
    }
  }

  _isotp_response = async (resp) => {
    for (var r of resp) {
      for (var msg of r.canMessages) {
        if (msg.bus !== this.bus || msg.address !== this.rx_addr || msg.data.byteLength === 0) {
          continue
        }

        if (this.debug) console.log(`R: 0x${msg.address.toString(16)} ${msg.data.toString('hex')}`)
        if (msg.data[0] >> 4 === 0x0) {
          // single this.rx_frame
          this.rx_frame.size = msg.data[0] & 0xFF
          this.rx_frame.data = msg.data.slice(1, this.rx_frame.size+1)
          this.rx_frame.idx = 0
          this.rx_frame.done = true
          this.rx_queue.unshift(this.rx_frame.data)
        }
        else if (msg.data[0] >> 4 === 0x1) {
          // first this.rx_frame
          this.rx_frame.size = ((msg.data[0] & 0x0F) << 8) + msg.data[1]
          this.rx_frame.data = Buffer.alloc(this.rx_frame.size)
          msg.data.copy(this.rx_frame.data, 0, 2)
          this.rx_frame.idx = 0
          this.rx_frame.done = false
          // send flow control message (send all bytes)
          await this._can_send(Buffer.from([0x30, 0x00, 0x00, 0, 0, 0, 0, 0]))
        }
        else if (msg.data[0] >> 4 === 0x2) {
          // consecutive rx frame
          assert(this.rx_frame.done === false, "rx: no active frame")
          // validate frame index
          this.rx_frame.idx += 1
          assert((this.rx_frame.idx & 0xF) === (msg.data[0] & 0xF), "rx: invalid consecutive frame index")
          let start = 6 + (this.rx_frame.idx-1) * 7
          let size = Math.min(this.rx_frame.size - start, 7)
          msg.data.copy(this.rx_frame.data, start, 1, 1+size)
          if (this.rx_frame.size === start + size) {
            this.rx_frame.done = true
            this.rx_queue.unshift(this.rx_frame.data)
          }
        }
        else if (msg.data[0] >> 4 === 0x3) {
          // flow control
          assert(this.tx_frame.done === false, "tx: no active frame")
          // TODO: support wait/overflow
          assert(msg.data[0] === 0x30, "tx: flow-control requires: continue")
          // scale is 1 milliseconds if first bit === 0, 100 micro seconds if first bit === 1
          let delay_ms = parseInt((msg.data[2] & 0x7F) / ((msg.data[2] & 0x80) === 0 ? 1 : 10.), 10)
          // first frame = 6 bytes, each consecutive frame = 7 bytes
          let start = 6 + this.tx_frame.idx * 7
          let count = msg.data[1]
          // count == 0 means send all remaining frames with no delay
          let end = count > 0 ? start + count * 7 : this.tx_frame.size
          for (let i=start; i<end; i+=7) {
            this.tx_frame.idx += 1
            // consecutive tx frames
            let msg = Buffer.alloc(8)
            msg.writeUInt8(0x20 | (this.tx_frame.idx & 0xF))
            this.tx_frame.data.copy(msg, 1, i, i+7)
            await this._can_send(msg)
            if (delay_ms > 0) {
              await sleep(delay_ms)
            }
          }
          if (end >= this.tx_frame.size) {
            this.tx_frame.done = true
          }
        }
      }
    }
  }

  // generic uds request
  _uds_request = async (service_type, subfunction=undefined, data=undefined) => {
    var id = Math.random()
    this.tx_queue.push(id)
    try {
      // wait your turn
      while (this.tx_queue[0] !== id) {
        await sleep(100)
      }

      var req = Buffer.alloc(1+(subfunction !== undefined ? 1 : 0)+(data !== undefined ? data.byteLength : 0))
      req.writeUInt8(service_type)
      if (subfunction !== undefined) {
        req.writeUInt8(subfunction, 1)
      }
      if (data !== undefined) {
        data.copy(req, subfunction === undefined ? 1 : 2)
      }
      await this._isotp_request(req)

      var resp = undefined
      while (true) {
        // timeout after this.timeout seconds
        for (var i = 0; i < this.timeout*100; i++) {
          resp = this.rx_queue.pop()
          if (resp !== undefined) {
            break
          }
          await sleep(10)
        }
            
        if (resp === undefined) {
          throw new MessageTimeoutError("timeout waiting for response")
        }

        var resp_sid = resp.length > 0 ? resp[0] : undefined
        // negative response
        if (resp_sid === NEGATIVE_RESPONSE_ID) {
          var service_id = resp.length > 1 ? resp[1] : -1
          // eslint-disable-next-line
          var service_desc = Object.keys(SERVICE_TYPE).find((k) => SERVICE_TYPE[k] === service_id)
          if (service_desc === undefined) {
            service_desc = 'NON_STANDARD_SERVICE'
          }
          var error_code = resp.length > 2 ? resp[2] : -1
          var error_desc = _negative_response_codes[error_code]
          if (error_desc === undefined) {
            error_desc = 'unknown error'
          }
          // wait for another message if response pending
          if (error_code === 0x78) {
            sleep(100)
            continue
          }
          throw new NegativeResponseError(`${service_desc} - ${error_desc}`, service_id, error_code)
        }

        break
      }

      // positive response
      if (service_type+0x40 !== resp_sid) {
        var resp_sid_hex = resp_sid !== undefined ? resp_sid.toString(16) : undefined
        throw new InvalidServiceIdError(`invalid response service id: ${resp_sid_hex}`)
      }

      if (subfunction !== undefined) {
        var resp_sfn = resp.length > 1 ? resp[1] : undefined
        if (subfunction !== resp_sfn) {
          var resp_sfn_hex = resp_sfn !== undefined ? resp_sfn.toString(16) : undefined
          throw new InvalidSubFunctioneError(`invalid response subfunction: 0x${resp_sfn_hex}`)
        }
      }

      // return data (exclude service id and sub-function id)
      return resp.slice(subfunction === undefined ? 1 : 2)
    }
    finally {
      this.tx_queue.shift()
    }
 }

  // services
  diagnostic_session_control = async (session_type) => {
    await this._uds_request(SERVICE_TYPE.DIAGNOSTIC_SESSION_CONTROL, session_type)
  }

  ecu_reset = async (reset_type) => {
    var resp = await this._uds_request(SERVICE_TYPE.ECU_RESET, reset_type)
    if (reset_type === RESET_TYPE.ENABLE_RAPID_POWER_SHUTDOWN) {
      var power_down_time = resp[0]
      return power_down_time
    }
  }

  security_access = async (access_type, security_key=undefined) => {
    var request_seed = access_type % 2 !== 0
    if (request_seed && security_key !== undefined) {
      throw new Error('security_key not allowed')
    }
    if (!request_seed && security_key === undefined) {
      throw new Error('security_key is missing')
    }

    var resp = await this._uds_request(SERVICE_TYPE.SECURITY_ACCESS, access_type, security_key)
    if (request_seed) {
      var security_seed = resp
      return security_seed
    }
  }

  communication_control = async (control_type, message_type) => {
    await this._uds_request(SERVICE_TYPE.COMMUNICATION_CONTROL, control_type, Buffer.from([message_type]))
  }

  tester_present = async () => {
    await this._uds_request(SERVICE_TYPE.TESTER_PRESENT, 0x00)
  }

  access_timing_parameter = async (timing_parameter_type, parameter_values) => {
    var write_custom_values = timing_parameter_type === TIMING_PARAMETER_TYPE.SET_TO_GIVEN_VALUES
    var read_values = (
      timing_parameter_type === TIMING_PARAMETER_TYPE.READ_CURRENTLY_ACTIVE ||
      timing_parameter_type === TIMING_PARAMETER_TYPE.READ_EXTENDED_SET
    )
    if (!write_custom_values && parameter_values !== undefined) {
      throw new Error('parameter_values not allowed')
    }
    if (write_custom_values && parameter_values !== undefined) {
      throw new Error('parameter_values is missing')
    }
    var resp = await this._uds_request(SERVICE_TYPE.ACCESS_TIMING_PARAMETER, timing_parameter_type, parameter_values)
    if (read_values) {
      // TODO: parse response into values?
      var parameter_values_read = resp
      return parameter_values_read
    }
  }
  secured_data_transmission = async (data) => {
    // TODO: split data into multiple input parameters?
    var resp = await this._uds_request(SERVICE_TYPE.SECURED_DATA_TRANSMISSION, undefined, data)
    // TODO: parse response into multiple output values?
    return resp
  }

  control_dtc_setting = async (dtc_setting_type) => {
    await this._uds_request(SERVICE_TYPE.CONTROL_DTC_SETTING, dtc_setting_type)
  }

  response_on_event = async (response_event_type, store_event, window_time, event_type_record, service_response_record) => {
    if (store_event) {
      response_event_type |= 0x20
    }
    // TODO: split record parameters into arrays
    var data = Buffer.concat([Buffer.from([window_time]), event_type_record, service_response_record])
    var resp = await this._uds_request(SERVICE_TYPE.RESPONSE_ON_EVENT, response_event_type, data)

    if (response_event_type === RESPONSE_EVENT_TYPE.REPORT_ACTIVATED_EVENTS) {
      return {
        "num_of_activated_events": resp[0],
        "data": resp.slice(1), // TODO: parse the reset of response
      }
    }

    return {
      num_of_identified_events: resp[0],
      event_window_time: resp[1],
      data: resp.slice(2), // TODO: parse the reset of response
    }
  }

  link_control = async (link_control_type, baud_rate_type=undefined) => {
    var data = undefined
    if (link_control_type === LINK_CONTROL_TYPE.VERIFY_BAUDRATE_TRANSITION_WITH_FIXED_BAUDRATE) {
      // baud_rate_type = BAUD_RATE_TYPE
      data = Buffer.from([baud_rate_type])
    }
    else if (link_control_type === LINK_CONTROL_TYPE.VERIFY_BAUDRATE_TRANSITION_WITH_SPECIFIC_BAUDRATE) {
      // baud_rate_type = custom value (3 bytes big-endian)
      data = Buffer.from([(baud_rate_type >> 16) & 0xFF, (baud_rate_type >> 8) & 0xFF, baud_rate_type & 0xFF])
    }
    await this._uds_request(SERVICE_TYPE.LINK_CONTROL, link_control_type, data)
  }

  read_data_by_identifier = async (data_identifier_type) => {
    // TODO: support list of identifiers
    var data = Buffer.alloc(2)
    data.writeUInt16BE(data_identifier_type)
    var resp = await this._uds_request(SERVICE_TYPE.READ_DATA_BY_IDENTIFIER, undefined, data)
    var resp_id = resp.byteLength >= 2 ? resp.readUInt16BE(0) : undefined
    if (resp_id !== data_identifier_type) {
      var resp_id_hex = resp_id !== undefined ? resp_id.toString(16) : undefined
      throw new Error(`invalid response data identifier: 0x${resp_id_hex}`)
    }
    return resp.slice(2)
  }

  read_memory_by_address = async (memory_address, memory_size, memory_address_bytes=4, memory_size_bytes=1) => {
    if (memory_address_bytes < 1 || memory_address_bytes > 4) {
      throw new Error(`invalid memory_address_bytes: ${memory_address_bytes}`)
    }
    if (memory_size_bytes < 1 || memory_size_bytes > 4) {
      throw new Error(`invalid memory_size_bytes: ${memory_size_bytes}`)
    }
    var data = Buffer.alloc(1 + memory_address_bytes + memory_size_bytes)
    data.writeUInt8((memory_size_bytes<<4) | memory_address_bytes, 0)

    if (memory_address >= Math.pow(2, memory_address_bytes*8)) {
      throw new Error(`invalid memory_address: ${memory_address}`)
    }
    for (let i=0; i<memory_address_bytes; i++) {
      let b = (memory_address>>((memory_address_bytes-i-1)*8)) & 0xFF
      data.writeUInt8(b, 1+i)
    }

    if (memory_size >= Math.pow(2, memory_size_bytes*8)) {
      throw new Error(`invalid memory_size: ${memory_size}`)
    }
    for (let i=0; i<memory_size_bytes; i++) {
      let b = (memory_size>>((memory_size_bytes-i-1)*8)) & 0xFF
      data.writeUInt8(b, 1+memory_address_bytes+i)
    }

    var resp = await this._uds_request(SERVICE_TYPE.READ_MEMORY_BY_ADDRESS, undefined, data)
    return resp
  }

  read_scaling_data_by_identifier = async (data_identifier_type) => {
    var data = Buffer.alloc(2)
    data.writeInt16BE(data_identifier_type)
    var resp = await this._uds_request(SERVICE_TYPE.READ_SCALING_DATA_BY_IDENTIFIER, undefined, data)
    var resp_id = resp.byteLength >= 2 ? resp.readUInt16BE(0) : undefined
    if (resp_id !== data_identifier_type) {
      throw new Error(`invalid response data identifier: 0x${resp_id.toString(16)}`)
    }
    return resp.slice(2) // TODO: parse the response
  }

  read_data_by_periodic_identifier = async (transmission_mode_type, periodic_data_identifier) => {
    // TODO: support list of identifiers
    var data = Buffer.from([transmission_mode_type, periodic_data_identifier])
    await this._uds_request(SERVICE_TYPE.READ_DATA_BY_PERIODIC_IDENTIFIER, undefined, data)
  }

  dynamically_define_data_identifier = async (dynamic_definition_type, dynamic_data_identifier, source_definitions, memory_address_bytes=4, memory_size_bytes=1) => {
    if (memory_address_bytes < 1 || memory_address_bytes > 4) {
      throw new Error(`invalid memory_address_bytes: ${memory_address_bytes}`)
    }
    if (memory_size_bytes < 1 || memory_size_bytes > 4) {
      throw new Error(`invalid memory_size_bytes: ${memory_size_bytes}`)
    }

    var data = Buffer.from([])
    if (dynamic_definition_type === DYNAMIC_DEFINITION_TYPE.DEFINE_BY_IDENTIFIER) {
      data = Buffer.alloc(2+(source_definitions.length*4))
      data.writeUInt16BE(dynamic_data_identifier, 0)
      for (let i=0; i<source_definitions.length; i++) {
        let s = source_definitions[i]
        data.writeUInt16BE(s.data_identifier, 2+(i*4))
        data.writeUInt16BE(s.position, 4+(i*4))
        data.writeUInt16BE(s.memory_size, 5+(i*4))
      }
    }
    else if (dynamic_definition_type === DYNAMIC_DEFINITION_TYPE.DEFINE_BY_MEMORY_ADDRESS) {
      var item_size = memory_address_bytes + memory_size_bytes
      data = Buffer.alloc(3+(item_size*source_definitions.length))
      data.writeUInt16BE(dynamic_data_identifier, 0)
      data.writeUInt8((memory_size_bytes<<4) | memory_address_bytes, 1)
      for (let i=0; i<source_definitions.length; i++) {
        let s = source_definitions[i]
        let start_idx = 3 + item_size * 3
        if (s.memory_address >= Math.pow(2, memory_address_bytes*8)) {
          throw new Error(`invalid memory_address: ${s.memory_address}`)
        }
        for (let i=0; i<memory_address_bytes; i++) {
          let b = (s.memory_address>>((memory_address_bytes-i-1)*8)) & 0xFF
          data.writeUInt8(b, start_idx+i)
        }
    
        if (s.memory_size >= Math.pow(2, memory_size_bytes*8)) {
          throw new Error(`invalid memory_size: ${s.memory_size}`)
        }
        for (let i=0; i<memory_size_bytes; i++) {
          let b = (s.memory_size>>((memory_size_bytes-i-1)*8)) & 0xFF
          data.writeUInt8(b, start_idx+memory_address_bytes+i)
        }
      }
    }
    else if (dynamic_definition_type === DYNAMIC_DEFINITION_TYPE.CLEAR_DYNAMICALLY_DEFINED_DATA_IDENTIFIER) {
    }
    else {
      throw new Error(`invalid dynamic identifier type: ${dynamic_definition_type.toString(16)}`)
    }
    await this._uds_request(SERVICE_TYPE.DYNAMICALLY_DEFINE_DATA_IDENTIFIER, dynamic_definition_type, data)
  }

  write_data_by_identifier = async (data_identifier_type, data_record) => {
    var data = Buffer.alloc(2+data_record.byteLength)
    data.writeUInt16BE(data_identifier_type, 0)
    data_record.copy(data, 2)
    var resp = await this._uds_request(SERVICE_TYPE.WRITE_DATA_BY_IDENTIFIER, undefined, data)
    var resp_id = resp.byteLength >= 2 ? resp.readUInt16BE(0) : undefined
    if (resp_id !== data_identifier_type) {
      throw new Error(`invalid response data identifier: 0x${resp_id.toString(16)}`)
    }
  }

  write_memory_by_address = async (memory_address, memory_size, data_record, memory_address_bytes=4, memory_size_bytes=1) => {
    if (memory_address_bytes < 1 || memory_address_bytes > 4) {
      throw new Error(`invalid memory_address_bytes: ${memory_address_bytes}`)
    }
    if (memory_size_bytes < 1 || memory_size_bytes > 4) {
      throw new Error(`invalid memory_size_bytes: ${memory_size_bytes}`)
    }
    var data = Buffer.alloc(1 + memory_address_bytes + memory_size_bytes + data_record)
    data.writeUInt8((memory_size_bytes<<4) | memory_address_bytes, 0)

    if (memory_address >= Math.pow(2, memory_address_bytes*8)) {
      throw new Error(`invalid memory_address: ${memory_address}`)
    }
    for (let i=0; i<memory_address_bytes; i++) {
      let b = (memory_address>>((memory_address_bytes-i-1)*8)) & 0xFF
      data.writeUInt8(b, 1+i)
    }

    if (memory_size >= Math.pow(2, memory_size_bytes*8)) {
      throw new Error(`invalid memory_size: ${memory_size}`)
    }
    for (let i=0; i<memory_size_bytes; i++) {
      let b = (memory_size>>((memory_size_bytes-i-1)*8)) & 0xFF
      data.writeUInt8(b, 1+memory_address_bytes+i)
    }

    data_record.concat(data, 1+memory_address_bytes+memory_size_bytes)
    await this._uds_request(SERVICE_TYPE.WRITE_MEMORY_BY_ADDRESS, 0x00, data)
  }

  clear_diagnostic_information = async (dtc_group_type) => {
    // dtc_group_type = custom value (3 bytes big-endian)
    var data = Buffer.from([(dtc_group_type >> 16) & 0xFF, (dtc_group_type >> 8) & 0xFF, dtc_group_type & 0xFF])
    await this._uds_request(SERVICE_TYPE.CLEAR_DIAGNOSTIC_INFORMATION, undefined, data)
  }

  read_dtc_information = async (dtc_report_type, dtc_status_mask_type=DTC_STATUS_MASK_TYPE.ALL, dtc_severity_mask_type=DTC_SEVERITY_MASK_TYPE.ALL, dtc_mask_record=0xFFFFFF, dtc_snapshot_record_num=0xFF, dtc_extended_record_num=0xFF) => {
    var data = Buffer.from([])
    // dtc_status_mask_type
    if (dtc_report_type === DTC_REPORT_TYPE.NUMBER_OF_DTC_BY_STATUS_MASK ||
      dtc_report_type === DTC_REPORT_TYPE.DTC_BY_STATUS_MASK ||
      dtc_report_type === DTC_REPORT_TYPE.MIRROR_MEMORY_DTC_BY_STATUS_MASK ||
      dtc_report_type === DTC_REPORT_TYPE.NUMBER_OF_MIRROR_MEMORY_DTC_BY_STATUS_MASK ||
      dtc_report_type === DTC_REPORT_TYPE.NUMBER_OF_EMISSIONS_RELATED_OBD_DTC_BY_STATUS_MASK ||
      dtc_report_type === DTC_REPORT_TYPE.EMISSIONS_RELATED_OBD_DTC_BY_STATUS_MASK) {
      data = Buffer.from([dtc_status_mask_type])
    }
    // dtc_mask_record
    if (dtc_report_type === DTC_REPORT_TYPE.DTC_SNAPSHOT_IDENTIFICATION ||
      dtc_report_type === DTC_REPORT_TYPE.DTC_SNAPSHOT_RECORD_BY_DTC_NUMBER ||
      dtc_report_type === DTC_REPORT_TYPE.DTC_EXTENDED_DATA_RECORD_BY_DTC_NUMBER ||
      dtc_report_type === DTC_REPORT_TYPE.MIRROR_MEMORY_DTC_EXTENDED_DATA_RECORD_BY_DTC_NUMBER ||
      dtc_report_type === DTC_REPORT_TYPE.SEVERITY_INFORMATION_OF_DTC) {
      data = Buffer.concat([data, Buffer.from([(dtc_mask_record >> 16) & 0xFF, (dtc_mask_record >> 8) & 0xFF, dtc_mask_record & 0xFF])])
    }
    // dtc_snapshot_record_num
    if (dtc_report_type === DTC_REPORT_TYPE.DTC_SNAPSHOT_IDENTIFICATION ||
      dtc_report_type === DTC_REPORT_TYPE.DTC_SNAPSHOT_RECORD_BY_DTC_NUMBER ||
      dtc_report_type === DTC_REPORT_TYPE.DTC_SNAPSHOT_RECORD_BY_RECORD_NUMBER) {
      data = Buffer.concat([data, Buffer.from([dtc_snapshot_record_num])])
    }
    // dtc_extended_record_num
    if (dtc_report_type === DTC_REPORT_TYPE.DTC_EXTENDED_DATA_RECORD_BY_DTC_NUMBER ||
      dtc_report_type === DTC_REPORT_TYPE.MIRROR_MEMORY_DTC_EXTENDED_DATA_RECORD_BY_DTC_NUMBER) {
      data = Buffer.concat([data, Buffer.from([dtc_extended_record_num])])
    }
    // dtc_severity_mask_type
    if (dtc_report_type === DTC_REPORT_TYPE.NUMBER_OF_DTC_BY_SEVERITY_MASK_RECORD ||
      dtc_report_type === DTC_REPORT_TYPE.DTC_BY_SEVERITY_MASK_RECORD) {
      data = Buffer.concat([data, Buffer.from([dtc_severity_mask_type]), Buffer.from([dtc_status_mask_type])])
    }
    
    var resp = await this._uds_request(SERVICE_TYPE.READ_DTC_INFORMATION, dtc_report_type, data)

    // TODO: parse response
    return resp
  }

  input_output_control_by_identifier = async (data_identifier_type, control_option_record, control_enable_mask_record=Buffer.from([])) => {
    var data = Buffer.alloc(2 + control_option_record.byteLength + control_enable_mask_record.byteLength)
    data.writeUInt16BE(data_identifier_type)
    control_option_record.copy(data, 2)
    control_enable_mask_record.copy(data, 2+control_option_record.byteLength)
    var resp = await this._uds_request(SERVICE_TYPE.INPUT_OUTPUT_CONTROL_BY_IDENTIFIER, undefined, data)
    var resp_id = resp.byteLength >= 2 ? resp.readUInt16BE(0) : undefined
    if (resp_id !== data_identifier_type) {
      throw new Error(`invalid response data identifier: 0x${resp_id.toString(16)}`)
    }
    return resp.slice(2)
  }

  routine_control = async (routine_control_type, routine_identifier_type, routine_option_record=Buffer.from([])) => {
    var data = Buffer.alloc(2 + routine_option_record.byteLength)
    data.writeUInt16BE(routine_identifier_type)
    routine_option_record.copy(data, 2)
    var resp = await this._uds_request(SERVICE_TYPE.ROUTINE_CONTROL, routine_control_type, data)
    var resp_id = resp.byteLength >= 2 ? resp.readUInt16BE(0) : undefined
    if (resp_id !== routine_identifier_type) {
      throw new Error(`invalid response data identifier: 0x${resp_id.toString(16)}`)
    }
    return resp.slice(2)
  }

  request_download = async (memory_address, memory_size, memory_address_bytes=4, memory_size_bytes=4, data_format=0x00) => {
    if (memory_address_bytes < 1 || memory_address_bytes > 4) {
      throw new Error(`invalid memory_address_bytes: ${memory_address_bytes}`)
    }
    if (memory_size_bytes < 1 || memory_size_bytes > 4) {
      throw new Error(`invalid memory_size_bytes: ${memory_size_bytes}`)
    }
    var data = Buffer.alloc(2 + memory_address_bytes + memory_size_bytes)
    data.writeUInt8(data_format, 0)
    data.writeUInt8((memory_size_bytes<<4) | memory_address_bytes, 1)

    if (memory_address >= Math.pow(2^memory_address_bytes*8)) {
      throw new Error(`invalid memory_address: ${memory_address}`)
    }
    for (let i=0; i<memory_address_bytes; i++) {
      let b = (memory_address>>((memory_address_bytes-i-1)*8)) & 0xFF
      data.writeUInt8(b, 2+i)
    }

    if (memory_size >= Math.pow(2, memory_size_bytes*8)) {
      throw new Error(`invalid memory_size: ${memory_size}`)
    }
    for (let i=0; i<memory_size_bytes; i++) {
      let b = (memory_size>>((memory_size_bytes-i-1)*8)) & 0xFF
      data.writeUInt8(b, 2+memory_address_bytes+i)
    }

    var resp = await this._uds_request(SERVICE_TYPE.REQUEST_DOWNLOAD, undefined, data)
    var max_num_bytes_len = resp.byteLength > 0 ? resp[0] >> 4 : undefined
    if (max_num_bytes_len >= 1 && max_num_bytes_len <= 4) {
      var max_num_bytes = 0
      for (let i=0; i<max_num_bytes_len; i++) {
        max_num_bytes = (max_num_bytes<<8) | resp[i+1]
      }
    }
    else {
      throw new Error(`invalid max_num_bytes_len: ${max_num_bytes_len}`)
    }

    return max_num_bytes // max number of bytes per transfer data request
  }

  request_upload = async (memory_address, memory_size, memory_address_bytes=4, memory_size_bytes=4, data_format=0x00) => {
    if (memory_address_bytes < 1 || memory_address_bytes > 4) {
      throw new Error(`invalid memory_address_bytes: ${memory_address_bytes}`)
    }
    if (memory_size_bytes < 1 || memory_size_bytes > 4) {
      throw new Error(`invalid memory_size_bytes: ${memory_size_bytes}`)
    }
    var data = Buffer.alloc(2 + memory_address_bytes + memory_size_bytes)
    data.writeUInt8(data_format, 0)
    data.writeUInt8((memory_size_bytes<<4) | memory_address_bytes, 1)

    if (memory_address >= Math.pow(2, memory_address_bytes*8)) {
      throw new Error(`invalid memory_address: ${memory_address}`)
    }
    for (let i=0; i<memory_address_bytes; i++) {
      let b = (memory_address>>((memory_address_bytes-i-1)*8)) & 0xFF
      data.writeUInt8(b, 2+i)
    }

    if (memory_size >= Math.pow(2, memory_size_bytes*8)) {
      throw new Error(`invalid memory_size: ${memory_size}`)
    }
    for (let i=0; i<memory_size_bytes; i++) {
      let b = (memory_size>>((memory_size_bytes-i-1)*8)) & 0xFF
      data.writeUInt8(b, 2+memory_address_bytes+i)
    }

    var resp = await this._uds_request(SERVICE_TYPE.REQUEST_UPLOAD, undefined, data)
    var max_num_bytes_len = resp.byteLength > 0 ? resp[0] >> 4 : undefined
    if (max_num_bytes_len >= 1 && max_num_bytes_len <= 4) {
      var max_num_bytes = 0
      for (let i=0; i<max_num_bytes_len; i++) {
        max_num_bytes = (max_num_bytes<<8) | resp[i+1]
      }
    }
    else {
      throw new Error(`invalid max_num_bytes_len: ${max_num_bytes_len}`)
    }

    return max_num_bytes // max number of bytes per transfer data request
  }

  transfer_data = async (block_sequence_count, data=Buffer.from([])) => {
    var buf = Buffer.alloc(1+data.byteLength)
    buf.writeUInt8(block_sequence_count)
    data.copy(buf, 1)
    
    var resp = await this._uds_request(SERVICE_TYPE.TRANSFER_DATA, undefined, buf)
    var resp_id = resp.byteLength > 0 ? resp[0] : undefined
    if (resp_id !== block_sequence_count) {
      var resp_id_hex = resp_id !== undefined ? resp_id.toString(16) : undefined
      throw new Error(`invalid block_sequence_count: 0x${resp_id_hex}`)
    }
    return resp.slice(1)
  }

  request_transfer_exit = async () => {
    await this._uds_request(SERVICE_TYPE.REQUEST_TRANSFER_EXIT, undefined)
  }
}