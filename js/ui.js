class VotingUI {
    static updateSelectedCount(selectedUnits, totalUnits) {
        const countElement = document.getElementById('selectedCount');
        const percentage = totalUnits > 0 ? Math.round((selectedUnits.length / totalUnits) * 100) : 0;
        
        if (selectedUnits.length > 0) {
            countElement.textContent = `已选择 ${selectedUnits.length} 个户号 (${percentage}%)`;
            countElement.style.color = "#2c3e50";
            countElement.style.backgroundColor = "#e8f5e9";
        } else {
            countElement.textContent = '尚未选择任何户号';
            countElement.style.color = "#666";
            countElement.style.backgroundColor = "#f0f0f0";
        }
    }

    static updateBuildingProgress(buildingData) {
        const buildings = document.querySelectorAll('.building');
        const voteState = this.getVoteState();
        let totalVoted = 0;
        let totalUnits = CONFIG.TOTAL_UNITS;

        // 遍历所有楼栋更新状态
        buildings.forEach(building => {
            const buildingCode = building.getAttribute('data-code');
            const buildingConfig = CONFIG.BUILDINGS.find(b => b.code === buildingCode);
            
            // 计算该楼栋的投票数
            let buildingVoted = 0;
            Object.keys(voteState).forEach(unitCode => {
                if (unitCode.startsWith(buildingCode) && voteState[unitCode].voted) {
                    buildingVoted++;
                }
            });

            // 计算楼栋总户数
            const buildingTotal = this.calculateBuildingTotal(buildingConfig);
            
            // 更新楼栋显示
            const percentage = (buildingVoted / buildingTotal) * 100;
            
            // 更新进度条
            building.style.setProperty('--vote-percentage', percentage / 100);
            building.classList.toggle('has-votes', percentage > 0);
            
            // 更新百分比显示
            const percentageDiv = building.querySelector('.vote-percentage') || document.createElement('div');
            percentageDiv.className = 'vote-percentage';
            percentageDiv.textContent = `${percentage.toFixed(1)}%`;
            building.appendChild(percentageDiv);

            // 更新描述文本
            const descDiv = building.querySelector('.building-desc');
            if (descDiv) {
                descDiv.textContent = `${buildingCode}${buildingConfig.units > 1 ? ', ' + buildingConfig.units + '单元' : ''}, ${buildingVoted}/${buildingTotal}户`;
            }

            totalVoted += buildingVoted;
        });

        // 更新总体统计
        this.updateCommunityStats(totalVoted, totalUnits);
    }

    static calculateBuildingTotal(building) {
        if (building.isShop) {
            return building.unitsPerFloor;
        }
        
        let total = 0;
        const floorStart = building.floorRange ? building.floorRange.start : CONFIG.FLOOR_RANGE.START;
        const floorEnd = building.floorRange ? building.floorRange.end : CONFIG.FLOOR_RANGE.END;
        
        if (building.specialFloors) {
            // 特殊楼层配置
            for (let floor = floorStart; floor <= floorEnd; floor++) {
                const floorConfig = building.specialFloors[floor];
                const unitsPerFloor = floorConfig ? floorConfig.unitsPerFloor : 1;
                total += building.units * unitsPerFloor;
            }
        } else {
            // 普通楼层配置
            total = building.units * building.unitsPerFloor * (floorEnd - floorStart + 1);
        }
        
        return total;
    }

    static updateCommunityStats(voted, total) {
        const statsContainer = document.getElementById('communityStats');
        const completionRate = ((voted / total) * 100).toFixed(1);

        statsContainer.innerHTML = `
            <div class="stats-content">
                <div class="stats-item">
                    <span class="stats-label">总户数：</span>
                    <span class="stats-value">${total}</span>
                </div>
                <div class="stats-item">
                    <span class="stats-label">已投票户数：</span>
                    <span class="stats-value">${voted}</span>
                </div>
                <div class="stats-item">
                    <span class="stats-label">完成率：</span>
                    <span class="stats-value">${completionRate}%</span>
                </div>
            </div>
        `;
    }

    static updateVotedUnits(votedUnits) {
        document.querySelectorAll('.unit-btn').forEach(btn => {
            const unitCode = btn.textContent;
            if (votedUnits.has(unitCode)) {
                btn.classList.add('voted');
                btn.disabled = true;
            }
        });
    }

    static generateUnitTabs(unitCount) {
        const tabsContainer = document.getElementById('unitTabs');
        tabsContainer.innerHTML = '';
        
        if (unitCount === 1) {
            tabsContainer.style.display = 'none';
            return;
        }
        
        tabsContainer.style.display = 'flex';
        for (let i = 1; i <= unitCount; i++) {
            const tabBtn = document.createElement('button');
            tabBtn.className = 'tab-btn' + (i === 1 ? ' active' : '');
            tabBtn.textContent = `单元${i}`;
            tabBtn.onclick = () => this.switchTab(i - 1);
            tabsContainer.appendChild(tabBtn);
        }
    }

    static generateUnitTable(building) {
        const tablesContainer = document.getElementById('unitTables');
        tablesContainer.innerHTML = '';
        
        const table = document.createElement('table');
        table.className = 'floor-table';
        
        if (building.isShop) {
            table.appendChild(this.createShopTableHeader());
            table.appendChild(this.createShopTableBody(building));
        } else {
            table.appendChild(this.createTableHeader(building.units, building.unitsPerFloor));
            table.appendChild(this.createTableBody(building));
        }
        
        const tableDiv = document.createElement('div');
        tableDiv.className = 'unit-table-container';
        tableDiv.style.display = 'block';
        tableDiv.appendChild(table);
        tablesContainer.appendChild(tableDiv);

        // 恢复投票状态
        this.restoreVoteState();
        
        // 更新总体统计
        this.updateVoteStatistics();
    }

    static createTableHeader(unitCount, unitsPerFloor) {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        headerRow.appendChild(this.createHeaderCell('楼层'));
        
        for (let unit = 1; unit <= unitCount; unit++) {
            for (let u = 1; u <= unitsPerFloor; u++) {
                headerRow.appendChild(this.createHeaderCell(`${unit}单元${u < 10 ? '0' + u : u}户`));
            }
        }
        
        thead.appendChild(headerRow);
        return thead;
    }

    static createTableBody(building) {
        const tbody = document.createElement('tbody');
        
        // 获取楼栋特定的楼层范围
        const floorStart = building.floorRange ? building.floorRange.start : CONFIG.FLOOR_RANGE.START;
        const floorEnd = building.floorRange ? building.floorRange.end : CONFIG.FLOOR_RANGE.END;
        
        // 特殊处理12-17栋
        if (building.code.match(/^C(1[2-7])$/)) {
            // 1-2层
            const row1_2 = document.createElement('tr');
            row1_2.appendChild(this.createCell('1-2层'));
            for (let unit = 1; unit <= building.units; unit++) {
                for (let u = 1; u <= 2; u++) {
                    const unitCode = this.generateUnitCode(building.code, unit, 1, u);
                    row1_2.appendChild(this.createUnitCell(unitCode));
                }
            }
            tbody.appendChild(row1_2);

            // 3-5层分别显示
            for (let floor = 3; floor <= 5; floor++) {
                const row = document.createElement('tr');
                row.appendChild(this.createCell(`${floor}层`));
                for (let unit = 1; unit <= building.units; unit++) {
                    const unitCode = this.generateUnitCode(building.code, unit, floor, 1);
                    row.appendChild(this.createUnitCell(unitCode));
                }
                tbody.appendChild(row);
            }

            // 6-7层
            const row6_7 = document.createElement('tr');
            row6_7.appendChild(this.createCell('6-7层'));
            for (let unit = 1; unit <= building.units; unit++) {
                const unitCode = this.generateUnitCode(building.code, unit, 6, 1);
                row6_7.appendChild(this.createUnitCell(unitCode));
            }
            tbody.appendChild(row6_7);
        } else {
            // 其他楼栋保持原有逻辑
            for (let floor = floorStart; floor <= floorEnd; floor++) {
                const row = document.createElement('tr');
                row.appendChild(this.createCell(`${floor}层`));
                
                const floorConfig = building.specialFloors ? building.specialFloors[floor] : null;
                const unitsPerFloor = floorConfig ? floorConfig.unitsPerFloor : building.unitsPerFloor;
                
                for (let unit = 1; unit <= building.units; unit++) {
                    for (let u = 1; u <= unitsPerFloor; u++) {
                        const unitCode = this.generateUnitCode(building.code, unit, floor, u);
                        row.appendChild(this.createUnitCell(unitCode));
                    }
                }
                
                tbody.appendChild(row);
            }
        }
        
        return tbody;
    }

    static createHeaderCell(text) {
        const cell = document.createElement('th');
        cell.textContent = text;
        return cell;
    }

    static createCell(text) {
        const cell = document.createElement('td');
        cell.textContent = text;
        return cell;
    }

    static createUnitCell(unitCode) {
        const cell = document.createElement('td');
        const button = document.createElement('button');
        button.className = 'unit-btn';
        button.textContent = unitCode;
        button.onclick = () => VotingApp.toggleUnitSelection(button, unitCode);
        cell.appendChild(button);
        return cell;
    }

    static generateUnitCode(buildingCode, unit, floor, unitNumber) {
        const floorStr = floor < 10 ? `0${floor}` : floor;
        const unitStr = unitNumber < 10 ? `0${unitNumber}` : unitNumber;
        return `${buildingCode}-${unit}-${floorStr}${unitStr}`;
    }

    static switchTab(tabIndex) {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach((tab, index) => {
            tab.classList.toggle('active', index === tabIndex);
        });
    }

    static createShopTableHeader() {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.appendChild(this.createHeaderCell('商铺编号'));
        thead.appendChild(headerRow);
        return thead;
    }

    static createShopTableBody(building) {
        const tbody = document.createElement('tbody');
        const itemsPerRow = 5; // 每行显示5个商铺
        let currentRow;
        
        for (let i = 1; i <= building.unitsPerFloor; i++) {
            if ((i - 1) % itemsPerRow === 0) {
                currentRow = document.createElement('tr');
                tbody.appendChild(currentRow);
            }
            
            const cell = document.createElement('td');
            const unitCode = this.generateUnitCode(building.code, 1, 1, i);
            const button = document.createElement('button');
            button.className = 'unit-btn';
            button.textContent = unitCode;
            button.onclick = () => VotingApp.toggleUnitSelection(button, unitCode);
            cell.appendChild(button);
            currentRow.appendChild(cell);
        }
        
        return tbody;
    }

    static filterBuildings(searchText) {
        const buildings = document.querySelectorAll('.building');
        const searchResult = document.getElementById('searchResult');
        let visibleCount = 0;
        
        buildings.forEach(building => {
            const buildingCode = building.getAttribute('data-code');
            const buildingData = CONFIG.BUILDINGS.find(b => b.code === buildingCode);
            const searchString = `${buildingData.name} ${buildingCode}`.toLowerCase();
            
            if (searchText === '') {
                building.classList.remove('hidden');
                visibleCount++;
            } else {
                const isMatch = searchString.includes(searchText.toLowerCase());
                building.classList.toggle('hidden', !isMatch);
                if (isMatch) visibleCount++;
            }
        });
        
        // 更新搜索结果提示
        if (searchText === '') {
            searchResult.textContent = '';
        } else {
            searchResult.textContent = `找到 ${visibleCount} 个楼栋`;
        }
    }

    static toggleUnitSelection(button, unitCode) {
        button.classList.toggle('selected');
        // 保存选中状态到本地存储
        this.saveVoteState(unitCode, button.classList.contains('selected'));
    }

    static saveVoteState(unitCode, isVoted) {
        const voteState = this.getVoteState();
        if (isVoted) {
            voteState[unitCode] = {
                voted: true,
                timestamp: Date.now()
            };
        } else {
            delete voteState[unitCode];
        }
        localStorage.setItem('voteState', JSON.stringify(voteState));
        
        // 更新所有统计数据
        this.updateVoteStatistics();
        this.updateBuildingProgress({});
    }

    static getVoteState() {
        const savedState = localStorage.getItem('voteState');
        return savedState ? JSON.parse(savedState) : {};
    }

    static updateVoteStatistics() {
        const voteState = this.getVoteState();
        const votedCount = Object.keys(voteState).filter(key => voteState[key].voted).length;
        
        // 更新右侧统计模块
        const statsElement = document.getElementById('communityStats');
        if (statsElement) {
            const totalUnits = CONFIG.TOTAL_UNITS;
            const percentage = ((votedCount / totalUnits) * 100).toFixed(1);
            statsElement.innerHTML = `
                <h3>小区投票统计</h3>
                <div class="stats-content">
                    <div class="stats-item">
                        <span class="stats-label">总户数：</span>
                        <span class="stats-value">${totalUnits}</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-label">已投票：</span>
                        <span class="stats-value">${votedCount}</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-label">完成率：</span>
                        <span class="stats-value">${percentage}%</span>
                    </div>
                </div>
                <div class="progress-bar" style="width: ${percentage}%"></div>
            `;
        }
    }

    static restoreVoteState() {
        const voteState = this.getVoteState();
        const buttons = document.querySelectorAll('.unit-btn');
        buttons.forEach(button => {
            const unitCode = button.textContent;
            button.setAttribute('data-code', unitCode);
            if (voteState[unitCode] && voteState[unitCode].voted) {
                button.classList.add('voted');
            }
        });
        this.updateVoteStatistics();
    }

    updateCommunityStats() {
        const totalUnits = this.buildings.reduce((sum, building) => sum + building.units, 0);
        const votedUnits = this.buildings.reduce((sum, building) => sum + building.votedUnits, 0);
        const completionRate = ((votedUnits / totalUnits) * 100).toFixed(1);

        document.getElementById('totalUnits').textContent = totalUnits;
        document.getElementById('votedUnits').textContent = votedUnits;
        document.getElementById('completionRate').textContent = `${completionRate}%`;
    }

    updateUI() {
        this.updateBuildingButtons();
        this.updateCommunityStats();
    }

    async initialize() {
        try {
            const response = await this.api.getVotingData();
            this.buildings = response.data;
            this.updateUI();
            this.setupEventListeners();
        } catch (error) {
            console.error('初始化失败:', error);
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('buildingSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterBuildings(e.target.value));
        }
    }

    filterBuildings(searchText) {
        const buildingButtons = document.querySelectorAll('.building-button');
        buildingButtons.forEach(button => {
            const buildingName = button.textContent.toLowerCase();
            if (buildingName.includes(searchText.toLowerCase())) {
                button.style.display = 'block';
            } else {
                button.style.display = 'none';
            }
        });
    }
}

// 将VotingUI导出到全局作用域
window.VotingUI = VotingUI; 