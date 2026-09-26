const modal = document.getElementById("bookingModal");
const nav = document.querySelector("nav");
const menuToggle = document.querySelector(".menu-toggle");
const dateInput = document.getElementById("dateInput");

menuToggle?.addEventListener("click", () => {
  nav.classList.toggle("show");
});


function openBooking(treatment = "") {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  if (treatment) {
    document.getElementById("treatmentSelect").value = treatment;
  }

  // Use local date
  const now = new Date();

  const localToday = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  dateInput.min = localToday;

  document.body.style.overflow = "hidden";
}


function closeBooking() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}


modal?.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeBooking();
  }
});


document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeBooking();
  }
});


// =====================================================
// GOOGLE APPS SCRIPT WEB APP
// =====================================================

const GOOGLE_SHEET_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzGvAyKXXwvM7ENhSpieodRhBWfcBzIWTOrkIC4N4GgerJP8I56XaeHolfujvRzoOElQw/exec";


// =====================================================
// APPOINTMENT FORM
// =====================================================

const bookingForm = document.getElementById("bookingForm");


if (bookingForm) {

  bookingForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const form = e.target;

    const submitButton =
      form.querySelector("button[type='submit']");


    // Check Google Apps Script URL
    if (!GOOGLE_SHEET_WEB_APP_URL) {

      alert(
        "The appointment system is not connected yet. Please configure the Google Apps Script Web App URL."
      );

      return;
    }


    // =================================================
    // GET FORM DATA
    // =================================================

    const name =
      form.elements.name.value.trim();

    const age =
      form.elements.age.value.trim();

    const treatment =
      form.elements.treatment.value;

    const appointmentDate =
      form.elements.date.value;

    const appointmentTime =
      form.elements.time.value;

    const message =
      form.elements.message.value.trim();


    // =================================================
    // VALIDATION
    // =================================================

    if (
      !name ||
      !age ||
      !treatment ||
      !appointmentDate ||
      !appointmentTime
    ) {

      alert(
        "Please fill in all required appointment details."
      );

      return;
    }


    // =================================================
    // DISABLE BUTTON
    // =================================================

    submitButton.disabled = true;

    submitButton.textContent =
      "Booking Appointment...";


    // =================================================
    // CREATE HIDDEN IFRAME
    // =================================================

    let iframe =
      document.getElementById(
        "googleSheetSubmitFrame"
      );


    if (!iframe) {

      iframe =
        document.createElement("iframe");

      iframe.id =
        "googleSheetSubmitFrame";

      iframe.name =
        "googleSheetSubmitFrame";

      iframe.style.display =
        "none";

      document.body.appendChild(iframe);
    }


    // =================================================
    // SAVE ORIGINAL FORM SETTINGS
    // =================================================

    const originalAction =
      form.getAttribute("action");

    const originalMethod =
      form.getAttribute("method");

    const originalTarget =
      form.getAttribute("target");


    // =================================================
    // SEND TO GOOGLE APPS SCRIPT
    // =================================================

    form.action =
      GOOGLE_SHEET_WEB_APP_URL;

    form.method =
      "POST";

    form.target =
      "googleSheetSubmitFrame";


    HTMLFormElement.prototype.submit.call(form);


    // =================================================
    // WHATSAPP MESSAGE
    // =================================================

    const whatsappMessage =

`*Appointment Request — Sri Rajarajeshwari Adhyathmika & Ayurveda Dhama*

Name: ${name}
Age: ${age}
Treatment: ${treatment}
Preferred Date: ${appointmentDate}
Preferred Time: ${appointmentTime}
Additional Message: ${message || "None"}

Please confirm the appointment.`;


    // =================================================
    // WAIT FOR GOOGLE SHEET SUBMISSION
    // =================================================

    setTimeout(() => {


      // =================================================
      // SUCCESS POPUP
      // =================================================

      alert(
        "Appointment booked successfully!\n\n" +
        "Your appointment details have been saved. " +
        "WhatsApp will now open to send the appointment details to the centre."
      );


      // =================================================
      // OPEN WHATSAPP
      // =================================================

      window.open(
        "https://wa.me/919606518096?text=" +
        encodeURIComponent(whatsappMessage),
        "_blank"
      );


      // =================================================
      // RESET FORM
      // =================================================

      form.reset();

      closeBooking();


      // =================================================
      // RESTORE ORIGINAL FORM SETTINGS
      // =================================================

      if (originalAction === null) {

        form.removeAttribute("action");

      } else {

        form.setAttribute(
          "action",
          originalAction
        );
      }


      if (originalMethod === null) {

        form.removeAttribute("method");

      } else {

        form.setAttribute(
          "method",
          originalMethod
        );
      }


      if (originalTarget === null) {

        form.removeAttribute("target");

      } else {

        form.setAttribute(
          "target",
          originalTarget
        );
      }


      // =================================================
      // ENABLE BUTTON AGAIN
      // =================================================

      submitButton.disabled = false;

      submitButton.textContent =
        "Send Appointment Request via WhatsApp →";


    }, 1500);

  });

}