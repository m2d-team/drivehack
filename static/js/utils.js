function getDescriptionForRoad(road_data) {
    let to_center_diff = road_data.direction == 0 ? 0 : road_data.additional_traffic;
    let from_center_diff = road_data.direction == 0 ? road_data.additional_traffic : 0;

    let road_desc = `<h2>В час пик на этой дороге (id=${road_data.id}):</h2>
                    ${road_data.direction === 0 ? 'Люди едут из цента' : 'люди едут в центр'}
                    <h4>С востока на запад:</h4>
                    <p>${road_data.traffic_limit} машин в час, она загружена на ${Math.round(((road_data.base_traffic + to_center_diff) / road_data.traffic_limit) * 100)}%</p>
                    <h4>С запада на восток:</h4>
                    <p>${road_data.traffic_limit} машин в час, она загружена на ${Math.round(((road_data.base_traffic + from_center_diff) / road_data.traffic_limit) * 100)}%</p>`
    return road_desc
}


