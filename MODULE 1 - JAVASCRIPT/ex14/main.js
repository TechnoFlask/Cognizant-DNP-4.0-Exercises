console.log("Welcome to the Community Portal")

$(document).ready(() => {
    // Replace window.load alert with jQuery fadeIn
    $('<div class="welcome-message">Welcome to our community!</div>')
        .hide()
        .appendTo("body")
        .fadeIn(1000)
        .delay(2000)
        .fadeOut(1000, function () {
            $(this).remove()
        })
})

// DOM Helper Functions with jQuery
const DOM = {
    // Query selectors using jQuery
    get: {
        container: () => $(".container"),
        eventsContainer: () => $("#eventsContainer"),
        noEventsMessage: () => $("#noEventsMessage"),
        searchInput: () => $("#searchInput"),
        categoryFilter: () => $("#categoryFilter"),
        errorContainer: () => $("#errorContainer"),
        registrationStats: () => $("#registrationStats"),
        modal: () => $("#addEventModal"),
        form: () => $("#addEventForm"),
        loadingSpinner: () => $("#loadingSpinner"),
        arrayInfo: {
            totalEvents: () => $("#totalEvents"),
            availableEvents: () => $("#availableEvents"),
            totalCapacity: () => $("#totalCapacity"),
        },
    },

    // Create DOM elements with jQuery
    create: {
        element: (tag, attributes = {}, properties = {}) => {
            const $element = $(`<${tag}>`)
            $element.attr(attributes).prop(properties)
            return $element[0] // Return DOM element for compatibility
        },

        textNode: (text) => document.createTextNode(text),
    },

    // Update element content and classes with jQuery
    update: {
        text: (element, text) => {
            $(element).text(text)
        },
        addClass: (element, className) => {
            $(element).addClass(className)
        },
        removeClass: (element, className) => {
            $(element).removeClass(className)
        },
        toggleClass: (element, className, force) => {
            $(element).toggleClass(className, force)
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

        // Create card with jQuery
        const $card = $("<div>").addClass("event-card").hide() // Hide initially for animation

        // Create and append title
        $("<h3>").text(this.formatEventName()).appendTo($card)

        // Create and append status badge
        $("<span>")
            .addClass(`event-status ${statusClass}`)
            .text(statusText)
            .appendTo($card)

        // Create and append description
        $("<p>").text(this.description).appendTo($card)

        // Create and append date
        $("<p>").text(`Date: ${this.date.toLocaleDateString()}`).appendTo($card)

        // Create and append category
        $("<p>").text(`Category: ${this.formatCategory()}`).appendTo($card)

        // Create and append details section
        const $details = $("<div>").addClass("event-details")

        // Add detail items
        this.appendDetailItem(
            $details,
            "Total Registrations",
            this.registrations.length
        )
        this.appendDetailItem(
            $details,
            "Event Status",
            isUpcoming ? "Upcoming" : "Past"
        )
        this.appendDetailItem($details, "Available Seats", remainingSeats)

        $card.append($details)

        // Add registration button with jQuery click handler
        if (hasSeats && isUpcoming) {
            $("<button>")
                .addClass("btn register-btn")
                .text("Register Now")
                .on("click", () => handleRegistration(this.id))
                .appendTo($card)
        }

        // Fade in the card
        setTimeout(() => $card.fadeIn(500), Math.random() * 500)

        return $card[0] // Return DOM element for compatibility
    }

    appendDetailItem($container, label, value) {
        const $item = $("<div>").addClass("detail-item")
        $("<span>").addClass("detail-label").text(`${label}:`).appendTo($item)
        $("<span>").addClass("detail-value").text(value).appendTo($item)
        $container.append($item)
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

// API Service for handling all HTTP requests
const ApiService = {
    baseUrl: "api",
    endpoints: {
        events: "/events.json",
        responses: "/endpoints.json",
    },
    mockDelay: 1000, // Simulate network delay

    async fetchEndpoints() {
        try {
            const response = await fetch(
                `${this.baseUrl}${this.endpoints.responses}`
            )
            if (!response.ok) throw new Error("Failed to load API endpoints")
            return await response.json()
        } catch (error) {
            console.error("Error loading endpoints:", error)
            throw error
        }
    },

    async simulateResponse(type, success = true) {
        try {
            const endpoints = await this.fetchEndpoints()
            const response =
                endpoints.responses[type][success ? "success" : "error"]

            // Add dynamic data
            if (success) {
                if (type === "registration") {
                    response.data.confirmationId += Math.random()
                        .toString(36)
                        .substring(2, 8)
                        .toUpperCase()
                } else if (type === "event") {
                    response.data.eventId = Math.floor(Math.random() * 1000) + 1
                }
                response.data.timestamp = new Date().toISOString()
            }

            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (success) {
                        resolve(response)
                    } else {
                        reject(response)
                    }
                }, this.mockDelay)
            })
        } catch (error) {
            throw error
        }
    },

    async registerUser(eventId, userData) {
        try {
            // Simulate validation
            if (Math.random() > 0.7) {
                // 30% chance of failure for demo
                throw await this.simulateResponse("registration", false)
            }

            const response = await this.simulateResponse("registration", true)
            return response
        } catch (error) {
            throw error
        }
    },

    async createEvent(eventData) {
        try {
            // Simulate validation
            if (Math.random() > 0.8) {
                // 20% chance of failure for demo
                throw await this.simulateResponse("event", false)
            }

            const response = await this.simulateResponse("event", true)
            return response
        } catch (error) {
            throw error
        }
    },
}

// UI Feedback Helper
const UiFeedback = {
    types: {
        SUCCESS: "success",
        ERROR: "error",
        INFO: "info",
    },

    show(message, type = "info", duration = 3000) {
        const $container = $("<div>")
            .addClass(`feedback-message ${type}`)
            .text(message)
            .appendTo("body")
            .hide()

        $container
            .fadeIn(300)
            .delay(duration)
            .fadeOut(300, function () {
                $(this).remove()
            })
    },

    showLoading(message = "Processing...") {
        const $spinner = DOM.get.loadingSpinner()
        $spinner.find("p").text(message)
        $spinner.fadeIn(300)
    },

    hideLoading() {
        DOM.get.loadingSpinner().fadeOut(300)
    },
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
            try {
                UiFeedback.showLoading("Processing registration...")
                const response = await ApiService.registerUser(
                    eventId,
                    userData
                )
                UiFeedback.show(
                    `Registration successful! Confirmation ID: ${response.data.confirmationId}`,
                    UiFeedback.types.SUCCESS,
                    5000
                )
                return response
            } catch (error) {
                const message = error.errors ? error.errors[0] : error.message
                UiFeedback.show(message, UiFeedback.types.ERROR)
                throw error
            } finally {
                UiFeedback.hideLoading()
            }
        },

        createEvent: async (eventData) => {
            try {
                UiFeedback.showLoading("Creating event...")
                const response = await ApiService.createEvent(eventData)
                UiFeedback.show(
                    `Event created successfully! Event ID: ${response.data.eventId}`,
                    UiFeedback.types.SUCCESS,
                    5000
                )
                return response
            } catch (error) {
                const message = error.errors ? error.errors[0] : error.message
                UiFeedback.show(message, UiFeedback.types.ERROR)
                throw error
            } finally {
                UiFeedback.hideLoading()
            }
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
                const response = await api.createEvent(eventData)
                const newEvent = new Event({
                    ...eventData,
                    id: response.data.eventId,
                })

                events.push(newEvent)
                displayEvents()
                return true
            } catch (error) {
                return false
            }
        },

        registerUser: async (eventId, userData) => {
            try {
                const response = await api.registerForEvent(eventId, userData)
                const event = events.find(({ id }) => id === eventId)
                if (event) {
                    event.register(userData)
                    displayEvents()
                }
                return true
            } catch (error) {
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
        const $field = $(field)
        const $errorElement = $(`[data-for="${field.id}"]`)
        let errorMessage = ""

        // Remove existing states
        $field.closest(".form-group").removeClass("success")

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

            if (field.type === "checkbox" && field.required && !field.checked) {
                errorMessage = FormValidator.errorMessages.terms
            }

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
            $errorElement.text(errorMessage).addClass("visible")
            return false
        } else {
            $errorElement.removeClass("visible")
            $field.closest(".form-group").addClass("success")
            return true
        }
    },

    validateForm: (form) => {
        let isValid = true
        const $fields = $(form).find(":input").not(":button")

        $fields.each(function () {
            if (!FormValidator.validateField(this)) {
                isValid = false
            }
        })

        return isValid
    },

    setupFormValidation: (form) => {
        const $fields = $(form).find(":input").not(":button")

        $fields.each(function () {
            $(this)
                .on("blur", () => FormValidator.validateField(this))
                .on("input", function () {
                    if ($(this).hasClass("error")) {
                        FormValidator.validateField(this)
                    }
                })
        })
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
$(document).ready(() => {
    // Initialize events
    EventManager.initialize()

    // Setup form validation
    const $registrationForm = $("#registrationForm")
    const $addEventForm = $("#addEventForm")

    FormValidator.setupFormValidation($registrationForm[0])
    FormValidator.setupFormValidation($addEventForm[0])

    // Registration form submission
    $registrationForm.on("submit", async (e) => {
        e.preventDefault()

        if (!FormValidator.validateForm(e.target)) {
            return
        }

        const formData = {
            eventId: parseInt($("#eventId").val()),
            name: $("#regName").val(),
            email: $("#regEmail").val(),
            phone: $("#regPhone").val(),
        }

        if (await EventManager.registerUser(formData.eventId, formData)) {
            $registrationForm[0].reset()
            UiFeedback.show(
                "Registration successful!",
                UiFeedback.types.SUCCESS
            )
        }
    })

    // Add event form submission
    $addEventForm.on("submit", async (e) => {
        e.preventDefault()

        if (!FormValidator.validateForm(e.target)) {
            return
        }

        const formData = {
            name: $("#eventName").val(),
            date: $("#eventDate").val(),
            category: $("#eventCategory").val(),
            seats: $("#eventSeats").val(),
            description: $("#eventDescription").val(),
        }

        if (await EventManager.addEvent(formData)) {
            $addEventForm[0].reset()
        }
    })

    // Category filter
    $("#categoryFilter").on("change", () => {
        EventManager.displayEvents()
    })

    // Quick search with debounce
    let searchTimeout
    $("#searchInput").on("input", () => {
        clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
            EventManager.displayEvents()
        }, 300)
    })

    // Sort buttons
    $("#sortByDateBtn").on("click", EventManager.sortByDate)
    $("#sortBySeatsBtn").on("click", EventManager.sortBySeats)
})
