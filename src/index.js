const most = require('most')
let count = 0
class meeQueue {
  constructor() {
    this.queue = []
    this.active = []
    this.failed = []
    this.succeeded = []
    this.delayed = []
    this.stats = {
      waiting: this.queue.length || 0,
      active: this.active.length || 0,
      failed: 0,
      succeeded: 0,
      delayed: 0
    }
  }

  getJob(id) {

  }
  // {{ size: start end}} => empty === all
  getJobs() {
    // Should return a pop of a single job you then choose to refeed or not
  }
  newstJob() {
    // returns newstJob
  }
  // can be called only once! returns endless stream of jobs
  process(size,fn,opt = {}) {
    if (typeof size === 'function') {
      if (typeof fn === 'object') {
        opt = fn
      }
      fn = size
      size = 1
    }



    console.log('p',this.queue.length)
    // checks every 3 sec for new values
    return most.unfold((queue) =>{
      this.active = queue.slice(0,size)
      console.log('l0',this.active.length)
      if (this.active.length === 0) {
        return new Promise((res)=>{
          console.log('l1',this.active.length)
          //delay by 3 sec Waiting for new
          setTimeout(()=>res({ value: most.of([]) , seed: this.queue }),3000)
        })
      }

      return Promise.all(this.active.map((x)=>{
        return fn(x)
      }))
        .then((value)=>{
          // Remove Active from queue when done else let them in queue for retry
          this.queue = this.queue.slice(this.active.length)
          console.log('v',value)
          console.log('l2',this.queue.length,this.active.length)
          return { value: most.of(value), seed: this.queue }
        },(error)=>{
          console.log(error)
          process.exit(0)
        })
	  }, this.queue)
      .chain(x=>x)
      .filter((ar)=> ar.length > 0)
      //Array to Array[most.of(Array[itm])] chain chain
      .map((ar)=> most.from(ar.map((itm)=>most.of(itm))))
      .chain(x=>x)
      .chain(x=>x)
      .map(x=>{
        process.memoryUsage()
        return x
      })
      .forEach((itm)=> {
        this.succeeded[this.succeeded.push(itm)-1]
        return
      })
  }
  createJob(job) {
    return this.queue.push({ data: job })
  }
  removeJob() {

  }
  destroy() {

  }
  checkStalledJobs() {
    //waiting: this.queue.length|| 0,
    return Promise.resolve({
      wating: this.queue.length,
      active: this.active.length,
      failed: this.active.length,
      delayed: this.active.length,
      succeeded: this.succeeded.length
    })
  }
  close() {
    // Finish Old don't accept new
  }
  checkHealth(){

  }
}
module.exports = meeQueue;
