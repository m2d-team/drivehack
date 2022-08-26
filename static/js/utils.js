function getDescriptionForRoad(road_data) {
    let road_desc = `<h2>В час пик на этой дороге:</h2>
                    ${road_data.id}
                    <h4>С востока на запад:</h4>
                    <p>${road_data.traffic_limit} машин в час, она загружена на ${Math.round((road_data.base_traffic / road_data.traffic_limit) * 100)}%</p>
                    <h4>С запада на восток:</h4>
                    <p>${road_data.traffic_limit} машин в час, она загружена на ${Math.round((road_data.base_traffic / road_data.traffic_limit) * 100)}%</p>`
    return road_desc
}


