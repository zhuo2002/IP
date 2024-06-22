const https = require('https');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // 引入 axios 库

const apiUrl = 'https://api.ipify.org?format=json';
const ipFileName = 'ip.txt';
const ipRecordFileName = 'ip.json';
const pushplusToken = '6a02d320968b424793640d0b375314e0'; // 替换为您的 PushPlus Token

// 读取之前记录的IP地址
let ipRecord = {};
try {
    const ipRecordData = fs.readFileSync(ipRecordFileName, 'utf8');
    ipRecord = JSON.parse(ipRecordData);
} catch (err) {
    if (err.code !== 'ENOENT') {
        console.error('读取IP记录文件时出错:', err);
        process.exit(1);
    }
    // 如果文件不存在，则继续执行
}

https.get(apiUrl, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const ipData = JSON.parse(data);
            const ip = ipData.ip;

            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const customTimestamp = `${year}-${month}-${day}`;

            // 检查当前IP是否在之前的记录中
            if (ipRecord[ip]) {
                // 如果已记录，则追加相同IP和时间戳，并注明与哪一天相同
                const previousTimestamp = ipRecord[ip];
                const contentToAdd = `${customTimestamp} IP ${ip} 与 ${previousTimestamp} 的IP相同\n`;
                appendToFile(ipFileName, contentToAdd);
            
                // 发送 PushPlus 推送（如果IP未改变）
                sendPushplusNotification(`IP 未改变: 当前IP是 ${ip}, 上次 ${previousTimestamp}`);
            } else {
                // 如果未记录，则追加新IP和时间戳，并更新记录
                const contentToAdd = `${customTimestamp} IP ${ip}\n`;
                appendToFile(ipFileName, contentToAdd);
            
                // 更新IP记录
                ipRecord[ip] = customTimestamp;
                writeToFile(ipRecordFileName, ipRecord);
            
                // 发送 PushPlus 推送（如果IP改变了）
                sendPushplusNotification(`新的IP地址: ${ip}, 时间 ${customTimestamp}`);
            }
            
            // 辅助函数：发送 PushPlus 推送通知
            function sendPushplusNotification(message) {
                axios.post('https://www.pushplus.plus/send', {
                    token: pushplusToken,
                    title: 'IP 地址变动通知',
                    content: message
                })
                .then(response => {
                    console.log('PushPlus 推送成功');
                })
                .catch(error => {
                    console.error('PushPlus 推送失败', error);
                });
            }
        } catch (error) {
            console.error('解析IP地址时出错:', error);
        }
    });
}).on('error', (err) => {
    console.error('获取IP地址时出错:', err);
});

// 辅助函数：追加内容到文件
function appendToFile(filePath, content) {
    fs.appendFile(filePath, content, 'utf8', (err) => {
        if (err) {
            console.error('出错:', err);
        } else {
            console.log(`保存到${filePath}`);
        }
    });
}

// 辅助函数：写入内容到文件
function writeToFile(filePath, content) {
    fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('写入文件时出错:', err);
            // 在发生错误时，可以根据实际需求选择退出程序或采取其他行动
            process.exit(1); // 例如，直接退出程序
        } else {
            // 优化日志输出，避免过于冗长
            console.log(`记录${filePath}`);
        }
    });
}