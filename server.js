const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3002;

// 存储投票数据
let votingData = {
    buildings: {},
    votedUnits: new Set()
};

app.use(cors());
app.use(express.json());

// 提供静态文件
app.use(express.static('.'));

// 获取所有楼栋的投票数据
app.get('/api/voting-data', (req, res) => {
    res.json({
        buildings: votingData.buildings,
        votedUnits: Array.from(votingData.votedUnits)
    });
});

// 提交投票
app.post('/api/vote', (req, res) => {
    const { buildingCode, buildingName, selectedUnits, totalUnits } = req.body;
    
    // 检查是否有重复投票
    const duplicateVotes = selectedUnits.filter(unit => votingData.votedUnits.has(unit));
    if (duplicateVotes.length > 0) {
        return res.status(400).json({
            error: '以下户号已经投过票',
            duplicateUnits: duplicateVotes
        });
    }

    // 更新投票数据
    if (!votingData.buildings[buildingCode]) {
        votingData.buildings[buildingCode] = {
            name: buildingName,
            voted: 0,
            total: totalUnits
        };
    }

    // 添加新的投票
    selectedUnits.forEach(unit => {
        votingData.votedUnits.add(unit);
    });
    votingData.buildings[buildingCode].voted += selectedUnits.length;

    res.json({
        success: true,
        buildings: votingData.buildings,
        votedUnits: Array.from(votingData.votedUnits)
    });
});

// 处理所有其他路由，返回index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`投票服务器运行在 http://localhost:${port}`);
}); 