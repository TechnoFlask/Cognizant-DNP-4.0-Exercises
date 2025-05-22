console.log("Welcome to the Community Portal")

window.addEventListener("load", () => {
    alert("Page has finished loading. Welcome to our community!")
})

// DOM Helper Functions
const DOM = {
    // Query selectors for commonly used elements
    get: {
        container: () => document.querySelector(".container"),
        eventsContainer: () => document.querySelector("#eventsContainer"),
        noEventsMessage: () => document.querySelector("#noEventsMessage"),
        searchInput: () => document.querySelector("#searchInput"),
        categoryFilter: () => document.querySelector("#categoryFilter"),
        errorContainer: () => document.querySelector("#errorContainer"),
        registrationStats: () => document.querySelector("#registrationStats"),
        modal: () => document.querySelector("#addEventModal"),
        form: () => document.querySelector("#addEventForm"),
        arrayInfo: {
            totalEvents: () => document.querySelector("#totalEvents"),
            availableEvents: () => document.querySelector("#availableEvents"),
            totalCapacity: () => document.querySelector("#totalCapacity"),
        },
    },

    // Create DOM elements with attributes and properties
    create: {
        element: (tag, attributes = {}, properties = {}) => {
            const element = document.createElement(tag)
            Object.entries(attributes).forEach(([key, value]) => {
                element.setAttribute(key, value)
            })
            Object.entries(properties).forEach(([key, value]) => {
                element[key] = value
            })
            return element
        },

        textNode: (text) => document.createTextNode(text),
    },

    // Update element content and classes
    update: {
        text: (element, text) => {
            element.textContent = text
        },
        addClass: (element, className) => {
            element.classList.add(className)
        },
        removeClass: (element, className) => {
            element.classList.remove(className)
        },
        toggleClass: (element, className, force) => {
            element.classList.toggle(className, force)
        },
    },
}

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

Event.prototype.createDetailItem = function (label, value) {
    const detailItem = DOM.create.element("div", { class: "detail-item" })

    const labelSpan = DOM.create.element("span", { class: "detail-label" })
    labelSpan.appendChild(DOM.create.textNode(`${label}:`))

    const valueSpan = DOM.create.element("span", { class: "detail-value" })
    valueSpan.appendChild(DOM.create.textNode(value))

    detailItem.appendChild(labelSpan)
    detailItem.appendChild(valueSpan)

    return detailItem
}

Event.prototype.createEventCard = function () {
    const availability = this.checkAvailability()
    const statusClass = availability.hasSeats
        ? "status-available"
        : "status-full"
    const statusText = availability.hasSeats
        ? `${availability.remainingSeats} Seats Available`
        : "Fully Booked"

    // Create main card element
    const card = DOM.create.element("div", { class: "event-card" })

    // Create and append title
    const title = DOM.create.element("h3")
    title.appendChild(DOM.create.textNode(this.formatEventName()))
    card.appendChild(title)

    // Create and append status badge
    const status = DOM.create.element("span", {
        class: `event-status ${statusClass}`,
    })
    status.appendChild(DOM.create.textNode(statusText))
    card.appendChild(status)

    // Create and append description
    const description = DOM.create.element("p")
    description.appendChild(DOM.create.textNode(this.description))
    card.appendChild(description)

    // Create and append date
    const date = DOM.create.element("p")
    date.appendChild(
        DOM.create.textNode(`Date: ${this.date.toLocaleDateString()}`)
    )
    card.appendChild(date)

    // Create and append category
    const category = DOM.create.element("p")
    category.appendChild(
        DOM.create.textNode(`Category: ${this.formatCategory()}`)
    )
    card.appendChild(category)

    // Create and append details section
    const details = DOM.create.element("div", { class: "event-details" })

    // Add detail items
    details.appendChild(
        this.createDetailItem("Total Registrations", this.registrations.length)
    )
    details.appendChild(
        this.createDetailItem(
            "Event Status",
            availability.isUpcoming ? "Upcoming" : "Past"
        )
    )
    details.appendChild(
        this.createDetailItem("Available Seats", availability.remainingSeats)
    )

    card.appendChild(details)

    // Add registration button if available
    if (availability.hasSeats && availability.isUpcoming) {
        const button = DOM.create.element("button", {
            class: "btn",
            onclick: `handleRegistration(${this.id})`,
        })
        button.appendChild(DOM.create.textNode("Register Now"))
        card.appendChild(button)
    }

    return card
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
        displayEvents()
    }

    const sortBySeats = () => {
        events.sort((a, b) => b.seats - a.seats)
        displayEvents()
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

        DOM.update.text(DOM.get.arrayInfo.totalEvents(), totalEvents)
        DOM.update.text(DOM.get.arrayInfo.availableEvents(), availableEvents)
        DOM.update.text(DOM.get.arrayInfo.totalCapacity(), totalCapacity)
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
            const statsContainer = DOM.get.registrationStats()
            statsContainer.innerHTML = "" // Clear existing stats

            const stats = getRegistrationsByCategory()

            Object.entries(stats).forEach(([category, count]) => {
                const statCard = DOM.create.element("div", {
                    class: "stat-card",
                })

                const heading = DOM.create.element("h4")
                heading.appendChild(
                    DOM.create.textNode(
                        category.charAt(0).toUpperCase() + category.slice(1)
                    )
                )

                const value = DOM.create.element("div", { class: "stat-value" })
                value.appendChild(DOM.create.textNode(count))

                statCard.appendChild(heading)
                statCard.appendChild(value)
                statsContainer.appendChild(statCard)
            })
        }

        return { updateStats }
    })()

    // Display functions
    const displayEvents = () => {
        const container = DOM.get.eventsContainer()
        const noEventsMessage = DOM.get.noEventsMessage()
        const searchTerm = DOM.get.searchInput().value.toLowerCase()
        const category = DOM.get.categoryFilter().value

        // Clear existing events
        container.innerHTML = ""

        // Filter events
        let filteredEvents = events
        if (category) {
            filteredEvents = filterByCategory(category)
        }
        if (searchTerm) {
            filteredEvents = searchEvents(searchTerm)
        }

        if (filteredEvents.length === 0) {
            DOM.update.removeClass(noEventsMessage, "hidden")
            return
        }

        DOM.update.addClass(noEventsMessage, "hidden")

        // Create and append event cards
        filteredEvents.forEach((event) => {
            container.appendChild(event.createEventCard())
        })

        // Update statistics
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
                displayEvents()
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
                    displayEvents()
                    return true
                }
            } catch (error) {
                displayError(error.message)
                return false
            }
        },

        sortByDate,
        sortBySeats,
        displayEvents,
    }
})()

// UI Helper Functions
const displayError = (message) => {
    const errorContainer = DOM.get.errorContainer()
    errorContainer.textContent = message
    DOM.update.addClass(errorContainer, "visible")
    setTimeout(() => {
        DOM.update.removeClass(errorContainer, "visible")
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
    DOM.update.removeClass(DOM.get.modal(), "hidden")
}

const closeModal = () => {
    DOM.update.addClass(DOM.get.modal(), "hidden")
    DOM.get.form().reset()
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    EventManager.displayEvents()

    document.getElementById("categoryFilter").addEventListener("change", () => {
        EventManager.displayEvents()
    })

    document.getElementById("searchInput").addEventListener("input", () => {
        EventManager.displayEvents()
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
