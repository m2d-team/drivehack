function getDescriptionForRoad(road_data) {
    let load = Math.round(((road_data.base_traffic + (road_data.additional_traffic === undefined ? 0 : road_data.additional_traffic)) / road_data.traffic_limit) * 100);
    let road_desc = `В час пик на этой дороге (id=${road_data.id}) ${road_data.traffic_limit} машин ${road_data.direction === 0 ? 'могут ехать из центра' : 'могут ехать в центр'} в час
                     Она загружена на ${load}%
                     `

    if (road_data.additional_traffic) {
        road_desc += `\nЭто увеличит траффик на ${Math.round(road_data.base_traffic / road_data.additional_traffic * 100)}% `
    }
    return road_desc
}


