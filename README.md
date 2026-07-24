

<div align="center" id="top">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:fb923c,25:ec4899,50:8b5cf6,75:6366f1,100:0ea5e9&height=200&section=header&text=FairShare&fontSize=74&fontColor=fef9ec&fontAlignY=36&desc=Split%20smarter.%20No%20awkward%20math.&descAlignY=54&descSize=19&animation=fadeIn" width="100%"/>

<h2 align="center">an expense splitter that actually does the math, so your group doesn't have to</h2>

<br>

[![Live Demo](https://img.shields.io/badge/🌐_LIVE_DEMO-fairshare--expense--splitter.vercel.app-fef9ec?style=for-the-badge&labelColor=ec4899)](https://fairshare-expense-splitter.vercel.app/)

<br>

<img src="https://skillicons.dev/icons?i=html,css,js,firebase,vercel,git,github&theme=dark" />

<br>

<code>0 dependencies</code> &nbsp;·&nbsp; <code>3 files</code> &nbsp;·&nbsp; <code>O(n) settlement</code> &nbsp;·&nbsp; <code>2 sign-in methods</code> &nbsp;·&nbsp; <code>MIT licensed</code>

<br>

</div>

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:fb923c,50:ec4899,100:8b5cf6&height=4&section=header" width="100%"/>

<br>

<table>
<tr>
<td width="70%" valign="top">

### 🫠 The Problem

Someone books the Airbnb. Someone else grabs the cab. A third person "gets the next one" and conveniently never does. By day three, nobody remembers who fronted what — so everyone just quietly stops asking, and somebody ends up eating the cost.

### 💡 The Fix

**FairShare** logs every expense the moment it happens — who paid, how much, and how it's split — and keeps a running, real-time balance for each person. When it's time to settle, it doesn't just list raw debts; it collapses them into the *smallest possible number of payments*. No spreadsheets, no mental math, no "wait, didn't I already pay you back?"

</td>
<td width="30%" valign="top">

```
  ₹ input:  chaos
  ↓
  🧮 greedy debt
     matching
  ↓
  ₹ output: 1, 2, 3
     clean payments
```

</td>
</tr>
</table>

<br>

## 🔑 Try It — Zero Signup

<div align="center">

| | |
|:---:|:---:|
| 📧 Email | `admin@gmail.com` |
| 🔑 Password | `@123456` |

**[▶ Launch the live demo](https://fairshare-expense-splitter.vercel.app/)**

</div>

> Shared public account — data may reset without warning. For anything real, use **Guest Mode** (zero setup) or sign up free.

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:8b5cf6,50:6366f1,100:0ea5e9&height=4&section=header" width="100%"/>

<br>

## 📸 A Look Inside

<table align="center">
<tr>
<td align="center" width="50%">
<img width="1255" height="801" alt="image" src="https://github.com/user-attachments/assets/032072f6-53e6-4224-bf6c-01ae23f81490" />
<br><sub><b>🔐 Sign In</b> — email, Google, or skip straight to Guest Mode</sub>
</td>
<td align="center" width="50%">
<img width="1320" height="802" alt="image" src="https://github.com/user-attachments/assets/7ced9183-e2ed-4b90-adf8-a1b37eb64f40" />
<br><sub><b>📊 Dashboard</b> — members, expenses, balances, and settlements at a glance</sub>
</td>
</tr>
</table>

<br>

## ✨ Feature Drop

<details open>
<summary><b>👥 Members</b></summary>
<br>

Add or remove people with a click — each one gets a colorful, uniquely tinted chip. Remove someone mid-trip and every balance recalculates instantly across the whole group, no page reload.
</details>

<details>
<summary><b>💰 Expenses</b></summary>
<br>

Log an expense, pick who paid, and choose how it's split. Equal splits divide automatically; custom splits let you type in exact amounts per person, and FairShare won't let you submit until they add up to the rupee. Made a mistake? Edit or delete any entry, anytime.
</details>

<details>
<summary><b>🤝 Settlement Engine</b></summary>
<br>

Every member's balance gets netted down to a single number — owed or owing. A greedy algorithm then pairs the biggest debtor with the biggest creditor, over and over, until the group lands on the mathematically minimum number of payments.
</details>

<details>
<summary><b>🔐 Accounts</b></summary>
<br>

Sign in with Google, use Email/Password, or skip accounts entirely with Guest Mode — your trip data works the same way either way, just choose how much persistence you need.
</details>

<details>
<summary><b>☁️ Cloud Sync</b></summary>
<br>

Signed-in accounts are backed by Firebase Authentication and Cloud Firestore, so your data isn't stuck on one device — start logging expenses on your laptop, check balances from your phone.
</details>

<br>

## 🧠 How Settlement Actually Works

```mermaid
flowchart LR
    A["😤 Naive:<br/>A→B, B→C, C→D<br/>up to 10 payments"] -->|"greedy debt<br/>matching"| B["😎 FairShare:<br/>A→D<br/>as few as 4 payments"]
    style A fill: #A91B0D,stroke:#0f172a,stroke-width:2px
    style B fill: #228B22,stroke:#0f172a,stroke-width:2px
```

Every balance gets netted to a single number — positive if you're owed, negative if you owe. The largest debtor pays the largest creditor, on repeat, until the whole group is even.

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0ea5e9,50:6366f1,100:ec4899&height=4&section=header" width="100%"/>

<br>

## ⚡ Run It Yourself

```bash
git clone https://github.com/anshikagknp/fairshare-expense-splitter.git
cd fairshare-expense-splitter
open index.html
```

No `npm install`. No build step. No bundler. Pure HTML/CSS/JS — it just runs.

Want persistent cloud accounts? Drop your free [Firebase](https://console.firebase.google.com) project config into `script.js`. Skip it and **Guest Mode** still works perfectly out of the box.

<br>

## 🎨 Design DNA

<div align="center">

`thick black borders` · `hard offset shadows` · `loud pastel palette` · `springy micro-interactions` · `neo-brutalist`


</div>

<br>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0ea5e9,25:6366f1,50:8b5cf6,75:ec4899,100:fb923c&height=180&section=footer&animation=fadeIn" width="100%"/>

<div align="center">

### Made with 🩶 by Anshika Gupta

<a href="https://github.com/anshikagknp"><img src="https://img.shields.io/badge/-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>
<a href="https://www.linkedin.com/in/anshikagknp/"><img src="https://img.shields.io/badge/-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://fairshare-expense-splitter.vercel.app/"><img src="https://img.shields.io/badge/-Live_Demo-ec4899?style=for-the-badge&logoColor=white" alt="Live Demo"/></a>

<br><br>

<sub>MIT Licensed · © 2026 · <a href="#top">back to top ↑</a></sub>

</div>
