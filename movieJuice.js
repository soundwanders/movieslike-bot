var http = require('http');

http
  .createServer(function (req, res) {
    res.write("Movieslike bot, do you read me?");
    res.end();
  })
  .listen(8080);