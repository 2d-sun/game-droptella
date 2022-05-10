"use strict";

let fs = require('fs');
let http = require('http');

const PORT = 8080

http.createServer(function (req, res) {
  const templateFile = `${__dirname}/index.html`; // __dirname + req.url
  // fs.readFile(templateFile, function (err,data) {
  //   if (err) {
  //     res.writeHead(404);
  //     res.end(JSON.stringify(err));
  //     return;
  //   }
  //   res.writeHead(200);
  //   res.end(data);
  // });
  // res.writeHead(200)
  // console.log("bbbb", templateFile)
  // fs.createReadStream(templateFile).pipe(res)

  console.log("income ", /\/dist$/.test(req.url), req.url)
  if (["/", "/en", "/uk"].includes(req.url)) {
    fs.readFile(templateFile, function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      return res.end();
    });
  } else if (/\/dist\//.test(req.url)) {
    
    const distPath = req.url.split("dist").pop()

    fs.readFile(`${__dirname}/../dist/${distPath}`, function(err, data) {
      // res.writeHead(200, {'Content-Type': 'application/html'});
      res.write(data);
      return res.end();
    });
  } else if (/\/static\//.test(req.url)) {
    const distPath = req.url.split("static").pop()

    fs.readFile(`${__dirname}/../static/${distPath}`, function(err, data) {
      // res.writeHead(200, {'Content-Type': 'application/html'});
      res.write(data);
      return res.end();
    });
  }
}).listen(PORT, () => {
  console.info(`Sarted on ${PORT}`)
});