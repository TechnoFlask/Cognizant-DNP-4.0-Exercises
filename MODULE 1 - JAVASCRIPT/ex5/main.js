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
            <h3>${this.name}</h3>
            <span class="event-status ${statusClass}">${statusText}</span>
            <p>${this.description}</p>
            <p>Date: ${this.date.toLocaleDateString()}</p>
            <p>Category: ${
                this.category.charAt(0).toUpperCase() + this.category.slice(1)
            }</p>
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

// Event Management System using closures and Event objects
const EventManager = (function () {
    // Private data using closure
    let events = [
        new Event({
            id: 1,
            name: "Web Development Workshop",
            date: "2024-03-15",
            seats: 20,
            category: "technology",
            description:
                "Learn modern web development techniques and best practices.",
            registrations: [],
        }),
        new Event({
            id: 2,
            name: "UI/UX Design Meetup",
            date: "2024-03-20",
            seats: 15,
            category: "design",
            description:
                "Explore the latest trends in user interface and experience design.",
            registrations: [],
        }),
        new Event({
            id: 3,
            name: "Business Networking",
            date: "2024-03-25",
            seats: 30,
            category: "business",
            description:
                "Connect with local entrepreneurs and business leaders.",
            registrations: [],
        }),
    ]

    // Registration tracking using closure
    const registrationTracker = (function () {
        const registrationsByCategory = {}

        return {
            addRegistration: function (category) {
                registrationsByCategory[category] =
                    (registrationsByCategory[category] || 0) + 1
                updateRegistrationStats()
            },
            getRegistrations: function (category) {
                return registrationsByCategory[category] || 0
            },
            getAllStats: function () {
                return registrationsByCategory
            },
        }
    })()

    // Higher-order function for filtering events
    const createEventFilter = (filterFn) => (events) => events.filter(filterFn)

    // Event filters using the higher-order function
    const filterByCategory = createEventFilter(
        (event) => event.category === currentCategory || currentCategory === ""
    )

    const filterBySearch = createEventFilter(
        (event) =>
            event.name
                .toLowerCase()
                .includes(currentSearchTerm.toLowerCase()) ||
            event.description
                .toLowerCase()
                .includes(currentSearchTerm.toLowerCase())
    )

    // Private variables for current filters
    let currentCategory = ""
    let currentSearchTerm = ""

    // Private function to generate unique ID
    const generateId = () => Math.max(...events.map((event) => event.id), 0) + 1

    // Private function to update stats display
    const updateRegistrationStats = () => {
        const statsContainer = document.getElementById("registrationStats")
        const stats = registrationTracker.getAllStats()

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

    // Public methods
    return {
        addEvent: function (eventData) {
            try {
                const newEvent = new Event({
                    ...eventData,
                    id: generateId(),
                })

                events.push(newEvent)
                this.displayEvents()
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
                    registrationTracker.addRegistration(event.category)
                    this.displayEvents()
                    return true
                }
            } catch (error) {
                displayError(error.message)
                return false
            }
        },

        filterEvents: function (category = "", searchTerm = "") {
            currentCategory = category
            currentSearchTerm = searchTerm
            this.displayEvents()
        },

        displayEvents: function () {
            const container = document.getElementById("eventsContainer")
            const noEventsMessage = document.getElementById("noEventsMessage")

            // Apply filters using composition of higher-order functions
            let filteredEvents = events
            filteredEvents = filterByCategory(filteredEvents)
            filteredEvents = filterBySearch(filteredEvents)

            container.innerHTML = ""

            if (filteredEvents.length === 0) {
                noEventsMessage.classList.remove("hidden")
                return
            }

            noEventsMessage.classList.add("hidden")
            container.innerHTML = filteredEvents
                .map((event) => event.toCardHTML())
                .join("")
        },
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
    // Simulating user data - in a real app, this would come from a form
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
    EventManager.displayEvents()

    document
        .getElementById("categoryFilter")
        .addEventListener("change", (e) => {
            EventManager.filterEvents(
                e.target.value,
                document.getElementById("searchInput").value
            )
        })

    document.getElementById("searchInput").addEventListener("input", (e) => {
        EventManager.filterEvents(
            document.getElementById("categoryFilter").value,
            e.target.value
        )
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
