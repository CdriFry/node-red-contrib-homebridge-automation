var debug = require('debug')('Service');
var Characteristic = require('./Characteristic.js').Characteristic;

module.exports = {
  Service: Service
};

/*

This is a typical Service

{
  "iid": 8,
  "type": "0000008A-0000-1000-8000-0026BB765291",
  "characteristics": [{
    "iid": 9,
    "type": "00000023-0000-1000-8000-0026BB765291",
    "perms": ["pr"],
    "format": "string",
    "value": "Cold Cellar",
    "description": "Name"
  }, {
    "iid": 10,
    "type": "00000011-0000-1000-8000-0026BB765291",
    "perms": ["pr", "ev"],
    "format": "float",
    "value": 4.9,
    "description": "Current Temperature",
    "unit": "celsius",
    "maxValue": 100,
    "minValue": -100,
    "minStep": 0.1
  }, {
    "iid": 11,
    "type": "00000010-0000-1000-8000-0026BB765291",
    "perms": ["pr", "ev"],
    "format": "float",
    "value": 51,
    "description": "Current Relative Humidity",
    "unit": "percentage",
    "maxValue": 100,
    "minValue": 0,
    "minStep": 1
  }, {
    "iid": 12,
    "type": "E863F10F-079E-48FF-8F27-9C2605A29F52",
    "perms": ["pr", "ev"],
    "format": "uint8",
    "value": 1011,
    "description": "Air Pressure",
    "unit": "mbar",
    "maxValue": 1200,
    "minValue": 800,
    "minStep": 1
  }],
  "primary": false,
  "hidden": false
}
*/

function Service(devices, context) {
  // debug("Service", JSON.stringify(devices));
  this.iid = devices.iid;
  this.service = devices.type.substring(0, 8);
  this.deviceType = _normalizeName(this.service);
  this.aid = context.aid;
  this.host = context.host;
  this.port = context.port;
  this.homebridge = context.homebridge;
  this.id = context.id;
  this.characteristics = [];
  devices.characteristics.forEach(function(element) {
    var service = new Characteristic(element, this);
    if (element.type.substring(0, 8) === '00000023') {
      this.name = element.value;
    } else {
      this.characteristics.push(service);
    }
  }.bind(this));
}

Service.prototype.toList = function(context) {
  var descriptions;
  var getCharacteristics;
  var putCharacteristics = [];
  var eventRegisters = [];

  if (this.name) {
    context.name = this.name;
  }
  for (var index in this.characteristics) {
    var characteristic = this.characteristics[index];
    debug("characteristic", characteristic);
    if (characteristic.type !== '00000023') {
      debug("Not Name", characteristic.type);
      descriptions = (descriptions ? descriptions + ',' : '') + characteristic.description;
      getCharacteristics = (getCharacteristics ? getCharacteristics + ',' : '') + characteristic.getCharacteristic;
      putCharacteristics = putCharacteristics.concat(characteristic.putCharacteristic);
      eventRegisters = eventRegisters.concat(characteristic.eventRegister);
    } else {
      debug("Name", characteristic.type);
    }
  }
  if (this.deviceType) {
    return ({
      homebridge: context.homebridge,
      host: context.host,
      port: context.port,
      id: context.id,
      aid: context.aid,
      service: this.service,
      name: context.name,
      deviceType: this.deviceType,
      fullName: context.name + ' - ' + this.deviceType,
      sortName: context.name + ':' + this.deviceType,
      uniqueId: context.homebridge + this.id + context.manufacturer + context.name + this.service,
      descriptions: descriptions,
      getCharacteristics: getCharacteristics,
      putCharacteristics: putCharacteristics,
      eventRegisters: eventRegisters
    });
  }
};

function _normalizeName(id) {
  switch (id) {
    case "0000003E":
      return ("Accessory Information");
    case "000000BB":
      return ("Air Purifier");
    case "0000008D":
      return ("Air Quality Sensor");
    case "00000096":
      return ("Battery Service");
    case "00000110":
      return ("Camera RTP Stream Management");
    case "00000097":
      return ("Carbon Dioxide Sensor");
    case "0000007F":
      return ("Carbon Monoxide Sensor");
    case "00000080":
      return ("Contact Sensor");
    case "00000081":
      return ("Door");
    case "00000121":
      return ("Doorbell");
    case "00000040":
      return ("Fan");
    case "000000B7":
      return ("Fan v2");
    case "000000BA":
      return ("Filter Maintenance");
    case "000000D7":
      return ("Faucet");
    case "00000041":
      return ("Garage Door Opener");
    case "000000BC":
      return ("Heater Cooler");
    case "000000BD":
      return ("Humidifier Dehumidifier");
    case "00000082":
      return ("Humidity Sensor");
    case "000000CF":
      return ("Irrigation System");
    case "00000083":
      return ("Leak Sensor");
    case "00000084":
      return ("Light Sensor");
    case "00000043":
      return ("Lightbulb");
    case "00000044":
      return ("Lock Management");
    case "00000045":
      return ("Lock Mechanism");
    case "00000112":
      return ("Microphone");
    case "00000085":
      return ("Motion Sensor");
    case "00000086":
      return ("Occupancy Sensor");
    case "00000047":
      return ("Outlet");
    case "0000007E":
      return ("Security System");
    case "000000CC":
      return ("Service Label");
    case "000000B9":
      return ("Slat");
    case "00000087":
      return ("Smoke Sensor");
    case "00000113":
      return ("Speaker");
    case "00000089":
      return ("Stateless Programmable Switch");
    case "00000049":
      return ("Switch");
    case "0000008A":
      return ("Temperature Sensor");
    case "0000004A":
      return ("Thermostat");
    case "000000D0":
      return ("Valve");
    case "0000008B":
      return ("Window");
    case "0000008C":
      return ("Window Covering");
    case "00000111":
      return ("Camera");
    default:
      debug("Missing HB Type", id);
  }
}