# 🏥 MediChalo: Your Health, Delivered in a Flash

## 🚀 Project Overview

**MediChalo** is an advanced, full-stack, **role-based health-tech web application** built to revolutionize **hyperlocal medicine delivery**.  
It seamlessly connects **Customers, Pharmacies, and Delivery Partners** within an intelligent ecosystem, ensuring **fast, secure, and reliable access** to essential medicines.

From **AI-powered prescription validation** and **real-time order tracking** to **optimized logistics** and **secure digital payments**, MediChalo provides an end-to-end healthcare delivery experience.

🔗 **Live Application:** [MediChalo Deployment Link](https://your-deployment-link.com)

---

## ✨ Key Features & Differentiators

MediChalo leverages **modern technologies** to deliver a superior and efficient user experience:

- 🕐 **24/7 Ordering & Availability** – Order medicines anytime, anywhere.  
- 🤖 **AI Prescription Validation** – Instantly digitize and verify uploaded prescriptions.  
- 🗺️ **Live Order Tracking** – Real-time map-based tracking for both customers and delivery partners.  
- 💳 **Secure & Diverse Payments** – Supports **COD**, **UPI**, and **Card payments** via **Stripe**.  
- 📦 **Real-Time Inventory & Alerts** – Pharmacies get low-stock and expiry notifications.  
- 🔐 **Verified Delivery (OTP)** – Secure OTP-based confirmation ensures safe delivery.  
- ⏱️ **Dynamic ETA Calculation** – Smart delivery time estimates based on live data.  
- 🚴 **Optimized Logistics Engine** – Fair dispatch algorithm and intelligent order routing.  
- 🧾 **Automated Invoicing** – Customers can download digital PDF invoices.  
- 🧠 **Supply Chain Verification (Future)** – Planned blockchain integration for authenticity validation.  
- 👤 **Role-Based Access Control (RBAC)** – Distinct dashboards for Customer, Pharmacy & Partner.  
- 🪪 **Profile Management** – Manage profile, address, and image seamlessly.

---

## 💡 The Problem MediChalo Solves

Traditional medicine delivery is often **slow, uncertain, and inconvenient**:

- 🚶‍♂️ **Stressful Pharmacy Visits** – Involves travel, queues, and risk of unavailability.  
- 🕓 **Delayed Online Delivery** – Large e-pharmacies usually take 24–48 hours for delivery.  
- 🏪 **Limited Local Reach** – Local pharmacies lack tools for digital operations and delivery.  
- 🚚 **Unfair Dispatching** – Delivery agents face inequitable and inefficient order assignments.

✅ **MediChalo solves all this** with real-time order management, efficient dispatching, and AI-powered validation—making healthcare **accessible, fast, and transparent.**

---

## 🎯 How MediChalo Works (User Journey)

1. 👨‍⚕️ **Customer Places Order**
   - Upload prescription or select medicines from nearby pharmacy inventory.
   - Choose address & payment mode.

2. 🏪 **Pharmacy Responds**
   - Accepts order broadcast or direct request.
   - Validates (with AI help), packs, and marks “Ready for Delivery.”

3. 🚴 **Dynamic Dispatch**
   - Fair Dispatch Algorithm assigns order to best available partner.

4. 📍 **Live Tracking & Delivery**
   - Partner uses in-app navigation.
   - Customer tracks real-time on map.
   - Delivery verified via secure OTP.

---

## 🧩 System Architecture

MediChalo is built using a **modern, scalable MERN architecture**, enhanced with **AWS cloud services**.

📘 *(System Design Diagram – place image in `/assets/architecture.png` and update path below)*

![System Architecture](./assets/architecture.png)

### 🧠 Key Components

| Layer | Technologies | Description |
|-------|---------------|-------------|
| **Frontend** | React.js, React-Leaflet, Chart.js, Stripe Elements | Responsive, role-based UIs with maps & analytics |
| **Backend** | Node.js, Express.js | API Gateway, modular microservices, and secure endpoints |
| **Database** | MongoDB (Amazon DocumentDB) | Scalable, NoSQL data storage |
| **Realtime Service** | Socket.IO | WebSocket-based live updates for orders & tracking |
| **Storage** | AWS S3 | Secure file storage (prescriptions, documents, images) |
| **Payments** | Stripe API | Secure online payment processing |
| **Cloud Hosting** | AWS (EC2/Fargate, VPC, SES) | Auto-scaling, reliable backend |
| **Frontend Deployment** | Render | Fast and scalable frontend hosting |
| **Integrations** | Geocoding API, OpenStreetMap, AWS SES | Mapping, notifications, and transactional emails |

---

## 🛠️ Technologies Used

### 🌐 **Frontend**
- React.js  
- React Router  
- Axios  
- Socket.IO Client  
- React-Leaflet (Maps)  
- React-Chartjs-2  
- Formik + Yup (Form Validation)  
- Stripe.js + @stripe/react-stripe-js  
- file-saver (Invoice download)  
- React Icons  

### ⚙️ **Backend**
- Node.js  
- Express.js  
- Mongoose  
- JWT (Authentication)  
- Bcrypt (Password Encryption)  
- Socket.IO (Real-time communication)  
- Nodemailer / AWS SES (Email)  
- Stripe (Payments)  
- Multer + AWS SDK (File Uploads)  
- PDFKit (Invoice generation)  
- csv-parser (CSV imports)

### 🗄️ **Database**
- MongoDB (Amazon DocumentDB Cluster)

### ☁️ **Cloud**
- AWS EC2 / Fargate  
- AWS S3 (Storage)  
- AWS SES (Email)  
- AWS DocumentDB (Database)

### 💳 **Payments**
- Stripe API

### 🗺️ **Mapping**
- Leaflet.js  
- OpenStreetMap API

---

## 🧪 Installation & Setup

Follow these steps to set up MediChalo locally:

### 1️⃣ **Clone the repository**
```bash
git clone https://github.com/your-username/MediChalo.git
cd MediChalo
