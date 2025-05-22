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
        loadingSpinner: () => document.querySelector("#loadingSpinner"),
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
class Event {
    constructor({
        id,
        name,
        date,
        seats,
        category,
        description,
        registrations = [],
    }) {
        this.id = id
        this.name = name
        this.date = new Date(date)
        this.seats = parseInt(seats)
        this.category = category
        this.description = description
        this.registrations = registrations

        // Input validation
        if (isNaN(this.seats) || this.seats < 0) {
            throw new Error("Invalid number of seats")
        }
        if (!(this.date instanceof Date) || isNaN(this.date)) {
            throw new Error("Invalid date")
        }
    }

    checkAvailability() {
        return {
            hasSeats: this.seats > 0,
            remainingSeats: this.seats,
            isUpcoming: this.date > new Date(),
            registrationCount: this.registrations.length,
        }
    }

    register(userData) {
        const { hasSeats, isUpcoming } = this.checkAvailability()

        if (!hasSeats) {
            throw new Error("No seats available")
        }
        if (!isUpcoming) {
            throw new Error("Event has already passed")
        }
        if (this.registrations.some(({ email }) => email === userData.email)) {
            throw new Error("User already registered")
        }

        this.registrations.push(userData)
        this.seats--
        return true
    }

    createDetailItem(label, value) {
        const detailItem = DOM.create.element("div", { class: "detail-item" })

        const labelSpan = DOM.create.element("span", { class: "detail-label" })
        labelSpan.appendChild(DOM.create.textNode(`${label}:`))

        const valueSpan = DOM.create.element("span", { class: "detail-value" })
        valueSpan.appendChild(DOM.create.textNode(value))

        detailItem.appendChild(labelSpan)
        detailItem.appendChild(valueSpan)

        return detailItem
    }

    createEventCard() {
        const { hasSeats, remainingSeats, isUpcoming } =
            this.checkAvailability()
        const statusClass = hasSeats ? "status-available" : "status-full"
        const statusText = hasSeats
            ? `${remainingSeats} Seats Available`
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
            this.createDetailItem(
                "Total Registrations",
                this.registrations.length
            )
        )
        details.appendChild(
            this.createDetailItem(
                "Event Status",
                isUpcoming ? "Upcoming" : "Past"
            )
        )
        details.appendChild(
            this.createDetailItem("Available Seats", remainingSeats)
        )

        card.appendChild(details)

        // Add registration button with onclick handler
        if (hasSeats && isUpcoming) {
            const button = DOM.create.element("button", {
                class: "btn register-btn",
                onclick: `handleRegistration(${this.id})`,
            })
            button.appendChild(DOM.create.textNode("Register Now"))
            card.appendChild(button)
        }

        return card
    }

    formatEventName() {
        const categoryPrefixes = {
            music: "Concert:",
            food: "Workshop on",
            arts: "Art Class:",
            technology: "Tech Talk:",
            design: "Design Session:",
            business: "Business Seminar:",
        }

        const prefix = categoryPrefixes[this.category] || ""
        return prefix ? `${prefix} ${this.name}` : this.name
    }

    formatCategory() {
        return this.category.charAt(0).toUpperCase() + this.category.slice(1)
    }
}

// Event Management System using array methods and async operations
const EventManager = (() => {
    let events = []

    // API Functions with Promise-based implementation
    const api = {
        fetchEvents: async () => {
            try {
                const response = await fetch("api/events.json")
                if (!response.ok) {
                    throw new Error("Network response was not ok")
                }
                const { events } = await response.json()
                return events
            } catch (error) {
                console.error("Error fetching events:", error)
                throw error
            }
        },

        registerForEvent: async (eventId, userData) => {
            // Simulate API call with Promise
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const event = events.find(({ id }) => id === eventId)
                        if (!event) {
                            reject(new Error("Event not found"))
                            return
                        }

                        if (event.register(userData)) {
                            resolve({
                                success: true,
                                message: "Registration successful",
                            })
                        } else {
                            reject(new Error("Registration failed"))
                        }
                    } catch (error) {
                        reject(error)
                    }
                }, 1000) // Simulate network delay
            })
        },
    }

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
        return category
            ? [...events].filter((event) => event.category === category)
            : [...events]
    }

    const searchEvents = (term = "") => {
        const searchTerm = term.toLowerCase()
        return [...events].filter(
            ({ name, description }) =>
                name.toLowerCase().includes(searchTerm) ||
                description.toLowerCase().includes(searchTerm)
        )
    }

    const updateArrayInfo = () => {
        const totalEvents = events.length
        const availableEvents = events.filter(({ checkAvailability }) => {
            const { hasSeats, isUpcoming } = checkAvailability()
            return hasSeats && isUpcoming
        }).length
        const totalCapacity = events.reduce((sum, { seats }) => sum + seats, 0)

        const {
            totalEvents: totalEventsEl,
            availableEvents: availableEventsEl,
            totalCapacity: totalCapacityEl,
        } = DOM.get.arrayInfo
        DOM.update.text(totalEventsEl(), totalEvents)
        DOM.update.text(availableEventsEl(), availableEvents)
        DOM.update.text(totalCapacityEl(), totalCapacity)
    }

    // Registration tracking using array methods
    const registrationTracker = (() => {
        const getRegistrationsByCategory = () => {
            return events.reduce(
                (acc, { category, registrations }) => ({
                    ...acc,
                    [category]: (acc[category] || 0) + registrations.length,
                }),
                {}
            )
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

    // Display functions with loading state
    const showLoading = () => {
        const spinner = DOM.get.loadingSpinner()
        if (spinner) {
            DOM.update.removeClass(spinner, "hidden")
        }
    }

    const hideLoading = () => {
        const spinner = DOM.get.loadingSpinner()
        if (spinner) {
            DOM.update.addClass(spinner, "hidden")
        }
    }

    const displayEvents = () => {
        const container = DOM.get.eventsContainer()
        const noEventsMessage = DOM.get.noEventsMessage()
        const searchTerm = DOM.get.searchInput().value.toLowerCase()
        const category = DOM.get.categoryFilter().value

        // Clear existing events
        container.innerHTML = ""

        // Filter events
        let filteredEvents = [...events]
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

    // Initialize events with async/await
    const initializeEvents = async () => {
        try {
            showLoading()
            const eventData = await api.fetchEvents()
            events = eventData.map((data) => new Event(data))
            displayEvents()
        } catch (error) {
            displayError("Failed to load events. Please try again later.")
            console.error("Error initializing events:", error)
        } finally {
            hideLoading()
        }
    }

    // Public methods
    return {
        initialize: initializeEvents,
        addEvent: async (eventData) => {
            try {
                const newEvent = new Event({
                    ...eventData,
                    id: Math.max(...events.map(({ id }) => id), 0) + 1,
                })

                events.push(newEvent)
                displayEvents()
                return true
            } catch (error) {
                displayError(error.message)
                return false
            }
        },

        registerUser: async (eventId, userData) => {
            try {
                showLoading()
                const result = await api.registerForEvent(eventId, userData)
                displayEvents()
                return true
            } catch (error) {
                displayError(error.message)
                return false
            } finally {
                hideLoading()
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

// Form Validation Helper
const FormValidator = {
    errorMessages: {
        required: "This field is required",
        email: "Please enter a valid email address",
        minlength: (min) => `Must be at least ${min} characters`,
        pattern: {
            name: "Only letters and spaces are allowed",
            phone: "Please enter a valid 10-digit phone number",
        },
        terms: "You must accept the terms and conditions",
        date: "Please select a future date",
    },

    validateField: (field) => {
        const errorElement = document.querySelector(`[data-for="${field.id}"]`)
        let errorMessage = ""

        // Remove existing states
        field.closest(".form-group")?.classList.remove("success")

        // Check validity
        if (!field.checkValidity()) {
            if (field.validity.valueMissing) {
                errorMessage = FormValidator.errorMessages.required
            } else if (field.validity.typeMismatch && field.type === "email") {
                errorMessage = FormValidator.errorMessages.email
            } else if (field.validity.tooShort) {
                errorMessage = FormValidator.errorMessages.minlength(
                    field.minLength
                )
            } else if (field.validity.patternMismatch) {
                errorMessage =
                    FormValidator.errorMessages.pattern[field.name] ||
                    "Invalid format"
            }

            // Special case for terms checkbox
            if (field.type === "checkbox" && field.required && !field.checked) {
                errorMessage = FormValidator.errorMessages.terms
            }

            // Special case for date fields
            if (field.type === "date" && field.value) {
                const selectedDate = new Date(field.value)
                if (selectedDate < new Date()) {
                    errorMessage = FormValidator.errorMessages.date
                    field.setCustomValidity(errorMessage)
                } else {
                    field.setCustomValidity("")
                }
            }
        }

        if (errorMessage) {
            errorElement.textContent = errorMessage
            DOM.update.addClass(errorElement, "visible")
            return false
        } else {
            DOM.update.removeClass(errorElement, "visible")
            field.closest(".form-group")?.classList.add("success")
            return true
        }
    },

    validateForm: (form) => {
        let isValid = true
        const fields = form.elements

        for (let field of fields) {
            if (field.tagName === "BUTTON") continue
            if (!FormValidator.validateField(field)) {
                isValid = false
            }
        }

        return isValid
    },

    setupFormValidation: (form) => {
        const fields = form.elements

        // Add validation on blur for each field
        for (let field of fields) {
            if (field.tagName === "BUTTON") continue

            field.addEventListener("blur", () => {
                FormValidator.validateField(field)
            })

            // For instant validation on input
            field.addEventListener("input", () => {
                if (field.classList.contains("error")) {
                    FormValidator.validateField(field)
                }
            })
        }
    },
}

// Update Event Handlers
const handleRegistration = async (eventId) => {
    const form = document.getElementById("registrationForm")

    // Set the event ID in the hidden field
    document.getElementById("eventId").value = eventId

    // Reset form
    form.reset()

    // Scroll form into view
    form.scrollIntoView({ behavior: "smooth" })
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Initialize events from API
    EventManager.initialize()

    // Setup form validation for both forms
    const registrationForm = document.getElementById("registrationForm")
    const addEventForm = document.getElementById("addEventForm")

    FormValidator.setupFormValidation(registrationForm)
    FormValidator.setupFormValidation(addEventForm)

    // Registration form submission
    registrationForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        if (!FormValidator.validateForm(registrationForm)) {
            return
        }

        const formData = {
            eventId: parseInt(registrationForm.elements.eventId.value),
            name: registrationForm.elements.name.value,
            email: registrationForm.elements.email.value,
            phone: registrationForm.elements.phone.value,
        }

        if (await EventManager.registerUser(formData.eventId, formData)) {
            registrationForm.reset()
            alert("Registration successful!")
        }
    })

    // Add event form submission
    addEventForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        if (!FormValidator.validateForm(addEventForm)) {
            return
        }

        const formElements = addEventForm.elements
        const formData = {
            name: formElements.name.value,
            date: formElements.date.value,
            category: formElements.category.value,
            seats: formElements.seats.value,
            description: formElements.description.value,
        }

        if (await EventManager.addEvent(formData)) {
            addEventForm.reset()
        }
    })

    // Category filter (onchange event)
    DOM.get.categoryFilter().addEventListener("change", () => {
        EventManager.displayEvents()
    })

    // Quick search (keydown event)
    DOM.get.searchInput().addEventListener("keydown", () => {
        setTimeout(() => {
            EventManager.displayEvents()
        }, 0)
    })

    // Sort buttons
    document
        .getElementById("sortByDateBtn")
        .addEventListener("click", EventManager.sortByDate)
    document
        .getElementById("sortBySeatsBtn")
        .addEventListener("click", EventManager.sortBySeats)
})
