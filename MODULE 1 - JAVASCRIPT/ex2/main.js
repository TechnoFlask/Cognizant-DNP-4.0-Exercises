console.log("Welcome to the Community Portal")

window.addEventListener("load", () => {
    alert("Page has finished loading. Welcome to our community!")
})

const eventName = "Web Development Workshop"
const eventDate = "March 15, 2024"
let availableSeats = 20

const updateEventDisplay = () => {
    const eventDetails = document.getElementById("eventDetails")
    const seatsInfo = document.getElementById("seatsInfo")

    eventDetails.innerHTML = `
        <h3>${eventName}</h3>
        <p>Date: ${eventDate}</p>
    `

    seatsInfo.textContent = `Available Seats: ${availableSeats}`
}

const handleRegistration = () => {
    if (availableSeats > 0) {
        availableSeats--
        updateEventDisplay()
        alert(`Registration successful! ${availableSeats} seats remaining.`)
    } else {
        alert("Sorry, the event is fully booked!")
        document.getElementById("registerBtn").disabled = true
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateEventDisplay()
    document
        .getElementById("registerBtn")
        .addEventListener("click", handleRegistration)
})
