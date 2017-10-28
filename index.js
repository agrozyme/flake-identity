"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const process = require("process");
class FlakeIdentity {
    constructor() {
        this.bytes = { timestamp: 14, count: 4, process: 6, mac: 12 };
        this.count = 0;
        this.macAddress = this.getNetworkInterfaces()[0].mac.replace(/:/g, '');
        this.processIdentity = this.padZero(process.pid, this.bytes.process);
        this.timestamp = Date.now();
    }
    // noinspection JSUnusedGlobalSymbols
    make() {
        const timestamp = this.makeTimestamp();
        const count = this.makeCount();
        return `${timestamp}-${count}-${this.processIdentity}-${this.macAddress}`.toLowerCase();
    }
    getNetworkInterfaces() {
        const networkInterfaces = os.networkInterfaces();
        const weight = { internal: 0b10, family: 0b01 };
        let items = [];
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
            return { index, value };
        }).sort((left, right) => {
            if (left.value > right.value) {
                return -1;
            }
            else if (left.value < right.value) {
                return 1;
            }
            else {
                return 0;
            }
        }).map(item => {
            return items[item.index];
        });
    }
    makeCount() {
        const count = this.padZero(this.count, this.bytes.count);
        this.count++;
        // noinspection MagicNumberJS
        if (0xFFFF < this.count) {
            this.count = 0;
        }
        return count;
    }
    makeTimestamp() {
        const current = Date.now();
        if (current > this.timestamp) {
            this.count = 0;
            this.timestamp = current;
        }
        return this.padZero(current, this.bytes.timestamp);
    }
    // noinspection JSMethodCanBeStatic
    padZero(item, length) {
        let text = item.toString(16);
        if (text.length < length) {
            text = '0'.repeat(length - text.length) + text;
        }
        return text.slice(-length);
    }
}
FlakeIdentity.instance = new FlakeIdentity();
// noinspection JSUnusedGlobalSymbols
exports.default = FlakeIdentity.instance;
