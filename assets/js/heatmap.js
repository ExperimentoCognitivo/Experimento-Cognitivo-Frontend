const BASE_URL = "https://experimento-cognitivo-service.onrender.com";

function sumValuesByCoordinates(data) {
    const result = {};

    data.forEach(obj => {
        const key = `${obj.x}-${obj.y}`;
        if (result[key]) {
            result[key].value += obj.value;
        } else {
            result[key] = { ...obj };
        }
    });

    return Object.values(result);
}

function findMaxValue(data) {
    let maxValue = -Infinity;

    data.forEach(obj => {
        if (obj.value > maxValue) {
            maxValue = obj.value;
        }
    });

    return maxValue;
}

const buildUrl = (pageNumber, popupCentral, popupEmail, main) => {
    let url = `${BASE_URL}/v1/experiment/heatmap/${pageNumber}`;

    if (main) {
        return url;
    }

    if (popupCentral && popupEmail) {
        document.getElementById("modal-infos").setAttribute("class", "modal show")
        document.getElementById("snackbar").setAttribute("class", "show")
        return [`${url}?popupCentral=true`, `${url}?popupEmail=true`]
    } else if (popupCentral) {
        document.getElementById("modal-infos").setAttribute("class", "modal show")
        url = `${url}?popupCentral=true`
    } else if (popupEmail) {
        document.getElementById("snackbar").setAttribute("class", "show")
        url = `${url}?popupEmail=true`
    } else {
        url = `${url}?popupCentral=false&popupEmail=false`
    }

    return url;
}

async function loadData(element, popupCentral, popupEmail, main) {
    element.setAttribute("disabled", "true");
    element.innerText = "Carregando..."
    const pageNumber = (window.location.href.split("/heatmaps/")[1]).replace("exp", "").replace(".html", "");
    const url = buildUrl(pageNumber, popupCentral, popupEmail, main)
    if (typeof (url) === 'string') {
        const response = await fetch(url);
        if (response.status === 200) {
            const data1 = await response.json();
            const points = data1.map(data => {
                if (data) {
                    if (data.x >= 0 && data.y >= 0) {
                        return {
                            x: parseInt(data.x),
                            y: parseInt(data.y),
                            value: 1
                        }
                    } else {
                        return { x: 999999, y: 999999 }
                    }
                } else {
                    return { x: 999999, y: 999999 }
                }
            }).filter(p => {
                return p.x != 999999 && p.y != 99999;
            });

            document.getElementById("load-div").setAttribute("hidden", "true");
            document.getElementById("main-div").removeAttribute("hidden");
            const container = document.getElementById("main-div");
            const heatmap = h337.create({ container, radius: 90 });

            const resultArray = sumValuesByCoordinates(points);
            const maxValue = findMaxValue(resultArray);

            heatmap.setData({ max: maxValue + 25, min: 0, data: resultArray })
        }
    } else {
        const response1 = await fetch(url[0]);
        const response2 = await fetch(url[1]);

        const data1 = await response1.json();
        const data2 = await response2.json();
        const points1 = data1.map(data => {
            if (data) {
                if (data.x >= 0 && data.y >= 0) {
                    return {
                        x: parseInt(data.x),
                        y: parseInt(data.y),
                        value: 1
                    }
                } else {
                    return { x: 999999, y: 999999 }
                }
            } else {
                return { x: 999999, y: 999999 }
            }
        }).filter(p => {
            return p.x != 999999 && p.y != 99999;
        });

        const points2 = data2.map(data => {
            if (data) {
                if (data.x >= 0 && data.y >= 0) {
                    return {
                        x: parseInt(data.x),
                        y: parseInt(data.y),
                        value: 1
                    }
                } else {
                    return { x: 999999, y: 999999 }
                }
            } else {
                return { x: 999999, y: 999999 }
            }
        }).filter(p => {
            return p.x != 999999 && p.y != 99999;
        });

        const points = points1.concat(points2)

        document.getElementById("load-div").setAttribute("hidden", "true");
        document.getElementById("main-div").removeAttribute("hidden");
        const container = document.getElementById("main-div");
        const heatmap = h337.create({ container, radius: 90 });

        const resultArray = sumValuesByCoordinates(points);
        const maxValue = findMaxValue(resultArray);

        heatmap.setData({ max: maxValue + 25, min: 0, data: resultArray })
    }
};