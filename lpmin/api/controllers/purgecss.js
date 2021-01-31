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
                await build(buildFolder, outFolder,buildFolder + 'content.html')

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
        if (args.length < 2) {
            rs.Error = "Invalid params"
            res.send(crypto.encDat2(JSON.stringify(rs)))            
            return
        }
        const sex = args[0]
        const lppath = args[1]
        
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
                await build(buildFolder, outFolder,outFolder + 'content.html')
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

async function build(buildFolder, outFolder,contentfile) {
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
    var jsmin = ``
    const files = fs.readdirSync(buildFolder)
    for (let i = 0, n = files.length; i < n; i++) {
        const file = files[i]
        if (file.substr(file.length - 3, 3) == ".js") {
            jsmin += UglifyJS.minify(fs.readFileSync(buildFolder + "/" + file, "utf8")).code
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
    

    //replace tailwindcss special char in html
    regexp = /(class=['"])(.*?)(['"])/g;
    contentfile=fs.readFileSync(contentfile, "utf8")
    contentfile=contentfile.replace(/contenteditable=\"true\"/g,"")
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
    var htmlcontent=`<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
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