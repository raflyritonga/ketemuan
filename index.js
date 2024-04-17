require('dotenv').config()
const express = require('express')
const PORT = process.env.PORT || 3000
const app = express()

app.set('view engine', 'ejs')
app.use(express.static("public"))

app.get('', (req, res) => {
     try {
          res.render('pages/index', {
               title: "Ketemuan",
          });
     } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
     }
});

function serverConn() {
     try {
          app.listen(PORT, () => {
               console.log(`Server is running on http://localhost:${PORT}`)
          })
     } catch (error) {
          console.error(error)
     }
}

serverConn()