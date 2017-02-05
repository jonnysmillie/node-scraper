// check if a folder called "data exists", if it doesn't then create one

var fs = require('fs');
//function will check if a directory exists, and create it if it doesn't
function checkDirectory(directory, callback) {  
  fs.stat(directory, function(err, stats) {
    //Check if error defined and the error code is "not exists"
    if (err && err.errno === 34) {
      //Create the directory, call the callback.
      fs.mkdir(directory, callback);
    } else {
      //just in case there was a different error:
      callback(err)
    }
  });
}

checkDirectory("./data/", function(error) {  
  if(error) {
    console.log("oh no!!!", error);
  } else {
    //Carry on, all good, directory exists / created.
  }
});

function checkDirectorySync(directory) {  
  try {
    fs.statSync(directory);
  } catch(e) {
    fs.mkdirSync(directory);
  }
}

checkDirectorySync("./data");  
//directory created / exists, all good.