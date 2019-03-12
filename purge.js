var fs = require('fs');

function deleteFolderRecursive(path, depth) {
    depth = depth === undefined ? 0 : depth

    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach((file) => {
            var curPath = path + '/' + file
            if (fs.lstatSync(curPath).isDirectory()) {
                console.log('--- '.repeat(depth) + `Deleting directory...${curPath}`)
                deleteFolderRecursive(curPath, depth + 1)
                fs.rmdirSync(curPath);
                console.log('--- '.repeat(depth + 1) + `Deleted directory...${curPath}`);
            } else {
                fs.unlinkSync(curPath)
                console.log('--- '.repeat(depth) + `Deleted file...${file}`)
            }
        })
    } else {
        console.error(`Path ${path} is not exists.`)
    }
};

console.log("Cleaning working tree...");

deleteFolderRecursive("./dist");

console.log("Successfully cleaned working tree!");