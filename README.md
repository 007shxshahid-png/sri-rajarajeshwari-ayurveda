# Sri Rajarajeshwari Ayurveda Website — LIVE Appointment System

This ZIP is connected to the new Google Sheet and the newly deployed Google Apps Script Web App.

Google Sheet ID:
`1yMesKTPyaTUd2pm3wihpU7SB3JtrqXYj`

Web App URL:
`https://script.google.com/macros/s/AKfycbzGvAyKXXwvM7ENhSpieodRhBWfcBzIWTOrkIC4N4GgerJP8I56XaeHolfujvRzoOElQw/exec`

## Use
1. Extract the ZIP.
2. Open `index.html` in a browser.
3. Open the appointment form.
4. Enter the patient's details and submit.
5. The details are posted to Google Apps Script and saved in the `Appointments` sheet.
6. WhatsApp opens with the same appointment request for confirmation.

The website uses a normal HTML form POST through a hidden iframe so the static website does not depend on browser CORS response handling.

## Appointment columns
Appointment ID, Taken On (Date), Taken On (Time), Taken Month, Taken Year, Appointment Date, Appointment Time, Appointment Month, Appointment Year, Patient Name, Age, Treatment, Additional Message, Status.
