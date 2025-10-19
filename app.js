// 应用主逻辑
class ChinaMapApp {
    constructor() {
        this.provinces = provincesData;
        this.init();
    }

    // 初始化应用
    init() {
        this.loadFromLocalStorage();
        this.renderProvinceList();
        this.renderMap();
        this.updateStats();
        this.bindActionButtons();
    }

    // 渲染省份列表
    renderProvinceList() {
        const container = document.getElementById('province-list');
        if (container) {
            container.innerHTML = '';
            // 按顺序渲染所有省份
            this.provinces.forEach(province => {
                const btn = this.createProvinceButton(province);
                container.appendChild(btn);
            });
        }
    }

    // 创建省份按钮
    createProvinceButton(province) {
        const btn = document.createElement('button');
        btn.className = 'province-btn';
        btn.textContent = province.name;
        btn.dataset.id = province.id;

        if (province.selected) {
            btn.classList.add('selected');
        }

        btn.addEventListener('click', () => {
            this.toggleProvince(province.id);
        });

        return btn;
    }

    // 切换省份状态
    toggleProvince(provinceId) {
        const province = this.provinces.find(p => p.id === provinceId);
        if (province) {
            province.selected = !province.selected;
            console.log(`切换省份: ${province.name} (${provinceId}) -> ${province.selected ? '点亮' : '取消'}`);
            this.updateUI(provinceId);
            this.updateStats();
            this.saveToLocalStorage();
        } else {
            console.warn(`未找到省份: ${provinceId}`);
        }
    }

    // 更新UI
    updateUI(provinceId) {
        const province = this.provinces.find(p => p.id === provinceId);

        // 更新列表按钮
        const btn = document.querySelector(`.province-btn[data-id="${provinceId}"]`);
        if (btn) {
            if (province.selected) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        }

        // 更新 ECharts 地图
        this.updateMapDisplay();
    }

    // 更新地图显示
    updateMapDisplay() {
        if (this.chart) {
            const mapData = this.getMapData();
            const selectedProvinces = mapData.filter(d => d.selected);
            console.log('更新地图数据，已选中:', selectedProvinces.map(p => p.name));

            // 完全更新地图数据
            this.chart.setOption({
                series: [{
                    data: mapData
                }]
            }, false); // notMerge: false 表示合并配置
        }
    }

    // 更新统计信息
    updateStats() {
        const selectedCount = this.provinces.filter(p => p.selected).length;
        const totalCount = this.provinces.length;

        document.getElementById('selected-count').textContent = selectedCount;
        document.getElementById('total-count').textContent = totalCount;
    }

    // 渲染地图
    async renderMap() {
        const mapContainer = document.getElementById('china-map');

        try {
            // 检查 ECharts 是否加载
            if (typeof echarts === 'undefined') {
                throw new Error('ECharts 未加载');
            }

            // 初始化 ECharts 实例
            this.chart = echarts.init(mapContainer);

            // 显示加载动画
            this.chart.showLoading();

            // 从多个 CDN 源尝试加载中国地图数据
            const cdnUrls = [
                './china.json', // 本地备用文件（优先）
                'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
                'https://unpkg.com/echarts@5.4.3/map/json/china.json',
                'https://cdn.jsdelivr.net/npm/echarts@5.4.3/map/json/china.json'
            ];

            let chinaJson = null;
            let lastError = null;

            // 尝试从不同的 CDN 加载
            for (const url of cdnUrls) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        chinaJson = await response.json();
                        console.log('成功从以下地址加载地图:', url);
                        break;
                    }
                } catch (error) {
                    lastError = error;
                    console.warn(`从 ${url} 加载失败:`, error);
                }
            }

            if (!chinaJson) {
                throw new Error('无法从任何 CDN 源加载地图数据: ' + (lastError?.message || ''));
            }

            // 注册地图
            echarts.registerMap('china', chinaJson);

            // 隐藏加载动画
            this.chart.hideLoading();

            // 准备地图数据
            const mapData = this.getMapData();

            // 配置项
            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}'
                },
                series: [{
                    name: '中国地图',
                    type: 'map',
                    map: 'china',
                    roam: false,
                    selectedMode: false, // 禁用 ECharts 自带的选中模式，使用我们自己的
                    zoom: 1.2, // 放大地图
                    label: {
                        show: true,
                        fontSize: 11
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 14,
                            color: '#000',
                            fontWeight: 'bold'
                        },
                        itemStyle: {
                            areaColor: '#64B5F6',
                            borderColor: '#1976D2',
                            borderWidth: 3,
                            shadowColor: 'rgba(100, 181, 246, 0.5)',
                            shadowBlur: 10
                        }
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1
                    },
                    data: mapData
                }]
            };

            this.chart.setOption(option, true); // 使用 notMerge: true 确保完全替换

            // 添加点击事件
            this.chart.on('click', (params) => {
                if (params.componentType === 'series') {
                    const provinceName = params.name;
                    const province = this.findProvinceByName(provinceName);
                    if (province) {
                        this.toggleProvince(province.id);
                    }
                }
            });

            // 窗口大小改变时重新渲染
            window.addEventListener('resize', () => {
                if (this.chart) {
                    this.chart.resize();
                }
            });

        } catch (error) {
            console.error('加载地图失败:', error);
            mapContainer.innerHTML = `
                <div style="text-align: center; padding: 50px; color: #999;">
                    <p style="font-size: 1.2em; margin-bottom: 10px;">地图加载失败</p>
                    <p style="font-size: 0.9em;">${error.message}</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">请检查网络连接或稍后重试</p>
                </div>
            `;
        }
    }

    // 获取地图数据
    getMapData() {
        // 简称到地图全称的映射（与阿里云 DataV 地图中的名称匹配）
        const nameToMapName = {
            '北京': '北京市',
            '天津': '天津市',
            '河北': '河北省',
            '山西': '山西省',
            '内蒙古': '内蒙古自治区',
            '辽宁': '辽宁省',
            '吉林': '吉林省',
            '黑龙江': '黑龙江省',
            '上海': '上海市',
            '江苏': '江苏省',
            '浙江': '浙江省',
            '安徽': '安徽省',
            '福建': '福建省',
            '江西': '江西省',
            '山东': '山东省',
            '河南': '河南省',
            '湖北': '湖北省',
            '湖南': '湖南省',
            '广东': '广东省',
            '广西': '广西壮族自治区',
            '海南': '海南省',
            '重庆': '重庆市',
            '四川': '四川省',
            '贵州': '贵州省',
            '云南': '云南省',
            '西藏': '西藏自治区',
            '陕西': '陕西省',
            '甘肃': '甘肃省',
            '青海': '青海省',
            '宁夏': '宁夏回族自治区',
            '新疆': '新疆维吾尔自治区',
            '香港': '香港特别行政区',
            '澳门': '澳门特别行政区',
            '台湾': '台湾省'
        };

        return this.provinces.map(province => {
            const mapName = nameToMapName[province.name] || province.name;

            // 小省份列表（需要特殊处理）
            const smallProvinces = ['北京市', '天津市', '上海市', '香港特别行政区', '澳门特别行政区'];
            const isSmallProvince = smallProvinces.includes(mapName);

            return {
                name: mapName,
                value: province.selected ? 1 : 0,
                selected: province.selected,
                itemStyle: {
                    areaColor: province.selected ? '#2196F3' : '#e0e0e0',
                    borderColor: province.selected ? '#1565C0' : '#fff',
                    borderWidth: province.selected && isSmallProvince ? 3 : (province.selected ? 2 : 1),
                    shadowColor: province.selected && isSmallProvince ? 'rgba(33, 150, 243, 0.8)' : 'transparent',
                    shadowBlur: province.selected && isSmallProvince ? 10 : 0
                },
                label: {
                    show: true,
                    color: province.selected ? '#fff' : '#333',
                    fontSize: isSmallProvince ? 12 : 11,
                    fontWeight: province.selected && isSmallProvince ? 'bold' : 'normal'
                }
            };
        });
    }

    // 计算多边形的边界框
    getPolygonBounds(coordinates) {
        let minLng = Infinity, maxLng = -Infinity;
        let minLat = Infinity, maxLat = -Infinity;

        coordinates.forEach(point => {
            const [lng, lat] = point;
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
        });

        return { minLng, maxLng, minLat, maxLat };
    }

    // 根据省份名称查找省份
    findProvinceByName(name) {
        // 省份名称映射（处理简称和全称）
        const nameMap = {
            '北京市': '北京',
            '天津市': '天津',
            '河北省': '河北',
            '山西省': '山西',
            '内蒙古自治区': '内蒙古',
            '辽宁省': '辽宁',
            '吉林省': '吉林',
            '黑龙江省': '黑龙江',
            '上海市': '上海',
            '江苏省': '江苏',
            '浙江省': '浙江',
            '安徽省': '安徽',
            '福建省': '福建',
            '江西省': '江西',
            '山东省': '山东',
            '河南省': '河南',
            '湖北省': '湖北',
            '湖南省': '湖南',
            '广东省': '广东',
            '广西壮族自治区': '广西',
            '海南省': '海南',
            '重庆市': '重庆',
            '四川省': '四川',
            '贵州省': '贵州',
            '云南省': '云南',
            '西藏自治区': '西藏',
            '陕西省': '陕西',
            '甘肃省': '甘肃',
            '青海省': '青海',
            '宁夏回族自治区': '宁夏',
            '新疆维吾尔自治区': '新疆',
            '香港特别行政区': '香港',
            '澳门特别行政区': '澳门',
            '台湾省': '台湾'
        };

        // 先尝试映射
        const mappedName = nameMap[name] || name;

        // 查找省份
        return this.provinces.find(p =>
            p.name === mappedName ||
            p.name === name ||
            name.includes(p.name) ||
            p.name.includes(name)
        );
    }

    // 绑定全选和清空按钮
    bindActionButtons() {
        const selectAllBtn = document.getElementById('select-all-btn');
        const clearAllBtn = document.getElementById('clear-all-btn');

        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                this.selectAll();
            });
        }

        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAll();
            });
        }
    }

    // 全选所有省份
    selectAll() {
        this.provinces.forEach(province => {
            province.selected = true;
        });
        this.refreshUI();
        this.saveToLocalStorage();
    }

    // 清空所有选择
    clearAll() {
        this.provinces.forEach(province => {
            province.selected = false;
        });
        this.refreshUI();
        this.saveToLocalStorage();
    }

    // 刷新整个UI
    refreshUI() {
        // 更新所有列表按钮
        this.provinces.forEach(province => {
            const btn = document.querySelector(`.province-btn[data-id="${province.id}"]`);
            if (btn) {
                if (province.selected) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            }
        });

        // 更新地图
        this.updateMapDisplay();
        this.updateStats();
    }

    // 保存到本地存储
    saveToLocalStorage() {
        try {
            const selectedIds = this.provinces
                .filter(p => p.selected)
                .map(p => p.id);
            localStorage.setItem('selectedProvinces', JSON.stringify(selectedIds));
        } catch (error) {
            console.error('保存到本地存储失败:', error);
        }
    }

    // 从本地存储加载
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('selectedProvinces');
            if (savedData) {
                const selectedIds = JSON.parse(savedData);
                this.provinces.forEach(province => {
                    province.selected = selectedIds.includes(province.id);
                });
            }
        } catch (error) {
            console.error('从本地存储加载失败:', error);
        }
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChinaMapApp();
});
