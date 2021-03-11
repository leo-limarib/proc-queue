const { exec } = require("child_process");
const EventEmitter = require("events");

class ProcessQueue {
  constructor(size) {
    this.size = size;
    this.queue = Array(size);
    this.free = true;
    this.emitter = new EventEmitter();
  }

  _checkQueue() {
    if (this.queue.length > 0) {
      this._runFirstInQueue();
      if (this.free) this.free = false;
    } else if (this.queue.length == 0) {
      this.free = true;
    }
  }

  _runFirstInQueue() {
    console.log("RUNNING", this.queue[0].command);
    this.free = false;
    exec(this.queue[0].command, (err, stdout, stderr) => {
      console.log("DONE", this.queue[0].command);
      if (err) {
        this.emitter.emit("error", this.queue[0]);
      } else {
        this.emitter.emit("done", this.queue[0]);
      }
      this.queue.shift();
      this._checkQueue();
    });
  }

  push(command, filename, company) {
    this.queue.push({ command, filename, company });
    this._checkQueue();
  }
}

module.exports = ProcessQueue;
