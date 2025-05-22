console.log("Welcome to the Community Portal")

window.addEventListener("load", () => {
    alert("Page has finished loading. Welcome to our community!")
})

const events = [
    {
        id: 1,
        name: "Web Development Workshop",
        date: "2024-03-15",
        seats: 20,
        description:
            "Learn modern web development techniques and best practices.",
    },
    {
        id: 2,
        name: "UI/UX Design Meetup",
        date: "2024-03-20",
        seats: 0,
        description:
            "Explore the latest trends in user interface and experience design.",
    },
    {
        id: 3,
        name: "JavaScript Fundamentals",
        date: "2024-03-25",
        seats: 15,
        description: "Master the basics of JavaScript programming.",
    },
    {
        id: 4,
        name: "Past Event",
        date: "2024-01-15",
        seats: 10,
        description: "This event has already taken place.",
    },
]

const displayError = (message) => {
    const errorContainer = document.getElementById("errorContainer")
    errorContainer.textContent = message
    errorContainer.classList.add("visible")
    setTimeout(() => {
        errorContainer.classList.remove("visible")
    }, 3000)
}

const isEventValid = (event) => {
    const eventDate = new Date(event.date)
    const now = new Date()
    return eventDate > now
}

const createEventCard = (event) => {
    const card = document.createElement("div")
    card.className = "event-card"

    const eventDate = new Date(event.date)
    const isUpcoming = isEventValid(event)
    const hasSeats = event.seats > 0

    let statusClass = "status-past"
    let statusText = "Past Event"

    if (isUpcoming) {
        statusClass = hasSeats ? "status-available" : "status-full"
        statusText = hasSeats
            ? `${event.seats} Seats Available`
            : "Fully Booked"
    }

    card.innerHTML = `
        <h3>${event.name}</h3>
        <span class="event-status ${statusClass}">${statusText}</span>
        <p>${event.description}</p>
        <p>Date: ${eventDate.toLocaleDateString()}</p>
        <button class="btn" 
            ${!isUpcoming || !hasSeats ? "disabled" : ""}
            onclick="handleRegistration(${event.id})">
            Register Now
        </button>
    `

    return card
}

const handleRegistration = (eventId) => {
    try {
        const event = events.find((e) => e.id === eventId)
        if (!event) {
            throw new Error("Event not found")
        }

        if (!isEventValid(event)) {
            throw new Error("Cannot register for past events")
        }

        if (event.seats <= 0) {
            throw new Error("No seats available")
        }

        event.seats--
        displayEvents()
        alert(`Successfully registered for ${event.name}!`)
    } catch (error) {
        displayError(error.message)
    }
}

const displayEvents = () => {
    const container = document.getElementById("eventsContainer")
    const noEventsMessage = document.getElementById("noEventsMessage")
    container.innerHTML = ""

    const upcomingEvents = events.filter(isEventValid)

    if (upcomingEvents.length === 0) {
        noEventsMessage.classList.remove("hidden")
        return
    }

    noEventsMessage.classList.add("hidden")
    upcomingEvents.forEach((event) => {
        container.appendChild(createEventCard(event))
    })
}

document.addEventListener("DOMContentLoaded", displayEvents)
