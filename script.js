/* ================= LANGUAGE ================= */
function setLanguage(lang){
  localStorage.setItem("language", lang);
  window.location.href = "welcome.html";
}

function t(en, fil){
  return localStorage.getItem("language") === "fil" ? fil : en;
}

/* ================= TICKET ================= */
function saveTicket(e){
  e.preventDefault();
  console.log("DEBUG: saveTicket function started");

  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const address = document.getElementById("address").value;
  const email = document.getElementById("email").value;

  console.log("DEBUG: Form values - Name:", name, "Age:", age, "Address:", address, "Email:", email);

  if (!name || !age || !address || !email) {
    alert("Please fill in all fields");
    console.log("DEBUG: Form validation failed - fields empty");
    return;
  }

  const user = { name, age, address, email };
  localStorage.setItem("userData", JSON.stringify(user));
  console.log("DEBUG: User data saved to localStorage:", user);
  window.location.href = "service.html";
}

/* ================= SERVICE ================= */
function selectService(service, prefix){
  console.log("DEBUG: selectService called with service:", service);
  localStorage.setItem("serviceName", service);
  const id = prefix + Math.floor(1000 + Math.random() * 9000);
  localStorage.setItem("uniqueID", id);
  console.log("DEBUG: Service and ID saved:", service, id);
}

/* ================= SCHEDULE ================= */
document.addEventListener("DOMContentLoaded", () => {
  console.log("DEBUG: Schedule page loaded, initializing calendar and time slots");
  const calendar = document.getElementById("calendarDays");
  const timeGrid = document.getElementById("timeSlots");
  const monthLabel = document.getElementById("monthLabel");
  const nextBtn = document.querySelector(".next");

  if(!calendar || !timeGrid || !nextBtn) {
    console.log("DEBUG: Schedule elements missing, skipping initialization");
    return;
  }

  let selectedDate = null;
  let selectedTime = null;

  /* ===== AUTO ADD NEXT 14 DAYS ===== */
  const today = new Date();
  monthLabel.textContent = today.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  for(let i = 0; i < 14; i++){
    const d = new Date();
    d.setDate(today.getDate() + i);

    const btn = document.createElement("button");
    btn.className = "day";
    btn.textContent = d.getDate();
    btn.dataset.date = d.toDateString();

    btn.onclick = () => {
      document.querySelectorAll(".day").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedDate = btn.dataset.date;
      console.log("DEBUG: Date selected:", selectedDate);
    };

    calendar.appendChild(btn);
  }

  /* ===== TIME SLOTS ===== */
  const fullyBooked = ["10:00 AM", "2:00 PM"];

  for(let hour = 8; hour <= 18; hour++){
    const h = hour > 12 ? hour - 12 : hour;
    const p = hour >= 12 ? "PM" : "AM";
    const label = `${h}:00 ${p}`;

    const btn = document.createElement("button");
    btn.className = "time";
    btn.textContent = label;

    if(fullyBooked.includes(label)){
      btn.classList.add("disabled");
      btn.disabled = true;
    } else {
      btn.onclick = () => {
        document.querySelectorAll(".time").forEach(t => t.classList.remove("selected"));
        btn.classList.add("selected");
        selectedTime = label;
        console.log("DEBUG: Time selected:", selectedTime);
      };
    }

    timeGrid.appendChild(btn);
  }

  /* ===== CONTINUE ===== */
  nextBtn.onclick = () => {
    if(!selectedDate || !selectedTime){
      alert("Please select date and time");
      return;
    }

    localStorage.setItem("appointmentDate", selectedDate);
    localStorage.setItem("appointmentTime", selectedTime);
    console.log("DEBUG: Date and time saved:", selectedDate, selectedTime);
    window.location.href = "receipt.html";
  };
});

function loadReceipt(){
  console.log("DEBUG: loadReceipt function started");
  const title = document.getElementById("receiptTitle");
  const details = document.getElementById("receiptDetails");

  if (!title || !details) {
    console.log("DEBUG: Receipt elements not found");
    return;
  }

  const user = JSON.parse(localStorage.getItem("userData")) || {};
  const service = localStorage.getItem("serviceName") || "Not selected";
  const id = localStorage.getItem("uniqueID") || "Not generated";
  const date = localStorage.getItem("appointmentDate") || "Not selected";
  const time = localStorage.getItem("appointmentTime") || "Not selected";

  console.log("DEBUG: Retrieved data - User:", user, "Service:", service, "ID:", id, "Date:", date, "Time:", time);

  title.innerText = t(
    "Appointment Successful!",
    "Matagumpay ang Appointment!"
  );

  details.innerHTML = `
    <p><strong>Tracking ID:</strong> ${id}</p>
    <p><strong>Service:</strong> ${service}</p>
    <hr>
    <p><strong>Name:</strong> ${user.name || "Not provided"}</p>
    <p><strong>Age:</strong> ${user.age || "Not provided"}</p>
    <p><strong>Address:</strong> ${user.address || "Not provided"}</p>
    <p><strong>Email:</strong> ${user.email || "Not provided"}</p>
    <hr>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${time}</p>
  `;
}

function printReceipt(){
  window.print();
}

function newBooking(){
  localStorage.clear();
  console.log("DEBUG: localStorage cleared");
}