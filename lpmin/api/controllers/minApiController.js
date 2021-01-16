'use strict';

var UglifyJS = require("uglify-js");
var FileStream = require('fs');
var lzstring = require('../../modules/lzstring');
var Path=require('path');

exports.list_all_tasks = function(req, res) {


var code = "function add(first, second) { return first + second; }";
var result = UglifyJS.minify(code);
  res.end(result.code);
};

function minify(jscode){
  if(jscode=="")return "";
  var result = UglifyJS.minify(jscode);
  if(result.error!=undefined&&result.error.message!=""){ 
    var today = new Date();
    var month=today.getMonth()+1;
    if(month<10)month="0"+month;
    var date=today.getDate()+1;
    if(date<10)date="0"+date;
    var hours=today.getHours()+1;
    if(hours<10)hours="0"+hours;
    var minutes=today.getMinutes()+1;
    if(minutes<10)minutes="0"+minutes;
    var seconds=today.getSeconds()+1;
    if(seconds<10)seconds="0"+seconds;
    var milliseconds=today.getMilliseconds()+1;
    if(milliseconds<10)milliseconds="0"+milliseconds;
    if(milliseconds<100)milliseconds="0"+milliseconds;
    var filename=today.getFullYear()+""+month+""+date+""+hours+""+minutes+""+seconds+""+milliseconds+".js";
    FileStream.writeFile(Path.dirname(process.argv[1])+"/errorscripts/"+filename, jscode, function(err) {
        if(err) {
            console.log(err);
        }

    });       
    return "alert('minify javascript ERROR!!!');console.log('minify javascript ERROR!!! : "+result.error.message+" at script "+filename+":"+result.error.line+":"+result.error.col+"');";
  }
  return result.code;
}


exports.minify = function(req, res) {
  if(req.body.code=="minlocXYU5@#."){
  	var jscode=req.body.text||"";  	
    res.end(minify(jscode));
  }
  res.end("alert('minify javascript ERROR!!!');console.log('minify javascript: Not authorized!');");
};

exports.minifycompress = function(req, res) {
  console.log("minifycompress");
  if(req.body.code=="minlocXYU5@#."){
    var jscode=req.body.text||"";
    jscode=minify(jscode); 

    res.end(lzstring.ctb64(jscode));
  }
  res.end("alert('minify javascript ERROR!!!');console.log('minify javascript: Not authorized!');");
};

exports.compress = function(req, res) {
  if(req.body.code=="minlocXYU5@#."){
    var jscode=req.body.text||"";   
    
    res.end(lzstring.ctb64(jscode));
  }
  res.end("alert('minify javascript ERROR!!!');console.log('minify javascript: Not authorized!');");
};
