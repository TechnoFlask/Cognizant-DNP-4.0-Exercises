console.log("Welcome to the Community Portal")

window.addEventListener("load", () => {
    alert("Page has finished loading. Welcome to our community!")
})

// Event Management System using closures and higher-order functions
const EventManager = (function () {
    // Private data using closure
    let events = [
        {
            id: 1,
            name: "Web Development Workshop",
            date: "2024-03-15",
            seats: 20,
            category: "technology",
            description:
                "Learn modern web development techniques and best practices.",
            registrations: [],
        },
        {
            id: 2,
            name: "UI/UX Design Meetup",
            date: "2024-03-20",
            seats: 15,
            category: "design",
            description:
                "Explore the latest trends in user interface and experience design.",
            registrations: [],
        },
        {
            id: 3,
            name: "Business Networking",
            date: "2024-03-25",
            seats: 30,
            category: "business",
            description:
                "Connect with local entrepreneurs and business leaders.",
            registrations: [],
        },
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
    const createEventFilter = (filterFn) => {
        return (events) => events.filter(filterFn)
    }

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
    const generateId = () => {
        return Math.max(...events.map((event) => event.id), 0) + 1
    }

    // Private function to update stats display
    const updateRegistrationStats = () => {
        const statsContainer = document.getElementById("registrationStats")
        const stats = registrationTracker.getAllStats()

        statsContainer.innerHTML = Object.entries(stats)
            .map(
                ([category, count]) => `
            <div class="stat-card">
                <h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
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
                const newEvent = {
                    ...eventData,
                    id: generateId(),
                    registrations: [],
                    seats: parseInt(eventData.seats),
                }

                if (isNaN(newEvent.seats) || newEvent.seats <= 0) {
                    throw new Error("Invalid number of seats")
                }

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

                if (event.seats <= 0) {
                    throw new Error("No seats available")
                }

                if (
                    event.registrations.some(
                        (reg) => reg.email === userData.email
                    )
                ) {
                    throw new Error("User already registered")
                }

                event.registrations.push(userData)
                event.seats--
                registrationTracker.addRegistration(event.category)
                this.displayEvents()
                return true
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
            filteredEvents.forEach((event) => {
                container.appendChild(createEventCard(event))
            })
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

const createEventCard = (event) => {
    const card = document.createElement("div")
    card.className = "event-card"

    const hasSeats = event.seats > 0
    const statusClass = hasSeats ? "status-available" : "status-full"
    const statusText = hasSeats
        ? `${event.seats} Seats Available`
        : "Fully Booked"

    card.innerHTML = `
        <h3>${event.name}</h3>
        <span class="event-status ${statusClass}">${statusText}</span>
        <p>${event.description}</p>
        <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
        <p>Category: ${
            event.category.charAt(0).toUpperCase() + event.category.slice(1)
        }</p>
        ${
            hasSeats
                ? `
            <button class="btn" onclick="handleRegistration(${event.id})">
                Register Now
            </button>
        `
                : ""
        }
    `

    return card
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
