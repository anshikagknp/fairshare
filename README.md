# 💸 FairShare

## 🌐 Live Demo

**Live:** https://fairshare-expense-splitter.vercel.app/

**Repository:** https://github.com/anshikagknp/fairshare



## 📖 Overview

FairShare is a responsive expense-splitting web application that helps groups track shared expenses, calculate individual balances, and minimize the number of payments required to settle debts.

Instead of manually calculating who owes whom, FairShare automatically computes balances and generates the minimum transactions needed to settle all outstanding amounts.



## ✨ Features

### 👥 Member Management
- Add and remove group members
- Interactive member chips
- Dynamic participant selection

### 💰 Expense Management
- Add new expenses
- Edit existing expenses
- Delete expenses
- Equal split
- Unequal/custom split
- Choose who paid

### 📊 Smart Balance Calculation
- Automatic balance updates
- Real-time calculations
- Creditors and debtors clearly highlighted

### 🤝 Debt Settlement
- Optimized settlement algorithm
- Minimum number of transactions
- Clear payment instructions

### 🔐 Authentication
- Email & Password login
- Google Sign-In
- Guest Mode
- Persistent user data

### ☁ Cloud Storage
- Firebase Authentication
- Cloud Firestore database
- Automatic synchronization

### 📱 Responsive UI
- Desktop-friendly layout
- Mobile responsive
- Neo-brutalist design




## 🖼 Screenshots

### Sign-in

<img width="1339" height="791" alt="image" src="https://github.com/user-attachments/assets/03d9fea9-97ef-45d6-bd9d-0705dbf0ae5e" />



### Dashboard

<img width="1470" height="798" alt="image" src="https://github.com/user-attachments/assets/23520bc7-189e-48bd-b515-e8d41a8ca5bb" />



## 🛠 Tech Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript (ES6)

### Backend Services

- Firebase Authentication
- Cloud Firestore

### Deployment

- Vercel

### Version Control

- Git
- GitHub




## 🧮 Core Algorithm

FairShare uses a greedy debt-matching algorithm to minimize the number of transactions required for settlement.

Example:

Instead of

```
A → B
B → C
C → D
```

FairShare simplifies it into

```
A → D
```

where possible, reducing unnecessary payments.




## 🚀 Installation

Clone the repository

```bash
git clone https://github.com/anshikagknp/fairshare.git
```

Navigate into the project

```bash
cd fairshare
```

Open the project

```bash
index.html
```

or use

```bash
Live Server
```




## 🔥 Firebase Setup

Create a Firebase project.

Enable:

- Authentication
  - Email/Password
  - Google Sign-In

- Cloud Firestore

Replace the Firebase configuration inside:

```javascript
script.js
```

with your own project credentials.




## 📂 Project Structure

```
FairShare
│
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
```




## 🎨 Design

The interface follows a **Neo-brutalist** design language featuring:

- Bold outlines
- Hard shadows
- Bright color palette
- Rounded cards
- Bento-inspired dashboard layout
- High contrast typography




## Future Improvements

- Expense categories
- Search & filter history
- Multi-currency support
- Dark mode
- Export reports
- Email invitations




## 👩‍💻 Author

**Anshika Gupta**

GitHub: https://github.com/anshikagknp

LinkedIn: https://www.linkedin.com/in/anshikagknp/




## 📄 License

This project is licensed under the MIT License.
