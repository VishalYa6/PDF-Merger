'use strict';

const path = require('path');
const fs = require('fs').promises;

const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);

 async function main(){
    const ext = '.pdf'
    const p1 = path.join(__dirname,"uploads/5a9e75e2f17fbfc806a1b2b358dc6c8e")
    const p2 = path.join(__dirname, `/public/example${ext}`);

    // Read file
    const docxBuf = await fs.readFile(p1);

    // Convert it to pdf format with undefined filter (see Libreoffice docs about filter)
    let pdfBuf = await libre.convertAsync(docxBuf, ext, undefined);
    
    // Here in done you have pdf file which you can save or transfer in another stream
    await fs.writeFile(p2, pdfBuf);
}


main().catch(function (err) {
    console.log(`Error converting file: ${err}`);
});
// module.exports = {doctopdfs}