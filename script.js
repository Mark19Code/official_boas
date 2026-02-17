/* ================= LANGUAGE ================= */
function setLanguage(lang){
  localStorage.setItem("language", lang);
}

function t(en, fil){
  return localStorage.getItem("language") === "fil" ? fil : en;
}

/* ================= SAVE PERSONAL INFO ================= */
function saveTicket(e){
  e.preventDefault();

  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const address = document.getElementById("address").value;
  const email = document.getElementById("email").value;

  if (!name || !age || !address || !email) {
    alert("Please fill in all fields");
    return;
  }

  const user = { name, age, address, email };
  localStorage.setItem("userData", JSON.stringify(user));
  window.location.href = "service.html";
}

/* ================= SELECT SERVICE ================= */
function selectService(service, prefix){
  localStorage.setItem("serviceName", service);
  const id = prefix + Math.floor(1000 + Math.random() * 9000);
  localStorage.setItem("uniqueID", id);
}

/* ================= SCHEDULE PAGE ================= */
document.addEventListener("DOMContentLoaded", () => {

  const calendar = document.getElementById("calendarDays");
  const timeGrid = document.getElementById("timeSlots");
  const monthLabel = document.getElementById("monthLabel");
  const nextBtn = document.querySelector(".next");

  if(!calendar || !timeGrid || !nextBtn) return;

  let selectedDate = null;
  let selectedTime = null;
  let fullyBookedTimes = [];

  const today = new Date();

  monthLabel.textContent = today.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  // CREATE NEXT 14 DAYS
  for(let i = 0; i < 14; i++){
    const d = new Date();
    d.setDate(today.getDate() + i);

    const btn = document.createElement("button");
    btn.className = "day";
    btn.textContent = d.getDate();
    btn.dataset.date = d.toISOString().split("T")[0];

    btn.onclick = async () => {
      document.querySelectorAll(".day").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");

      selectedDate = btn.dataset.date;

      const res = await fetch(`http://localhost:3000/api/booked-times?date=${selectedDate}`);
      fullyBookedTimes = await res.json();

      renderTimes();
    };

    calendar.appendChild(btn);
  }

  function renderTimes() {
    timeGrid.innerHTML = "";

    for (let hour = 8; hour <= 17; hour++) {
      const display = hour > 12 ? hour - 12 : hour;
      const period = hour >= 12 ? "PM" : "AM";
      const label = `${display}:00 ${period}`;

      const btn = document.createElement("button");
      btn.className = "time";
      btn.textContent = label;

      if (fullyBookedTimes.includes(label)) {
        btn.classList.add("disabled");
        btn.disabled = true;
      } else {
        btn.onclick = () => {
          document.querySelectorAll(".time").forEach(t => t.classList.remove("selected"));
          btn.classList.add("selected");
          selectedTime = label;
        };
      }

      timeGrid.appendChild(btn);
    }
  }

  // CONTINUE BUTTON
  nextBtn.onclick = async () => {

    if (!selectedDate || !selectedTime) {
      alert("Please select date and time");
      return;
    }

    const user = JSON.parse(localStorage.getItem("userData"));
    const service = localStorage.getItem("serviceName");

    const res = await fetch("http://localhost:3000/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user.name,
        service,
        date: selectedDate,
        time: selectedTime
      })
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message);
      return;
    }

    localStorage.setItem("appointmentDate", selectedDate);
    localStorage.setItem("appointmentTime", selectedTime);

    window.location.href = "receipt.html";
  };
});

/* ================= RECEIPT ================= */
function loadReceipt(){

  const title = document.getElementById("receiptTitle");
  const details = document.getElementById("receiptDetails");

  if (!title || !details) return;

  const user = JSON.parse(localStorage.getItem("userData")) || {};
  const service = localStorage.getItem("serviceName");
  const id = localStorage.getItem("uniqueID");
  const date = localStorage.getItem("appointmentDate");
  const time = localStorage.getItem("appointmentTime");

  title.innerText = "Appointment Successful!";

  details.innerHTML = `
    <p><strong>Tracking ID:</strong> ${id}</p>
    <p><strong>Service:</strong> ${service}</p>
    <hr>
    <p><strong>Name:</strong> ${user.name}</p>
    <p><strong>Age:</strong> ${user.age}</p>
    <p><strong>Address:</strong> ${user.address}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <hr>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${time}</p>
  `;
}

function newBooking(){
  localStorage.clear();
}
