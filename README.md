# GPA Tracker Web Application

A modern, intuitive, and feature-rich GPA and CGPA calculator tailored for students, educators, and institutions. The GPA Tracker supports both 4-point and 5-point grading systems and provides tools for managing academic records, exporting data, and navigating seamlessly across devices.

---

## 🌟 Features

### Core Calculation

#### GPA Calculator

* Supports both **5-point** and **4-point** grading scales
* **Dynamic course entry**: Input course name, credit units, and grade
* **Real-time GPA calculation**
* Unlimited course entry support
* Full **input validation** to prevent incorrect calculations

#### CGPA Calculator

* Input and track **previous CGPA and credit units**
* **Multiple semester management**
* Real-time CGPA updates based on cumulative data
* Compatible with different grading scales

---

### Data Management

#### Course Management

* Add and remove unlimited courses
* Edit course name, credit units, and grades
* Visual counter showing total courses added

#### Semester Management

* Add and remove multiple semesters
* Edit semester GPA and credit units
* Visual semester counter for easy tracking

#### Data Persistence

* Auto-save feature using **browser cookies**
* Data recovery on page reload
* Manual clear/reset options for GPA and CGPA data

---

### Document Features

#### PDF Export

* Export both GPA and CGPA calculations to **professionally formatted PDFs**
* Includes **PDF preview** before download
* PDFs come with **watermarks**, **date**, and **page numbers**

#### Transcript Processing

* Upload transcripts in **PDF** or **image** formats
* **Auto extraction** of course data from uploaded documents
* File preview and multi-format support
* Compatibility mode for PDF-only uploads

---

### User Interface

#### Responsive Design

* Fully mobile-friendly and desktop-optimized
* Adaptive layout for various screen sizes
* Easy mobile navigation for switching between sections

#### Theme Support

* **Light**, **dark**, and **system-detected** modes
* Theme toggle dropdown with **smooth transitions**

#### Visual Feedback

* Animated section transitions
* Loading screen during initialization
* Toast notifications for key actions
* Real-time validation and **highlighting for invalid or new entries**

---

### Accessibility

* Full support for **screen readers**
* Keyboard navigation compatibility
* ARIA attributes integrated in interactive elements
* Proper **focus management** and semantic structure

---

### Navigation & Help

#### Navigation

* Section switching for GPA and CGPA
* Scroll-to-top button
* Smooth scrolling and mobile menu

#### Feature Tour

* Guided tour showcasing all app features
* Step-by-step instruction walkthrough
* Keyboard shortcuts for navigation
* Smart onboarding for **first-time users**

---

### Additional Features

#### Error Handling

* Form validation with **clear error messages**
* Graceful error fallback system
* User-friendly and developer-focused logging

#### Performance Optimization

* Component lazy loading
* Optimized rendering with **React**
* Debounced events for scrolling and resizing
* Efficient and fast PDF generation

#### Visual Design

* Clean, modern interface
* Unified color scheme and typography
* Grid-based layout with animations

#### Cookie Management

* Cookie consent management
* Cookie-based persistent storage
* Cookie expiration handling

---

## 🚀 Getting Started

1. **Clone this repo**

```bash
git clone https://github.com/belovedafolabi/bfa-cgpa.git
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the application**

```bash
npm run dev
```

---

## 💡 Tech Stack

* React (v18+)
* TypeScript
* Tailwind CSS
* jsPDF for PDF exports
* Tesseract.js for OCR (transcript extraction)
* Cookie-based local persistence

---

## ✅ License

This project is open-source and available under the [MIT License](LICENSE).

---

**Built with ❤️ by BFA, for students.**
