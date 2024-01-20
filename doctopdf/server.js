'use strict' ;

const express = require('express')
const path = require('path')
const app = express()
const port = 8000
// const { doctopdf, doctopdfs } = require('./doctopdfs')
app.use('/static', express.static('public'));
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);
const fs = require('fs').promises;
const fileS = require('fs');

const { mergepdfs } = require('./mergepdf')

const PDFkitDocument = require('pdfkit');

const doc = new PDFkitDocument();


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "templates/index.html"))
  })

// doc to file
app.post('/doc/convert',  upload.single('uploaded_file'), async function(req, res, next) {
    // console.log(req.file) 
   
   async function main(){ 
    const ext = '.pdf'
    const d = path.join(__dirname, req.file.path ) 
    // console.log(d)
    const p = path.join(__dirname, `public/example${ext}`);
    // res.send({data:req.file})
    const docxBuf = await fs.readFile(req.file.path);
    let pdfBuf = await libre.convertAsync(docxBuf, ext, undefined);
     console.log(pdfBuf)
    // res.sendFile(path.join(__dirname, `/public/example${ext}`))
    // res.sendFile(path.join(__dirname, `public/${d}.pdf`))
     await fs.writeFile(p, pdfBuf);
    }
    await main()
    res.redirect("/static/example.pdf")
    
  })

  // pdf merge
  app.post('/pdf/merge', upload.array('pdfs', 10), async (req, res, next) => {
    console.log(req.files[0])
    console.log(req.files[1])
    // console.log(req.files)
    let d = await mergepdfs(path.join(__dirname, req.files[0].path), path.join(__dirname, req.files[1].path))
    res.sendFile(path.join(__dirname, `public/${d}.pdf`))
   // res.redirect(`http://localhost:3000/static/${d}.pdf`)
    // res.send({data: req.files})
    // req.files is array of `photos` files
    // req.body will contain the text fields, if there were any
  
  
  })
  

// photo  
app.post('/photo/merge', upload.array('photos', 12), async (req, res, next) =>{
  console.log(req.files)       
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
  req.files.forEach((file) => {
    doc.image(file.path, {
      cover:[500,400] ,
      align: 'center',
      valign: 'center' ,
       
     });
     doc   
     .addPage()
    });
    // const writbleStream = fs.createWriteStream(filePath);
    await doc.pipe(fileS.createWriteStream('./public/example1.pdf'));  // generate pdf 
    doc.end();
    res.redirect("/static/example1.pdf")
    
});

  app.get('/clear', async (req, res) => {
    const data = fs.readdirSync(path.resolve(__dirname, "uploads"), (err) => {
      console.log(err)
    })
    const pdfs = fs.readdirSync(path.resolve(__dirname, "public"), (err) => {
      console.log(err)
    })
    data.forEach(f => {
  
      fs.unlink(path.resolve(__dirname, `uploads/${f}`), (e) => {
        console.log(e)
      })
    })
    pdfs.forEach(p => {
      fs.unlink(path.resolve(__dirname, `public/${p}`), (e) => {
        console.log(e)
      })
    })
  
    res.sendFile(path.join(__dirname, "templates/index.html"))
  })

  
app.get('/doc',(req,res)=>{
  res.redirect('/static/doc.html')
})
app.get('/image',(req,res)=>{
  res.redirect('/static/image.html')
})
app.get('/pdf',(req,res)=>{
  res.redirect('/static/pdf.html')
})


app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})