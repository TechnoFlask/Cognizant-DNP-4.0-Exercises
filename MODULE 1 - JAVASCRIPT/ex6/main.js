console.log("Welcome to the Community Portal")

window.addEventListener("load", () => {
    alert("Page has finished loading. Welcome to our community!")
})

// Event Constructor and Prototype
function Event(data) {
    this.id = data.id
    this.name = data.name
    this.date = new Date(data.date)
    this.seats = parseInt(data.seats)
    this.category = data.category
    this.description = data.description
    this.registrations = data.registrations || []

    // Input validation
    if (isNaN(this.seats) || this.seats < 0) {
        throw new Error("Invalid number of seats")
    }
    if (!(this.date instanceof Date) || isNaN(this.date)) {
        throw new Error("Invalid date")
    }
}

// Event prototype methods
Event.prototype.checkAvailability = function () {
    return {
        hasSeats: this.seats > 0,
        remainingSeats: this.seats,
        isUpcoming: this.date > new Date(),
        registrationCount: this.registrations.length,
    }
}

Event.prototype.register = function (userData) {
    const availability = this.checkAvailability()

    if (!availability.hasSeats) {
        throw new Error("No seats available")
    }
    if (!availability.isUpcoming) {
        throw new Error("Event has already passed")
    }
    if (this.registrations.some((reg) => reg.email === userData.email)) {
        throw new Error("User already registered")
    }

    this.registrations.push(userData)
    this.seats--
    return true
}

Event.prototype.toCardHTML = function () {
    const availability = this.checkAvailability()
    const statusClass = availability.hasSeats
        ? "status-available"
        : "status-full"
    const statusText = availability.hasSeats
        ? `${availability.remainingSeats} Seats Available`
        : "Fully Booked"

    return `
        <div class="event-card">
            <h3>${this.formatEventName()}</h3>
            <span class="event-status ${statusClass}">${statusText}</span>
            <p>${this.description}</p>
            <p>Date: ${this.date.toLocaleDateString()}</p>
            <p>Category: ${this.formatCategory()}</p>
            <div class="event-details">
                ${Object.entries({
                    "Total Registrations": this.registrations.length,
                    "Event Status": availability.isUpcoming
                        ? "Upcoming"
                        : "Past",
                    "Available Seats": availability.remainingSeats,
                })
                    .map(
                        ([key, value]) => `
                    <div class="detail-item">
                        <span class="detail-label">${key}:</span>
                        <span class="detail-value">${value}</span>
                    </div>
                `
                    )
                    .join("")}
            </div>
            ${
                availability.hasSeats && availability.isUpcoming
                    ? `
                <button class="btn" onclick="handleRegistration(${this.id})">
                    Register Now
                </button>
            `
                    : ""
            }
        </div>
    `
}

Event.prototype.formatEventName = function () {
    const categoryPrefix =
        {
            music: "Concert:",
            food: "Workshop on",
            arts: "Art Class:",
            technology: "Tech Talk:",
            design: "Design Session:",
            business: "Business Seminar:",
        }[this.category] || ""

    return categoryPrefix ? `${categoryPrefix} ${this.name}` : this.name
}

Event.prototype.formatCategory = function () {
    return this.category.charAt(0).toUpperCase() + this.category.slice(1)
}

// Event Management System using array methods
const EventManager = (function () {
    // Initial events array
    let events = [
        new Event({
            id: 1,
            name: "Modern Web Development",
            date: "2024-03-15",
            seats: 20,
            category: "technology",
            description:
                "Learn modern web development techniques and best practices.",
            registrations: [],
        }),
        new Event({
            id: 2,
            name: "UI/UX Fundamentals",
            date: "2024-03-20",
            seats: 15,
            category: "design",
            description:
                "Explore the latest trends in user interface and experience design.",
            registrations: [],
        }),
        new Event({
            id: 3,
            name: "Networking Essentials",
            date: "2024-03-25",
            seats: 30,
            category: "business",
            description:
                "Connect with local entrepreneurs and business leaders.",
            registrations: [],
        }),
        new Event({
            id: 4,
            name: "Jazz Night",
            date: "2024-04-01",
            seats: 50,
            category: "music",
            description: "An evening of smooth jazz and great company.",
            registrations: [],
        }),
        new Event({
            id: 5,
            name: "Italian Cuisine",
            date: "2024-04-05",
            seats: 12,
            category: "food",
            description: "Learn to cook authentic Italian dishes.",
            registrations: [],
        }),
        new Event({
            id: 6,
            name: "Pottery Making",
            date: "2024-04-10",
            seats: 8,
            category: "arts",
            description:
                "Create beautiful ceramic pieces with expert guidance.",
            registrations: [],
        }),
    ]

    // Array Operations
    const sortByDate = () => {
        events.sort((a, b) => a.date - b.date)
        updateDisplay()
    }

    const sortBySeats = () => {
        events.sort((a, b) => b.seats - a.seats)
        updateDisplay()
    }

    const filterByCategory = (category) => {
        return events.filter((event) =>
            category ? event.category === category : true
        )
    }

    const searchEvents = (term) => {
        return events.filter(
            (event) =>
                event.name.toLowerCase().includes(term.toLowerCase()) ||
                event.description.toLowerCase().includes(term.toLowerCase())
        )
    }

    const updateArrayInfo = () => {
        const totalEvents = events.length
        const availableEvents = events.filter(
            (event) =>
                event.checkAvailability().hasSeats &&
                event.checkAvailability().isUpcoming
        ).length
        const totalCapacity = events.reduce(
            (sum, event) => sum + event.seats,
            0
        )

        document.getElementById("totalEvents").textContent = totalEvents
        document.getElementById("availableEvents").textContent = availableEvents
        document.getElementById("totalCapacity").textContent = totalCapacity
    }

    // Registration tracking using array methods
    const registrationTracker = (function () {
        const getRegistrationsByCategory = () => {
            return events.reduce((acc, event) => {
                acc[event.category] =
                    (acc[event.category] || 0) + event.registrations.length
                return acc
            }, {})
        }

        const updateStats = () => {
            const statsContainer = document.getElementById("registrationStats")
            const stats = getRegistrationsByCategory()

            statsContainer.innerHTML = Object.entries(stats)
                .map(
                    ([category, count]) => `
                    <div class="stat-card">
                        <h4>${
                            category.charAt(0).toUpperCase() + category.slice(1)
                        }</h4>
                        <div class="stat-value">${count}</div>
                    </div>
                `
                )
                .join("")
        }

        return { updateStats }
    })()

    // Display functions
    const updateDisplay = () => {
        const container = document.getElementById("eventsContainer")
        const noEventsMessage = document.getElementById("noEventsMessage")
        const searchTerm = document.getElementById("searchInput").value
        const category = document.getElementById("categoryFilter").value

        // Apply filters using array methods
        let filteredEvents = events
        if (category) {
            filteredEvents = filterByCategory(category)
        }
        if (searchTerm) {
            filteredEvents = searchEvents(searchTerm)
        }

        container.innerHTML = ""

        if (filteredEvents.length === 0) {
            noEventsMessage.classList.remove("hidden")
            return
        }

        noEventsMessage.classList.add("hidden")

        // Use map to create HTML for each event
        container.innerHTML = filteredEvents
            .map((event) => event.toCardHTML())
            .join("")

        // Update array information
        updateArrayInfo()
        registrationTracker.updateStats()
    }

    // Public methods
    return {
        addEvent: function (eventData) {
            try {
                const newEvent = new Event({
                    ...eventData,
                    id: Math.max(...events.map((e) => e.id), 0) + 1,
                })

                events.push(newEvent)
                updateDisplay()
                return true
            } catch (error) {
                displayError(error.message)
                return false
            }
        },

        registerUser: function (eventId, userData) {
            try {
                const event = events.find((e) => e.id === eventId)
                if (!event) {
                    throw new Error("Event not found")
                }

                if (event.register(userData)) {
                    updateDisplay()
                    return true
                }
            } catch (error) {
                displayError(error.message)
                return false
            }
        },

        sortByDate,
        sortBySeats,
        updateDisplay,
    }
})()

// UI Helper Functions
const displayError = (message) => {
    const errorContainer = document.getElementById("errorContainer")
    errorContainer.textContent = message
    errorContainer.classList.add("visible")
    setTimeout(() => {
        errorContainer.classList.remove("visible")
    }, 3000)
}

// Event Handlers
const handleRegistration = (eventId) => {
    const userData = {
        name: "Test User",
        email: `user${Date.now()}@example.com`,
    }

    EventManager.registerUser(eventId, userData)
}

const openModal = () => {
    document.getElementById("addEventModal").classList.remove("hidden")
}

const closeModal = () => {
    document.getElementById("addEventModal").classList.add("hidden")
    document.getElementById("addEventForm").reset()
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    EventManager.updateDisplay()

    document.getElementById("categoryFilter").addEventListener("change", () => {
        EventManager.updateDisplay()
    })

    document.getElementById("searchInput").addEventListener("input", () => {
        EventManager.updateDisplay()
    })

    document.getElementById("sortByDateBtn").addEventListener("click", () => {
        EventManager.sortByDate()
    })

    document.getElementById("sortBySeatsBtn").addEventListener("click", () => {
        EventManager.sortBySeats()
    })

    document.getElementById("addEventBtn").addEventListener("click", openModal)

    document.getElementById("addEventForm").addEventListener("submit", (e) => {
        e.preventDefault()

        const formData = {
            name: document.getElementById("eventName").value,
            date: document.getElementById("eventDate").value,
            category: document.getElementById("eventCategory").value,
            seats: document.getElementById("eventSeats").value,
            description: document.getElementById("eventDescription").value,
        }

        if (EventManager.addEvent(formData)) {
            closeModal()
        }
    })
})
