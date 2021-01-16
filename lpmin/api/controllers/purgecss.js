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
    var rs={Error:"",Data:"",Status:0,Message:""}
    try{
        
    const tplname = req.params.params&&crypto.decDat(req.params.params, 3)||""
    const sex = req.body.data&&crypto.decDat(req.body.data, 3)||""
    
    rs = await mydata.GetData("aut", "t", sex)


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
        const buildFolder = `templates/${tplname}/build/`
        const outFolder = `templates/${tplname}/out/`
        if (!fs.existsSync(buildFolder)) {
            rs.Status = 0
            rs.Error = "template build folder not exist"
        } else {
            //creat output folder
            fs.rmdirSync(outFolder, { recursive: true })
            fs.mkdirSync(outFolder)

            //remove unused css
            const purgeCSSResults = await new purgecss.PurgeCSS().purge({
                content: [buildFolder + 'content.html', buildFolder + '*.js'],
                css: [buildFolder + '*.css'],
                extractors: [
                    {
                        extractor: content => {
                            return content.match(/[A-z0-9-:\/]+/g) || [];
                        },
                        extensions: ['css', 'html']
                    }
                ]
            })

            //shorten css
            let bl = new BufferListStream()
            let bl2 = new BufferListStream()
            purgeCSSResults.forEach(item => {
                bl.append(Buffer.from(item.css))
            })

            bl.pipe(strStream(/(\\:)|(\\\/)/g, function (str) {
                return str.replace("\\:", "--").replace(`\\\/`, "-div-")
            }
            ))
                .pipe(cs.cssStream())
                .on('data', (data) => { bl2.append(data) })
                .on('end', () => {
                    //minify css                    
                    fs.writeFileSync(outFolder + 'style.css', csso.minify(bl2.toString()).css);
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
                    const cssmap=cs.getMap()
                    console.log(cssmap)
                    jsmin=jsmin.replace(regexp, (match, g1,g2) => {
                        
                        return cssmap[g2]?g1+`("${cssmap[g2]}")`:match
                    })
                    regexp = /(className=["']|\.attr\(["']class["'],["']|setAttribute\(["']class["'],["'])(.*?)(["'])/g;
                    jsmin=jsmin.replace(regexp, (match, g1,g2,g3) => {
                        const rs=[];
                        console.log(match,g1,g2,g3)
                        g2.split(" ").forEach(item=>{
                            cssmap[item]?rs.push(cssmap[item]):rs.push(item)
                        })
                        return g1+rs.join(" ")+g3
                    })
                    // bl = new BufferListStream()
                    // var jscssmin=``
                    // bl.append(jsmin)
                    // bl.pipe(cs.htmlStream())
                    // .on('data', (data) => {
                    //     jscssmin+=data.toString()
                    // })
                    // .on('end',()=>{
                    //     console.log(jscssmin)
                    // })

                    //shorten css in html           
                    bl = new BufferListStream()
                    bl.append(`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width">
                <title>Landing page test</title>
                <link href="style.css" rel="stylesheet">
            </head>
            `)

                    fs.createReadStream(buildFolder + 'content.html')
                        .pipe(strStream(/class="(.*?)"/g, function (str) {
                            return str.replace(/:/g, "--").replace(/\//g, "-div-")
                        }))
                        .pipe(cs.htmlStream())
                        //remove class not declare in css (classname len <4)
                        .pipe(strStream(/class="(.*?)"/g, function (str, matched) {
                            const lsClass = matched.split(" ")
                            const rsClass = []
                            for (let i = 0, n = lsClass.length; i < n; i++) {
                                if (lsClass[i].length < 4) rsClass.push(lsClass[i])
                            }
                            return `class="${rsClass.join(" ")}"`

                        })).on('data', (data) => {
                            bl.append(data.toString())
                        }).on('end', () => {

                            //minify js
                            bl.append(`<script>`)
                            bl.append(jsmin)

                            bl.append(`</script></body></html>`)
                            
                            const html = htmlmin.minify(bl.toString(), {
                                collapseWhitespace: true,
                                removeEmptyAttributes: true,
                                removeComments: true,
                                removeTagWhitespace: true
                            })
                            fs.writeFileSync(outFolder + 'index.html', html);
                        })
                })
            


        }
    }
    if (rs.Status == 0) rs.Data = ""
}catch(e){
    rs.Message=e.message
}
    
    process.env.NODE_ENV=='test'?res.send(rs):res.send(crypto.encDat2(JSON.stringify(rs)));
    
};
