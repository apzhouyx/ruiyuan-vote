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
        let totalUnits = CONFIG.TOTAL_UNITS; // 使用配置的总户数
        let totalVoted = 0;

        buildings.forEach(building => {
            const buildingCode = building.getAttribute('data-code');
            const data = buildingData[buildingCode];
            const buildingConfig = CONFIG.BUILDINGS.find(b => b.code === buildingCode);
            
            // 移除旧的百分比显示元素
            const oldPercentage = building.querySelector('.vote-percentage');
            if (oldPercentage) {
                oldPercentage.remove();
            }

            // 添加商铺特殊样式
            if (buildingConfig.isShop) {
                building.classList.add('shop');
            }

            if (data) {
                totalVoted += data.voted;
                const percentage = (data.voted / data.total) * 100;
                
                // 更新渐变色
                building.style.setProperty('--vote-percentage', percentage / 100);
                building.classList.toggle('has-votes', percentage > 0);

                // 添加百分比文本
                const percentageDiv = document.createElement('div');
                percentageDiv.className = 'vote-percentage';
                percentageDiv.textContent = `${percentage.toFixed(1)}%`;
                building.appendChild(percentageDiv);

                // 更新描述文本
                const descDiv = building.querySelector('.building-desc');
                if (descDiv) {
                    const building = CONFIG.BUILDINGS.find(b => b.code === buildingCode);
                    descDiv.textContent = `${buildingCode}, ${building.units > 1 ? building.units + '单元, ' : ''}${data.voted}/${data.total}户`;
                }
            }
        });

        // 更新总体统计信息
        this.updateCommunityStats(totalVoted, totalUnits);
    }

    static updateCommunityStats(votedUnits, totalUnits) {
        // 更新数字统计
        document.getElementById('totalUnits').textContent = totalUnits;
        document.getElementById('votedUnits').textContent = votedUnits;
        document.getElementById('remainingUnits').textContent = totalUnits - votedUnits;

        // 更新百分比显示
        const percentage = totalUnits > 0 ? (votedUnits / totalUnits) * 100 : 0;
        document.querySelector('.progress-percentage').textContent = `${percentage.toFixed(1)}%`;

        // 更新圆形进度条
        this.drawProgressCircle(percentage);
    }

    static drawProgressCircle(percentage) {
        const canvas = document.getElementById('progressCanvas');
        const ctx = canvas.getContext('2d');
        const width = 200;
        const height = 200;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 80;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (percentage / 100) * Math.PI * 2;

        // 设置画布大小
        canvas.width = width;
        canvas.height = height;

        // 清除画布
        ctx.clearRect(0, 0, width, height);

        // 绘制背景圆环
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 15;
        ctx.stroke();

        // 绘制进度圆环
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = percentage === 100 ? '#ff6b6b' : '#4CAF50';
        ctx.lineWidth = 15;
        ctx.stroke();
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
            // 商铺特殊处理
            table.appendChild(this.createShopTableHeader());
            table.appendChild(this.createShopTableBody(building));
        } else {
            // 普通楼栋处理
            table.appendChild(this.createTableHeader(building.units, building.unitsPerFloor));
            table.appendChild(this.createTableBody(building));
        }
        
        const tableDiv = document.createElement('div');
        tableDiv.className = 'unit-table-container';
        tableDiv.style.display = 'block';
        tableDiv.appendChild(table);
        tablesContainer.appendChild(tableDiv);
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
        
        // 获取楼栋特定的楼层范围，如果没有则使用默认范围
        const floorStart = building.floorRange ? building.floorRange.start : CONFIG.FLOOR_RANGE.START;
        const floorEnd = building.floorRange ? building.floorRange.end : CONFIG.FLOOR_RANGE.END;
        
        for (let floor = floorStart; floor <= floorEnd; floor++) {
            const row = document.createElement('tr');
            row.appendChild(this.createCell(`${floor}层`));
            
            for (let unit = 1; unit <= building.units; unit++) {
                for (let u = 1; u <= building.unitsPerFloor; u++) {
                    const unitCode = this.generateUnitCode(building.code, unit, floor, u);
                    row.appendChild(this.createUnitCell(unitCode));
                }
            }
            
            tbody.appendChild(row);
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
}

// 将VotingUI导出到全局作用域
window.VotingUI = VotingUI; 