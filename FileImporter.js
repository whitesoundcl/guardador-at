const fs = require('fs');

class FileImporter {

    static readJSONFile(pathToFile){
        let rawdata = fs.readFileSync(pathToFile);  
        return JSON.parse(rawdata);
    }

    static saveJSONFile(pathToFile, object){
        let data = JSON.stringify(object);
        fs.writeFileSync(pathToFile, data); 
    }

}

module.exports = FileImporter;