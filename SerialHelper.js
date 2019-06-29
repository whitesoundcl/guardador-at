const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
//const port = new SerialPort("/dev/ttyUSB0", { baudRate: 9600 })

class SerialHelper {
    constructor(port, baudRate, callback){
        this.port = new SerialPort(port, {baudRate: baudRate}, (e)=>{
            if (e) {
                callback("SerialHelper " + e);
            } else {
                this.parser = new Readline();
                this.port.pipe(this.parser);
                callback();
            }         
        });
    }

    /**
     * 
     * @param {*} port 
     * @param {*} baudRate 
     */
    createNewConnection(port, baudRate, callback){
        this.port = new SerialPort(port, {baudRate: baudRate}, (e)=>{
            if (e) {
                callback("SerialHelper " + e);
            } else {
                this.parser = new Readline();
                this.port.pipe(this.parser);
                callback();
            }         
        });
    }

    getPort(){
        return this.port;
    }

    getParser(){
        return this.parser;
    }
}

module.exports = SerialHelper;