class Econsole{

    constructor(filename,classname,methodname){
        this.filename=filename;
        this.classname=classname;
        this.methodname=methodname;
    }
     log(...message){
      if(process.env.LOGGER_ON=="true"){
        const [flag,...rest]=message
        console.log(flag,"[",this.filename,":",this.classname,":",this.methodname,":",rest,"]");
      }
     }
     error(...message){
      if(process.env.LOGGER_ON=="true"){
        const [flag,...rest]=message
        console.error(flag,"[",this.filename,":",this.classname,":",this.methodname,":",rest,"]");
      }
     }
}
module.exports=Econsole;