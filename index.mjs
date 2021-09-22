import http from 'http';
import path from 'path';
import fs from 'fs';

const browseRoot = '.';
const fileRoot = 'https://iobio.nhgri.nih.gov/udpdata';
const port = 3000;

http.createServer(async (req, res) => {
  const reqPath = req.url.endsWith('/') ? req.url.slice(0, -1) : req.url;
  const fsPath = path.join(browseRoot, reqPath);

  let filenames;
  try {
    filenames = await fs.promises.readdir(fsPath);
  }
  catch (e) {
    //console.error(e);
    res.statusCode = 404;
    res.write("Not Found");
    res.end();
    return;
  }


  let content = `<a class='directory-item' href='../'>../</a>`;

  for (const filename of filenames) {

    const itemPath = path.join(fsPath, filename);
    const stats = await fs.promises.stat(itemPath);

    if (stats.isDirectory()) {
      const linkPath = reqPath + '/' + filename + '/';
      const link = `
        <a class='directory-item' href='${linkPath}'>${filename}/<a>
      `;
      content += link;
    }
    else {
      const linkPath = fileRoot + reqPath + '/' + filename;
      const link = `
        <a class='directory-item' href='${linkPath}'>${filename}</a>
      `;
      content += link;
    }
  }

  const html = `
    <!doctype html>
    <html>
    <head>
      <style>
        :root {
          --main-color: #333;
          --hover-color: #ddd;
        }

        body {
          font-family: Arial;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .content {
          width: 600px;
        }

        .directory-item {
          height: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--main-color);
          text-decoration: none;
        }
        .directory-item:hover {
          background: var(--hover-color);
        }
        .directory-item:any-link {
          color: var(--main-color);
        }

      </style>
    </head>
    <body>
      <div class='content'>
        ${content}
      </div>
    </body>
    </html>
  `;

  res.write(html);
  res.end();
}).listen(port);
