class VotingApp {
    static currentBuilding = null;
    static selectedUnits = [];
    static votedUnits = new Set();
    static buildingData = {};

    static async init() {
        this.setupEventListeners();
        await this.startPolling();
        // 页面加载时恢复投票状态和更新统计
        VotingUI.restoreVoteState();
        VotingUI.updateBuildingProgress(this.buildingData);
    }

    static setupEventListeners() {
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
    }

    static async startPolling() {
        await this.fetchVotingData();
        setInterval(() => this.fetchVotingData(), CONFIG.POLLING_INTERVAL);
    }

    static async fetchVotingData() {
        try {
            const data = await VotingAPI.fetchVotingData();
            this.buildingData = data.buildings;
            this.votedUnits = new Set(data.votedUnits);
            VotingUI.updateBuildingProgress(this.buildingData);
            VotingUI.updateVotedUnits(this.votedUnits);
        } catch (error) {
            console.error('获取投票数据失败:', error);
        }
    }

    static showUnits(buildingCode) {
        const building = CONFIG.BUILDINGS.find(b => b.code === buildingCode);
        if (!building) return;

        this.currentBuilding = building;
        this.selectedUnits = [];
        
        // 更新标题
        document.getElementById('buildingTitle').textContent = 
            `${building.name} (${building.code}) 户号选择`;
        
        // 生成单元格和表格
        VotingUI.generateUnitTabs(building.units);
        VotingUI.generateUnitTable(building);
        
        // 显示信息面板
        document.getElementById('infoPanel').style.display = 'block';
        
        // 更新楼栋进度
        VotingUI.updateBuildingProgress(this.buildingData);
    }

    static toggleUnitSelection(button, unitCode) {
        // 如果已经投票，不允许选择
        if (button.classList.contains('voted')) {
            return;
        }
        
        button.classList.toggle('selected');
        const index = this.selectedUnits.indexOf(unitCode);
        
        if (index === -1) {
            this.selectedUnits.push(unitCode);
        } else {
            this.selectedUnits.splice(index, 1);
        }
        
        this.updateSelectedCount();
        
        // 保存选中状态（但不是投票状态）
        VotingUI.saveVoteState(unitCode, button.classList.contains('selected'));
    }

    static updateSelectedCount() {
        const totalUnits = this.currentBuilding.units * 
                          this.currentBuilding.unitsPerFloor * 
                          (CONFIG.FLOOR_RANGE.END - CONFIG.FLOOR_RANGE.START + 1);
        VotingUI.updateSelectedCount(this.selectedUnits, totalUnits);
    }

    static resetSelection() {
        this.selectedUnits = [];
        document.querySelectorAll('.unit-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
        this.updateSelectedCount();
    }

    static async submitVote() {
        if (this.selectedUnits.length === 0) {
            alert('请至少选择一个户号！');
            return;
        }
        
        const confirmation = confirm(
            `您确定要为${this.currentBuilding.name}的以下户号投票吗？\n\n${this.selectedUnits.join('\n')}`
        );
        
        if (confirmation) {
            try {
                const totalUnits = this.currentBuilding.units * 
                                 this.currentBuilding.unitsPerFloor * 
                                 (CONFIG.FLOOR_RANGE.END - CONFIG.FLOOR_RANGE.START + 1);
                
                const result = await VotingAPI.submitVote(
                    this.currentBuilding.code,
                    this.currentBuilding.name,
                    this.selectedUnits,
                    totalUnits
                );

                // 更新本地存储中的投票状态
                this.selectedUnits.forEach(unitCode => {
                    const button = document.querySelector(`.unit-btn[data-code="${unitCode}"]`);
                    if (button) {
                        button.classList.remove('selected');
                        button.classList.add('voted');
                        // 保存到本地存储，标记为已投票
                        VotingUI.saveVoteState(unitCode, true);
                    }
                });

                // 更新楼栋进度
                VotingUI.updateBuildingProgress(this.buildingData);
                
                alert(`投票成功！\n\n您已为${this.currentBuilding.name}的以下户号投票:\n${this.selectedUnits.join('\n')}`);
                this.selectedUnits = []; // 清空选中的单元
            } catch (error) {
                const errorData = JSON.parse(error.message);
                if (errorData.error) {
                    alert(`投票失败：${errorData.error}\n\n重复投票的户号：\n${errorData.duplicateUnits.join('\n')}`);
                } else {
                    alert('提交投票失败，请稍后重试');
                }
            }
        }
    }

    static initBuildingProgress() {
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
    }

    static async updateBuildingProgress() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/progress`);
            const buildingData = await response.json();
            VotingUI.updateBuildingProgress(buildingData);
        } catch (error) {
            console.error('Failed to fetch building progress:', error);
        }
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    VotingApp.init();
});

// 将VotingApp导出到全局作用域
window.VotingApp = VotingApp; 