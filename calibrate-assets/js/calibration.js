var PointCalibrate = 0;
var CalibrationPoints = {};

/**
 * Clear the canvas and the calibration button.
 */
function ClearCanvas() {
  $(".Calibration").hide();
  var canvas = document.getElementById("plotting_canvas");
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Show the instruction of using calibration at the start up screen.
 */
function PopUpInstruction() {
  ClearCanvas();
  ShowCalibrationPoint();

}
/**
  * Show the help instructions right at the start.
  */
function helpModalShow() {
  $('#helpModal').modal('show');
}

/**
 * Load this function when the index page starts.
* This function listens for button clicks on the html page
* checks that all buttons have been clicked 5 times each, and then goes on to measuring the precision
*/
$(document).ready(function () {
  ClearCanvas();
  helpModalShow();
  $(".Calibration").click(function () { // click event on the calibration buttons

    var id = $(this).attr('id');

    if (!CalibrationPoints[id]) { // initialises if not done
      CalibrationPoints[id] = 0;
    }
    CalibrationPoints[id]++; // increments values

    if (CalibrationPoints[id] == 5) { //only turn to yellow after 5 clicks
      $(this).css('background-color', 'yellow');
      $(this).prop('disabled', true); //disables the button
      PointCalibrate++;
    } else if (CalibrationPoints[id] < 5) {
      //Gradually increase the opacity of calibration points when click to give some indication to user.
      var opacity = 0.2 * CalibrationPoints[id] + 0.2;
      $(this).css('opacity', opacity);
    }

    //Show the middle calibration point after all other points have been clicked.
    if (PointCalibrate == 8) {
      $("#Pt5").show();
    }

    if (PointCalibrate >= 9) { // last point is calibrated
      //using jquery to grab every element in Calibration class and hide them except the middle point.
      $(".Calibration").hide();
      $("#Pt5").show();

      // clears the canvas
      var canvas = document.getElementById("plotting_canvas");
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

      // notification for the measurement process
      swal({
        title: "Última etapa",
        text: "Por favor, após clicar em OK não mova o mouse e olhe para o ponto do meio pelos próximos 5 segundos",
        closeOnEsc: false,
        allowOutsideClick: false,
        closeModal: true
      }).then(isConfirm => {

        // makes the variables true for 5 seconds & plots the points
        $(document).ready(function () {

          store_points_variable(); // start storing the prediction points

          sleep(5000).then(() => {
            stop_storing_points_variable(); // stop storing the prediction points
            var past50 = webgazer.getStoredPoints(); // retrieve the stored points
            var precision_measurement = calculatePrecision(past50);
            //var accuracyLabel = "<a>Accuracy | "+precision_measurement+"%</a>";
            //document.getElementById("Accuracy").innerHTML = accuracyLabel; // Show the accuracy in the nav bar.
            swal({
              title: `Calibração concluida com sucesso, clique em OK para iniciar o experimento.`,
              allowOutsideClick: false,
              buttons: {
                confirm: true
              }
            }).then(isConfirm => {
              sendForm();
              //window.location.href = "form.html"
            });
          });
        });
      });
    }
  });
});

/**
 * Show the Calibration Points
 */
function ShowCalibrationPoint() {
  $(".Calibration").show();
  $("#Pt5").hide(); // initially hides the middle button
}

async function sendForm() {
  const BASE_URL = "https://experimento-cognitivo-service.herokuapp.com";
  const bodyForm = { people: { gender: "", age: 0, title: 0, performance: 0, titration: "", university: "", experience: 0 } };
  const response = await fetch(`${BASE_URL}/v1/experiment`, {
    method: "POST",
    headers: { "Content-Type": "Application/json" },
    body: JSON.stringify(bodyForm)
  });
  if (response.status === 201) {
    const json = await response.json();
    const { id, page, popupCentral, popupEmail } = json;
    await localStorage.setItem("userId", id);
    window.location.href = `exp${page === 0 ? 4 : page}.html?popupCentral=${popupCentral}&popupEmail=${popupEmail}`;
  } else {
    setTimeout(async () => {
      await sendForm();
    }, 5000);
  }
}

/**
* This function clears the calibration buttons memory
*/
function ClearCalibration() {
  // Clear data from WebGazer

  $(".Calibration").css('background-color', 'red');
  $(".Calibration").css('opacity', 0.2);
  $(".Calibration").prop('disabled', false);

  CalibrationPoints = {};
  PointCalibrate = 0;
}

// sleep function because java doesn't have one, sourced from http://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
