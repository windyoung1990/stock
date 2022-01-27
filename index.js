// document:http://ig507.com/index.html
const fs = require('fs');
var request = require('request');
const key = require('./config').key
// 5 10 20 30 60
let allData = require('./all').allData;
// console.log(allData.length)
let len = allData.length;
let result = [];
let index = 0;
function calc(data, code) {
    if (data.length < 60 ) {
        return
    }
    data = data.reverse();
    let week5 = data.slice(0,5).reduce((total, cur) => total += cur.c , 0)/5;
    let week10 = data.slice(0,10).reduce((total, cur) => total += cur.c , 0)/10;
    let week20 = data.slice(0,20).reduce((total, cur) => total += cur.c , 0)/20;
    let week30 = data.slice(0,30).reduce((total, cur) => total += cur.c , 0)/30;
    let week60 = data.slice(0,60).reduce((total, cur) => total += cur.c , 0)/60;
    // console.log(week5)
    let flag = (week5 >= week10) && (week10>= week20) && (week20 >= week30) && (week30 >= week60)
    if (flag && week5 < data[60].c) {
        result.push({
            code: code
        })
    }

}
function requestData(code) {
    // 过滤掉创业板
    if (code.indexOf('300') === -1) {
        index++;
        loop();
        return
    }
    request(`http://ig507.com/data/time/history/trade/${code}/Week?licence=${key}`, function(err, res, data){
        if (err) {
            // console.log(result)
            writeTofile('result-error.json',  JSON.stringify(result))
            throw err
        }
        console.log(index, ":index")
        try {
            calc(JSON.parse(data), code);
            index++;
            if (index < len) {
                if (index%100 == 0) {
                    console.log(result, index)
                    writeTofile('result.json', JSON.stringify(result))
                }
                loop()
            } else {
                console.log(result)
                writeTofile('result.json', JSON.stringify(result))
    
            }
        } catch(e) {
            index++;
            if (index < len) {
                if (index%100 == 0) {
                    console.log(result, index)
                    writeTofile('result.json', JSON.stringify(result))
                }
                loop()
            } else {
                console.log(result)
                writeTofile('result.json', JSON.stringify(result))
    
            }
            console.log(e,":err")
        }
    })
}
function writeTofile(fileName, data) {
    
    fs.writeFile(fileName, data, (err) => {
        if (err) {
            console.log('写入文件失败')
            return;
        }
        console.log('写入文件成功')
    })
}
function sleep() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(); 
        }, 2000);
    })
}
function loop() {
    sleep().then(() => {
        requestData(allData[index].dm)
    })
}
loop()

