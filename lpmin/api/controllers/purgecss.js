'use strict';

const mydata = require("../../modules/data");
const crypto = require("../../modules/crypto");
const purgecss = require("purgecss")
const strStream = require("stream-replace")
const fs = require("fs");
const { json } = require("express");
const CssShortener = require('css-shortener');
const { BufferListStream } = require('bl');
const cs = new CssShortener();
const csso = require('csso');
const htmlmin = require('html-minifier');
const UglifyJS = require("uglify-js");
const { env } = require("process");

exports.purge = async function (req, res) {
    var rs = { Error: "", Data: "", Status: 0, Message: "" }
    try {

        const tplname = req.params.params && crypto.decDat(req.params.params, 3) || ""
        const encryptedsex = req.body.data && crypto.decDat(req.body.data, 3) || ""

        rs = await mydata.GetData("aut", "t", encryptedsex)
        

        if (rs.Status == 1) {
            try {

                const data = JSON.parse(rs.Data)
                //remove data
                rs.Data = ""
                //check permission
                const modules = data["modules"] ? data["modules"].split(",") : []
                if (!modules.includes("c3m-lptpl-admin")) {
                    rs.Status = 0
                    rs.Error = "permission denied"
                }

            } catch (e) {
                rs.Status = 0
                rs.Error = e.message
            }
        }
        if (rs.Status == 1) {
            const buildFolder = `templates/${tplname}/`
            const outFolder = `templates/${tplname}/out/`
            if (!fs.existsSync(buildFolder+"build/")) {
                rs.Status = 0
                rs.Error = "template build folder not exist"
            } else {
                //creat output folder
                fs.rmdirSync(outFolder, { recursive: true })
                fs.mkdirSync(outFolder)
                await build(buildFolder, outFolder,buildFolder + 'build/content.html')

            }
        }
        if (rs.Status == 0) rs.Data = ""
    } catch (e) {
        rs.Status=0;
        rs.Error = e.message
    }

    process.env.NODE_ENV == 'test' ? res.send(rs) : res.send(crypto.encDat2(JSON.stringify(rs)));

};


exports.publish = async function (req, res) {
    var rs = { Error: "", Data: "", Status: 0, Message: "" }
    try {
        
        const tplpath = req.params.params && crypto.decDat(req.params.params, 3) || ""
        const args = (req.body.data && crypto.decDat(req.body.data, 3) || "").split(",")
        if (args.length < 3) {
            rs.Error = "Invalid params"
            res.send(crypto.encDat2(JSON.stringify(rs)))            
            return
        }
        const sex = args[0]
        const lppath = args[1]
        const favicon=crypto.base64decode(args[2])
        rs = await mydata.GetData("aut", "t",crypto.encDat2(sex))
        if (rs.Status == 1) {
            try {
                const data = JSON.parse(rs.Data)
                //remove data
                rs.Data = ""
                //check permission
                const modules = data["modules"] ? data["modules"].split(",") : []
                if (!modules.includes("c3m-lptpl-user")) {
                    rs.Status = 0
                    rs.Error = "permission denied"
                }

            } catch (e) {
                rs.Status = 0
                rs.Error = e.message
            }
        }
        if (rs.Status == 1) {
            const buildFolder = `templates/${tplpath}/`
            const outFolder = `templates/${tplpath}/publish/${lppath}/`

            if (!fs.existsSync(buildFolder+"build/")) {
                rs.Status = 0
                rs.Error = "template build folder not exist"
            } else {
                await build(buildFolder, outFolder,outFolder + 'content.html',favicon)
                console.log("waiting")
            }
        }
        if (rs.Status == 0) rs.Data = ""
    } catch (e) {
        rs.Status=0
        rs.Error = e.message
    }
    console.log(rs)
    res.send(crypto.encDat2(JSON.stringify(rs)));

};

async function build(buildFolder, outFolder,contentfile,favicon) {
    //remove unused css
    const purgeCSSResults = await new purgecss.PurgeCSS().purge({
        content: [contentfile, buildFolder + 'js/*.js'],
        css: [buildFolder + 'css/*.css'],
        extractors: [
            {
                extractor: content => {
                    //match class of tailwindcss with char ":" or "/"
                    return content.match(/[A-z0-9-:\/]+/g) || [];
                },
                extensions: ['css', 'html']
            }
        ]
    })

    var csscontent=""
    purgeCSSResults.forEach(item => {
        csscontent+=item.css
    })

    csscontent=csscontent.replace(/\\:/g, "--").replace(/\\\//g, "-div-")
    csscontent=cs.replaceCss(csscontent)
    
    //minify css                    
    fs.writeFileSync(outFolder + 'style.css', csso.minify(csscontent).css, { mode: '655' });
    //minify js
    var jsmin = `
    var caesarShift = function (str, amount) {
        // Wrap the amount
        if (amount < 0) {
          return caesarShift(str, amount + 26);
        }
        amount=amount%25;
        if(amount==0)amount=1;
      
        // Make an output variable
        var output = "";
      
        // Go through each character
        for (var i = 0; i < str.length; i++) {
          // Get the character we'll be appending
          var c = str[i];
      
          // If it's a letter...
          if (c.match(/[a-z]/i)) {
            // Get its code
            var code = str.charCodeAt(i);
      
            // Uppercase letters
            if (code >= 65 && code <= 90) {
              c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
            }
      
            // Lowercase letters
            else if (code >= 97 && code <= 122) {
              c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
            }
          }
      
          // Append
          output += c;
        }
      
        // All done!
        return output;
      };
      function base64encode(input){
        if(typeof(input)==="undefined"||input.trim()=="")return input;
        return btoa( unescape( encodeURIComponent( input ) ) ).replace(/=/g, "");
    }
    function base64decode(input){
        if (typeof(input)==="undefined" || input === null || input.trim() === "") return "";
        return decodeURIComponent( escape( atob( input ) ) );
    }
    function ranstring(num) {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
        for (let i = 0; i < num; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
    
        return text;
    }
    function encodeW(data,key){
        if(typeof(data)==="undefined"||data.trim()=="")return data;
        key=key||"";
        key=key.trim();
        if(key.length<2)key="abc";
        data+=key;
        
        var x=Math.floor((Math.random() * 8) + 2);            
        var xstr=ranstring(x);
        data=base64encode(data)
        data=xstr+data;
        data=caesarShift(data,key.length);
        var x2=base64encode(x+"");
        data = data.substr(0,x) + xstr + data.substr(x);
        data = data.substr(0,data.length/2) + x2 + data.substr(data.length/2);
        return data;
    }

    function decodeW2(data,key){
        if(!data||data.trim()=="")return data;
        key=key.trim();
        if(key.length<2)key="xyz";
        key="<<"+key+">>";
        key=base64encode(key);
        data=data.replace(key,"");
        var l=key.length;
        if (l*2 > data.length) {
            l = data.length - l
        }
        data = data.substr(0,l) + data.substr(l+key.length);
        data=base64decode(data)
        return data;
    }

      
    //============ lib
    // Check browser support storage
      var isStorage=typeof(Storage) !== "undefined"||false;
      function getStorage(key){
          if(isStorage){
            return localStorage.getItem(key);
          }else{
            return getCookie(key);
          }
      }
      function setStorage(key,value,exminute){
        if(isStorage){
          localStorage.setItem(key,value);
        }else{
          setCookie(key,value,exminute);
        }
    }

      function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
      }

      function setCookie(cname, cvalue, exminute) {
        var d = new Date();
        exminute=exminute||30;
        d.setTime(d.getTime() + (exminute*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
      }
      
      

        //=========== function
        var sex="";
        var apiUrl="${mydata.GetWAPIURL()}";
        async function  GetData(requestUrl,params){
            let rs = { Status: 0, Error: "", Message: "", Data: {} }
            params=params==null?"":params;
            console.log("call: "+ requestUrl + " data:" + params + " - " + sex)

            try {
                const requestUri=encodeW(requestUrl,window.location.host)                
                const res = await fetch(apiUrl + requestUri, {
                    method: 'POST',
                    body: "data=" + encodeW(sex + "|" + params,requestUri),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                const datatext = await res.text();
                
                //get data and decode
                let data = ""
                try {                    
                    data =decodeW2(datatext,requestUri);
                    console.log("data return: ",data)
                }
                catch (ex) {
                    console.log("error in decode:",ex.message)
                }
                //parse to json object
                
                let rtdata = {};
                try {
                    rtdata = JSON.parse(data)
                    if (rtdata.Status !== undefined) rs.Status = rtdata.Status;
                    if (rtdata.Error !== undefined) rs.Error = rtdata.Error;
                    if (rtdata.Message !== undefined) rs.Message = rtdata.Message;
                    if (rtdata.Data !== undefined) rs.Data = rtdata.Data;
                } catch (ex) {
                    rs.Error = ex.message;
                }
                if (rtdata.Status === 1) {
                    if (sex) setStorage("_x", encodeW(sex));
                }
            
            } catch (error) {
                rs.Error = error.message;
            }
        
            return Promise.resolve(rs);
        }

        function serverSubmit(){
            const data=JSON.stringify({name:document.querySelector("#name"),phone:document.querySelector("#phone"),email:document.querySelector("#email"),message:document.querySelector("#message")})
            GetData("lead","s|"+base64encode(data)).then(rs => {
                console.log("data return", rs)
                if (rs.Status === 1) {
                  try {
                    
                  } catch (e) {
                    showMessage("error",e.message,"error");
                  }
                } else {
                    showMessage("error",rs.Error,"error");
                }
                
            })
        }

        window.onload = function(e) {
            GetData("i",getStorage("_x")).then(rs => {
                console.log("data return", rs)
                if (rs.Status === 1) {
                    sex=rs.Data
                  setStorage("_x",encodeW(rs.Data,window.location.host))
                } else {
                    console.log(rs.Error)
                }
                
            })
        }

      `
    const files = fs.readdirSync(buildFolder+"js/")
    for (let i = 0, n = files.length; i < n; i++) {
        const file = files[i]
        if (file.substr(file.length - 3, 3) == ".js") {
            jsmin += fs.readFileSync(buildFolder + "js/" + file, "utf8")
        }
    }

    //shorten cssmin in js
    let regexp = /(classList\.\w+|getElementsByClassName|hasClass|addClass|removeClass)\(["'](.*?)["']\)/g;
    const cssmap = cs.getMap()
    
    jsmin = jsmin.replace(regexp, (match, g1, g2) => {

        return cssmap[g2] ? g1 + `("${cssmap[g2]}")` : match
    })
    regexp = /(querySelector\(["'].*?\.|querySelectorAll\(["'].*?\.|className=["']|\.attr\(["']class["'],["']|setAttribute\(["']class["'],["'])(.*?)(["'])/g;
    jsmin = jsmin.replace(regexp, (match, g1, g2, g3) => {
        const rs = [];                
        g2.split(" ").forEach(item => {
            cssmap[item] ? rs.push(cssmap[item]) : rs.push(item)
        })
        return g1 + rs.join(" ") + g3
    })
    var options = {
        // sourceMap: {
        //     filename: "out.js",
        //     url: "out.js.map"
        // },
        mangle: {
            toplevel: true,            
        },
        nameCache: {}
    };    
    jsmin = UglifyJS.minify(jsmin,options).code

    
    contentfile=fs.readFileSync(contentfile, "utf8")
    //remove html trash and contenteditable property
    contentfile=contentfile.replace(/contenteditable=\"true\"/g,"")
    contentfile=contentfile.replace(/<div class=\"landingpage-trash.*?".*?<\/div>.*?<\/div>/gms,"")

    //replace tailwindcss special char in html
    regexp = /(class=['"])(.*?)(['"])/gms;
    contentfile = contentfile.replace(regexp, (match, g1, g2, g3) => {
        return g1+g2.replace(/:/g, "--").replace(/\//g, "-div-")+g3
    })
    contentfile=cs.replaceHtml(contentfile)
    //remove class not declare in css (classname len <4)
    contentfile = contentfile.replace(regexp, (match, g1, g2, g3) => {
        const lsClass = g2.split(" ")
        const rsClass = []
        for (let i = 0, n = lsClass.length; i < n; i++) {
            if (lsClass[i].length < 4) rsClass.push(lsClass[i])
        }
        return g1+rsClass.join(" ")+g3
    })
    var faviconmeta=``
    if(favicon&&favicon.trim()!=""){
        var icontype=`image/x-icon`
        var iconext=favicon.substr(favicon.indexOf("."))
        if(iconext==".gif"){
            icontype=`image/gif`
        }else if(iconext==".png"){
            icontype=`image/png`
        }else if(iconext==".jpeg"||iconext==".jpg"){
            icontype=`image/jpeg`
        }else if(iconext==".webp"){
            icontype=`image/webp`
        }
        faviconmeta=`<link rel="icon" href="${favicon}" type="${icontype}" /><link rel="shortcut icon" href="${favicon}" type="${icontype}" />`
    }


    var htmlcontent=`<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    ${faviconmeta}
    <title>Landing page test</title>
    <link href="style.css" rel="stylesheet">
    </head>
    ${contentfile}
    <script>${jsmin}</script></body></html>
    `    
    
    htmlcontent = htmlmin.minify(htmlcontent, {
                        collapseWhitespace: true,
                        removeEmptyAttributes: true,
                        removeComments: true,
                        removeTagWhitespace: true
                    })
    fs.writeFileSync(outFolder + 'index.html', htmlcontent, { mode: '655' });
        



//     //shorten css
//     let bl = new BufferListStream()
//     let bl2 = new BufferListStream()
//     purgeCSSResults.forEach(item => {
//         bl.append(Buffer.from(item.css))
//     })

//     bl.pipe(strStream(/(\\:)|(\\\/)/g, function (str) {
//         return str.replace("\\:", "--").replace(`\\\/`, "-div-")
//     }
//     ))
//         .pipe(cs.cssStream())
//         .on('data', (data) => { bl2.append(data) })
//         .on('end', () => {
            
//             // bl = new BufferListStream()
//             // var jscssmin=``
//             // bl.append(jsmin)
//             // bl.pipe(cs.htmlStream())
//             // .on('data', (data) => {
//             //     jscssmin+=data.toString()
//             // })
//             // .on('end',()=>{
//             //     console.log(jscssmin)
//             // })

//             //shorten css in html           
//             bl = new BufferListStream()
//             bl.append(`<!DOCTYPE html>
// <html lang="en">
// <head>
// <meta charset="UTF-8">
// <meta name="viewport" content="width=device-width">
// <title>Landing page test</title>
// <link href="style.css" rel="stylesheet">
// </head>
// `)

//             fs.createReadStream(contentfile)
//                 .pipe(strStream(/class="(.*?)"/g, function (str) {
//                     return str.replace(/:/g, "--").replace(/\//g, "-div-")
//                 }))
//                 .pipe(cs.htmlStream())
//                 //remove class not declare in css (classname len <4)
//                 .pipe(strStream(/class="(.*?)"/g, function (str, matched) {
//                     const lsClass = matched.split(" ")
//                     const rsClass = []
//                     for (let i = 0, n = lsClass.length; i < n; i++) {
//                         if (lsClass[i].length < 4) rsClass.push(lsClass[i])
//                     }
//                     return `class="${rsClass.join(" ")}"`

//                 })).on('data', (data) => {
//                     bl.append(data.toString())
//                 }).on('end', () => {

//                     //minify js
//                     bl.append(`<script>`)
//                     bl.append(jsmin)

//                     bl.append(`</script></body></html>`)

//                     const html = htmlmin.minify(bl.toString(), {
//                         collapseWhitespace: true,
//                         removeEmptyAttributes: true,
//                         removeComments: true,
//                         removeTagWhitespace: true
//                     })
//                     fs.writeFileSync(outFolder + 'index.html', html, { mode: '655' });
//                 })
//         })

}