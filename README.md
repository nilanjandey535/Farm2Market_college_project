# Farm2Market

Farm2Market is a full-stack platform designed to bridge the gap between farmers and consumers. It provides a direct marketplace for agricultural products, integrated with logistics monitoring, storage management, and AI-powered assistance.

## 🚀 Features

- **Direct Marketplace**: Consumers can browse and purchase fresh produce directly from farmers.
- **Farmer Dashboard**: Tools for farmers to manage their products, track orders, and monitor sales.
- **Admin Panel**: Comprehensive management of users, approvals, and system logs.
- **Multi-Role Support**: Specialized interfaces for Customers, Farmers, Admins, Delivery Agents, and Agri Specialists.
- **AI Assistant**: A Gemini-powered chatbot to help users navigate the platform and get farming advice.
- **Payment Integration**: Secure online payments via Razorpay.
- **Logistics & Storage**: Integration with cold storage reports and delivery tracking.
- **Weather Insights**: Real-time weather data for farmers.

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+), Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL.
- **AI**: Google Gemini AI API.
- **Payments**: Razorpay API.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [PostgreSQL](https://www.postgresql.org/)
- A Razorpay Account (for payment keys)
- A Google Cloud project with Gemini API access

## ⚙️ Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/nilanjandey535/Farm2Market_college_project.git
   cd Farm2Market
   ```

2. **Backend Setup**:
   - Navigate to the backend folder: `cd backend`
   - Install dependencies: `npm install`
   - Create a `.env` file in the `backend` directory with the following variables:
     ```env
     DB_USER=your_postgres_user
     DB_PASS=your_postgres_password
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=Farm2Market
     PORT=4000
     GEMINI_API_KEY=your_gemini_api_key
     RAZORPAY_KEY_ID=your_razorpay_key_id
     RAZORPAY_KEY_SECRET=your_razorpay_secret
     ```

3. **Database Initialization**:
   - Initialize your PostgreSQL database using the provided migrations in `backend/migrations/`.

4. **Running the Application**:
   - Start the backend server: `npm start` (inside the `backend` directory)
   - Open `index.html` in your browser (or use a Live Server extension) to view the frontend.

## 📂 Project Structure

- `/` - Frontend HTML, CSS, and JS assets.
- `/backend` - Express.js server, routes, and database configuration.
- `/backend/routes` - API endpoints for products, orders, authentication, etc.
- `/backend/scripts` - Database initialization and utility scripts.

## 🎓 College Project Context

This project was developed as part of a college curriculum to demonstrate full-stack development capabilities and real-world problem-solving in the agricultural sector.

## 📄 License

This project is open-source. Please check with the maintainer for specific licensing terms.
