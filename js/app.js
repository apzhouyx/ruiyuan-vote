class VotingApp {
    static currentBuilding = null;
    static selectedUnits = [];
    static votedUnits = new Set();
    static buildingData = {};

    static async init() {
        this.initBuildingProgress();
        this.startPolling();
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
        
        document.getElementById('buildingTitle').textContent = 
            `${building.name} (${building.code}) 户号选择 - ${CONFIG.FLOOR_RANGE.START}至${CONFIG.FLOOR_RANGE.END}层`;
        
        VotingUI.generateUnitTabs(building.units);
        VotingUI.generateUnitTable(building);
        this.updateSelectedCount();
        
        document.getElementById('infoPanel').style.display = 'block';
    }

    static toggleUnitSelection(button, unitCode) {
        button.classList.toggle('selected');
        
        const index = this.selectedUnits.indexOf(unitCode);
        if (index === -1) {
            this.selectedUnits.push(unitCode);
        } else {
            this.selectedUnits.splice(index, 1);
        }
        
        this.updateSelectedCount();
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

                this.buildingData = result.buildings;
                this.votedUnits = new Set(result.votedUnits);
                
                VotingUI.updateBuildingProgress(this.buildingData);
                VotingUI.updateVotedUnits(this.votedUnits);
                
                alert(`投票成功！\n\n您已为${this.currentBuilding.name}的以下户号投票:\n${this.selectedUnits.join('\n')}`);
                this.resetSelection();
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
} 