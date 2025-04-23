const VotingApp = {
    currentBuilding: null,
    selectedUnits: [],
    votedUnits: new Set(),
    buildingData: {},

    init() {
        this.ui = new VotingUI();
        this.ui.initialize();
        VotingUI.restoreVoteState();
    },

    showUnits(buildingCode) {
        const building = CONFIG.BUILDINGS.find(b => b.code === buildingCode);
        if (!building) return;

        this.currentBuilding = building;
        
        // 更新标题
        document.getElementById('selectedBuildingTitle').textContent = `${building.name} (${buildingCode})`;
        
        // 生成单元页签
        VotingUI.generateUnitTabs(building.units);
        
        // 生成户型表格
        VotingUI.generateUnitTable(building);
        
        // 显示面板
        document.getElementById('unitSelectionPanel').style.display = 'block';
        
        // 恢复已投票状态
        VotingUI.restoreVoteState();
    },

    toggleUnitSelection(button, unitCode) {
        VotingUI.toggleUnitSelection(button, unitCode);
    },

    resetSelection() {
        document.querySelectorAll('.unit-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
        VotingUI.updateSelectedCount([], this.currentBuilding?.units || 0);
    },

    submitVote() {
        const selectedUnits = Array.from(document.querySelectorAll('.unit-btn.selected')).map(btn => btn.textContent);
        if (selectedUnits.length === 0) {
            alert('请至少选择一个户号');
            return;
        }

        if (confirm(`确认为以下户号提交投票？\n${selectedUnits.join('\n')}`)) {
            selectedUnits.forEach(unitCode => {
                const button = document.querySelector(`.unit-btn[data-code="${unitCode}"]`);
                if (button) {
                    button.classList.remove('selected');
                    button.classList.add('voted');
                    button.disabled = true;
                }
            });
            VotingUI.saveVoteState();
            alert('投票成功！');
        }
    },

    setupEventListeners() {
        const buildings = document.querySelectorAll('.building');
        buildings.forEach(building => {
            building.addEventListener('click', () => {
                const buildingCode = building.getAttribute('data-code');
                const buildingData = CONFIG.BUILDINGS.find(b => b.code === buildingCode);
                if (buildingData) {
                    this.currentBuilding = buildingData;
                    VotingUI.generateUnitTable(buildingData);
                }
            });
        });

        // 添加搜索功能监听
        const searchInput = document.getElementById('buildingSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                VotingUI.filterBuildings(e.target.value);
            });
        }
    },

    async startPolling() {
        await this.fetchVotingData();
        setInterval(() => this.fetchVotingData(), CONFIG.POLLING_INTERVAL);
    },

    async fetchVotingData() {
        try {
            const data = await VotingAPI.fetchVotingData();
            this.buildingData = data.buildings;
            this.votedUnits = new Set(data.votedUnits);
            VotingUI.updateBuildingProgress(this.buildingData);
            VotingUI.updateVotedUnits(this.votedUnits);
        } catch (error) {
            console.error('获取投票数据失败:', error);
        }
    },

    initBuildingProgress() {
        const buildings = document.querySelectorAll('.building');
        buildings.forEach(building => {
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            building.appendChild(progressBar);
            
            const buildingCode = building.getAttribute('data-code');
            if (this.buildingData[buildingCode]) {
                const percentage = (this.buildingData[buildingCode].voted / this.buildingData[buildingCode].total) * 100;
                progressBar.style.width = `${percentage}%`;
                building.setAttribute('data-progress', percentage.toFixed(1));
            } else {
                progressBar.style.width = '0%';
                building.setAttribute('data-progress', '0');
            }
        });
    },

    async updateBuildingProgress() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/progress`);
            const buildingData = await response.json();
            VotingUI.updateBuildingProgress(buildingData);
        } catch (error) {
            console.error('Failed to fetch building progress:', error);
        }
    }
};

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    VotingApp.init();
});

// 将VotingApp导出到全局作用域
window.VotingApp = VotingApp; 