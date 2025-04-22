class VotingAPI {
    static async fetchVotingData() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/voting-data`);
            return await response.json();
        } catch (error) {
            console.error('获取投票数据失败:', error);
            throw error;
        }
    }

    static async submitVote(buildingCode, buildingName, selectedUnits, totalUnits) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    buildingCode,
                    buildingName,
                    selectedUnits,
                    totalUnits
                })
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(JSON.stringify(result));
            }
            return result;
        } catch (error) {
            console.error('提交投票失败:', error);
            throw error;
        }
    }
}

// 将VotingAPI导出到全局作用域
window.VotingAPI = VotingAPI; 