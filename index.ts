import * as os from 'os';
import * as process from 'process';

class FlakeIdentity {
  static readonly instance = new FlakeIdentity();
  protected readonly bytes = {timestamp: 14, count: 4, process: 6, mac: 12};
  protected count = 0;
  protected readonly macAddress = this.getNetworkInterfaces()[0].mac.replace(/:/g, '');
  protected readonly processIdentity = this.padZero(process.pid, this.bytes.process);
  protected timestamp = Date.now();

  protected constructor() {
  }

  // noinspection JSUnusedGlobalSymbols
  make() {
    const timestamp = this.makeTimestamp();
    const count = this.makeCount();
    return `${timestamp}-${count}-${this.processIdentity}-${this.macAddress}`.toLowerCase();
  }

  protected getNetworkInterfaces() {
    const networkInterfaces = os.networkInterfaces();
    const weight = {internal: 0b10, family: 0b01};
    let items: os.NetworkInterfaceInfo[] = [];

    for (let name in networkInterfaces) {
      networkInterfaces[name].forEach(item => {
        items = items.concat(item);
      });
    }

    items = items.filter(item => ('00:00:00:00:00:00' != item.mac));

    return items.map((item, index) => {
      let value = 0;

      if (false === item.internal) {
        value += weight.internal;
      }

      if ('IPv6' === item.family) {
        value += weight.family;
      }

      return {index, value};
    }).sort((left, right) => {
      if (left.value > right.value) {
        return -1;
      } else if (left.value < right.value) {
        return 1;
      } else {
        return 0;
      }
    }).map(item => {
      return items[item.index];
    });

  }

  protected makeCount() {
    const count = this.padZero(this.count, this.bytes.count);
    this.count++;

    // noinspection MagicNumberJS
    if (0xFFFF < this.count) {
      this.count = 0;
    }

    return count;
  }

  protected makeTimestamp() {
    const current = Date.now();

    if (current > this.timestamp) {
      this.count = 0;
      this.timestamp = current;
    }

    return this.padZero(current, this.bytes.timestamp);
  }

  // noinspection JSMethodCanBeStatic
  protected padZero(item: number, length: number) {
    let text = item.toString(16);
    if (text.length < length) {
      text = '0'.repeat(length - text.length) + text;
    }

    return text.slice(-length);
  }

}

const instance = FlakeIdentity.instance;

// noinspection JSUnusedGlobalSymbols
export default instance;