const BASE_URL = "https://experimento-cognitivo-service.herokuapp.com";
var allData = [];
var firstInit = true;
var loaded = false;
var errData = [];
var countErrorSend = 0;

async function sendAllDataEnd() {
    if (countErrorSend < errData.length) {
        const result = await sendData(errData[countErrorSend]);
        if (result) {
            countErrorSend++;
        }
        return await sendAllDataEnd();
    }
}

async function sendData(data) {
    try {
        const userId = localStorage.getItem("userId");
        const response = await fetch(`${BASE_URL}/v1/experiment/webgazer/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "Application/json" },
            body: JSON.stringify(data)
        });
        if (response.status !== 204) {
            errData.push(data);
            return false;
            // setTimeout(async () => {
            //     await sendData(data);
            // }, 15000);
        } else {
            return true;
        }
    } catch (err) {
        errData.push(data);
        console.log(err);
        return false;
    }
}

let contador = 15;

function closeModal() {
    if (contador === 0) {
        const modal = document.querySelector('.modal');
        modal.setAttribute("class", "modal");
    }
}

function openModal() {
    const btnCloseModal = document.getElementById("btn-close-modal");
    const modal = document.querySelector('.modal');
    modal.setAttribute("class", "modal show");
    var intervalo = setInterval(() => {
        contador--;
        btnCloseModal.innerText = contador;
        if (contador === 0) {
            btnCloseModal.innerText = "X";
            clearInterval(intervalo);
        }
    }, 1000);
}

function myFunction() {
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}

async function endAndPass(element) {
    try {
        let nextPage = confirm("This is all information to answer the questions and you should not return to this page.\n Click OK to continue or cancel to stay on the page");
        if (nextPage) {
            element.setAttribute('disabled', "true");
            element.innerText = "Waiting...";
            await webgazer.end();
            await sendAllDataEnd();
            await sendData(allData);
            window.location.href = "questions.html";
        }
    } catch (err) {
        element.removeAttribute('disabled');
        element.innerText = "Continue";
        console.log(err);
    }
}

const loadWebgazer = setInterval(() => {
    try {
        if (webgazer) {
            loaded = true;
            clearInterval(loadWebgazer);
        }
    } catch (err) {
        //
    }
}, 100);


const event = new Event("dataReceived");

const loadItwbz = setInterval(() => {
    if (loaded) {
        clearInterval(loadItwbz);

        const loadInterval = setInterval(() => {
            if (webgazer.isReady()) {
                document.getElementById("load-div").setAttribute("hidden", "true");
                document.getElementById("main-div").removeAttribute("hidden");
                clearInterval(loadInterval);
            }
        }, 500);

        window.saveDataAcrossSessions = true;
        try {
            const width = webgazer.params.videoViewerWidth - (webgazer.params.videoViewerWidth * 20) / 100;
            const height = webgazer.params.videoViewerHeight - (webgazer.params.videoViewerHeight * 20) / 100;
            webgazer.setVideoViewerSize(width, height);
        } catch (err) {
            console.log("Resized")
        }

        webgazer.showVideoPreview(true) /* shows all video previews */
            .showPredictionPoints(false) /* shows a square every 100 milliseconds where current prediction is */
            .applyKalmanFilter(true); /* Kalman Filter defaults to on. Can be toggled by user. */

        webgazer.setGazeListener(function (data, elapsedTime) {
            if (data == null) {
                return;
            }
            if (firstInit) {
                firstInit = false;
                (async function () {
                    const params = new URL(window.location.href).searchParams;
                    const popupCentral = params.get('popupCentral');
                    const popupEmail = params.get('popupEmail');
                    if (popupCentral === "true") {
                        setTimeout(() => {
                            openModal();
                        }, 5000);
                    }
                    if (popupEmail === "true") {
                        setTimeout(() => {
                            myFunction();
                        }, 5000);
                    }
                })();
            }

            const { eyeFeatures, x, y } = data;
            const dataObject = { elapsedTime, eyeFeatures, x, y };
            const { right, left } = eyeFeatures;
            const newEyeFeature = {
                right: {
                    width: right.width,
                    height: right.height,
                    imagex: right.imagex,
                    imagey: right.imagey,
                },
                left: {
                    width: left.width,
                    height: left.height,
                    imagex: left.imagex,
                    imagey: left.imagey,
                }
            }
            allData.push({
                elapsedTime: elapsedTime,
                eyeFeatures: newEyeFeature,
                x: x,
                y: y
            });
            document.dispatchEvent(event);
        })
            .saveDataAcrossSessions(true)
            .begin();

        document.addEventListener('dataReceived', () => {
            if (allData.length >= 100) {
                sendData({ webgazer: allData });
                allData = [];
            }
        });

    }
}, 100);