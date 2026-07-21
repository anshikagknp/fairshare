/* =========================================================
   FAIRSHARE — APPLICATION LOGIC
   Pure vanilla JS. No dependencies.
========================================================= */

(function () {
  "use strict";

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */

  const state = {
    members: [],   // { id, name, color }
    expenses: [],  // { id, description, amount, payerId, splitType, shares: { memberId: amount } }
    splitType: "equal",
    nextMemberId: 1,
    nextExpenseId: 1,
  };

  const MEMBER_COLORS = [
    "#fde047", // yellow
    "#f472b6", // pink
    "#4ade80", // green
    "#c084fc", // purple
    "#38bdf8", // sky
    "#fb923c", // orange bonus
    "#2dd4bf", // teal bonus
  ];

  /* -------------------------------------------------------
     DOM REFERENCES
  ------------------------------------------------------- */

  const el = {
    memberForm: document.getElementById("member-form"),
    memberInput: document.getElementById("member-input"),
    memberList: document.getElementById("member-list"),
    memberEmptyState: document.getElementById("member-empty-state"),
    memberCountBadge: document.getElementById("member-count-badge"),

    expenseForm: document.getElementById("expense-form"),
    expenseDesc: document.getElementById("expense-desc"),
    expenseAmount: document.getElementById("expense-amount"),
    expensePayer: document.getElementById("expense-payer"),
    expenseError: document.getElementById("expense-error"),
    splitToggle: document.getElementById("split-toggle"),
    splitMembers: document.getElementById("split-members"),
    splitEmptyState: document.getElementById("split-empty-state"),

    balancesList: document.getElementById("balances-list"),
    balancesEmptyState: document.getElementById("balances-empty-state"),

    settlementList: document.getElementById("settlement-list"),
    settlementEmptyState: document.getElementById("settlement-empty-state"),
    settlementCountBadge: document.getElementById("settlement-count-badge"),

    historyList: document.getElementById("history-list"),
    historyEmptyState: document.getElementById("history-empty-state"),
    historyTotalBadge: document.getElementById("history-total-badge"),

    authScreen: document.getElementById("auth-screen"),
    appShell: document.getElementById("app-shell"),
    authTabs: document.getElementById("auth-tabs"),
    authForm: document.getElementById("auth-form"),
    authEmail: document.getElementById("auth-email"),
    authPassword: document.getElementById("auth-password"),
    authError: document.getElementById("auth-error"),
    authSubmitBtn: document.getElementById("auth-submit-btn"),
    googleSignInBtn: document.getElementById("google-signin-btn"),
    guestBtn: document.getElementById("guest-btn"),
    firebaseSetupNote: document.getElementById("firebase-setup-note"),
    userEmailDisplay: document.getElementById("user-email-display"),
    signOutBtn: document.getElementById("sign-out-btn"),
  };

  /* -------------------------------------------------------
     UTILITIES
  ------------------------------------------------------- */

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function formatCurrency(num) {
    const fixed = Math.abs(num) < 0.005 ? 0 : num;
    const abs = Math.abs(fixed).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return (fixed < 0 ? "-₹" : "₹") + abs;
  }

  // Round to nearest cent to avoid floating point drift
  function toCents(dollars) {
    return Math.round(dollars * 100);
  }

  function fromCents(cents) {
    return cents / 100;
  }

  function sanitizeText(str) {
    return str
      .replace(/[<>]/g, "")
      .trim()
      .slice(0, 60);
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function getMember(id) {
    return state.members.find((m) => m.id === id);
  }

  /* -------------------------------------------------------
     MEMBER MANAGEMENT
  ------------------------------------------------------- */

  function addMember(rawName) {
    const name = sanitizeText(rawName);
    if (!name) return;

    const duplicate = state.members.some(
      (m) => m.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      flashInputError(el.memberInput);
      return;
    }

    const color = MEMBER_COLORS[state.members.length % MEMBER_COLORS.length];
    state.members.push({
      id: uid("mem"),
      name: name,
      color: color,
    });

    render();
    persistState();
  }

  function removeMember(id) {
    state.members = state.members.filter((m) => m.id !== id);

    // Cascade: remove any expense where this member was the payer,
    // and strip their share from expenses where they were a participant.
    state.expenses = state.expenses
      .filter((exp) => exp.payerId !== id)
      .map((exp) => {
        if (exp.shares[id] !== undefined) {
          const copy = { ...exp, shares: { ...exp.shares } };
          delete copy.shares[id];
          return copy;
        }
        return exp;
      })
      .filter((exp) => Object.keys(exp.shares).length > 0);

    render();
    persistState();
  }

  function flashInputError(inputEl) {
    inputEl.style.transition = "transform 0.08s";
    inputEl.style.transform = "translateX(-6px)";
    setTimeout(() => (inputEl.style.transform = "translateX(6px)"), 80);
    setTimeout(() => (inputEl.style.transform = "translateX(0)"), 160);
  }

  /* -------------------------------------------------------
     EXPENSE MANAGEMENT
  ------------------------------------------------------- */

  function addExpense(description, amount, payerId, splitType, shares) {
    state.expenses.push({
      id: uid("exp"),
      description: description,
      amount: amount,
      payerId: payerId,
      splitType: splitType,
      shares: shares, // { memberId: amountOwedByThatMember }
    });
    render();
    persistState();
  }

  function removeExpense(id) {
    state.expenses = state.expenses.filter((e) => e.id !== id);
    render();
    persistState();
  }

  /* -------------------------------------------------------
     RENDER: MEMBER TAGS
  ------------------------------------------------------- */

  function renderMembers() {
    el.memberList.querySelectorAll(".member-tag").forEach((n) => n.remove());
    el.memberEmptyState.hidden = state.members.length > 0;
    el.memberCountBadge.textContent =
      state.members.length + (state.members.length === 1 ? " member" : " members");

    state.members.forEach((m, i) => {
      const tag = document.createElement("span");
      tag.className = "member-tag";
      tag.style.background = m.color;
      tag.style.animationDelay = i * 0.04 + "s";
      tag.innerHTML =
        `<span>${escapeHtml(m.name)}</span>` +
        `<button type="button" class="tag-delete" data-id="${m.id}" aria-label="Remove ${escapeHtml(m.name)}">✕</button>`;
      el.memberList.appendChild(tag);
    });

    // Payer dropdown
    const prevPayer = el.expensePayer.value;
    el.expensePayer.innerHTML = '<option value="">Select payer…</option>';
    state.members.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.name;
      el.expensePayer.appendChild(opt);
    });
    if (state.members.some((m) => m.id === prevPayer)) {
      el.expensePayer.value = prevPayer;
    }
  }

  /* -------------------------------------------------------
     RENDER: SPLIT MEMBER CHECKLIST (equal / unequal)
  ------------------------------------------------------- */

  function renderSplitMembers() {
    // Preserve currently checked state + unequal values across re-renders
    const prevChecked = {};
    const prevValues = {};
    el.splitMembers.querySelectorAll(".split-row").forEach((row) => {
      const id = row.dataset.id;
      const cb = row.querySelector('input[type="checkbox"]');
      const num = row.querySelector(".unequal-amount");
      prevChecked[id] = cb ? cb.checked : false;
      prevValues[id] = num ? num.value : "";
    });

    el.splitMembers.innerHTML = "";
    el.splitEmptyState.hidden = state.members.length > 0;

    if (state.members.length === 0) {
      el.splitMembers.appendChild(el.splitEmptyState);
      return;
    }

    const totalAmount = parseFloat(el.expenseAmount.value) || 0;
    const isEqual = state.splitType === "equal";

    // Count how many are currently checked for equal-split preview math
    const checkedIds = state.members
      .filter((m) => prevChecked[m.id] !== undefined ? prevChecked[m.id] : true)
      .map((m) => m.id);
    const checkedCount = checkedIds.length || 1;
    const equalShareCents = Math.floor(toCents(totalAmount) / checkedCount);
    const remainderCents = toCents(totalAmount) - equalShareCents * checkedCount;

    state.members.forEach((m, i) => {
      const isChecked = prevChecked[m.id] !== undefined ? prevChecked[m.id] : true;

      const row = document.createElement("div");
      row.className = "split-row";
      row.dataset.id = m.id;
      row.style.animationDelay = i * 0.03 + "s";

      const checkboxId = "split-check-" + m.id;

      let rightSideHtml = "";
      if (isEqual) {
        let shareCents = equalShareCents;
        // give the leftover pennies to the first checked member for exactness
        if (isChecked && checkedIds[0] === m.id) {
          shareCents += remainderCents;
        }
        const preview = isChecked ? formatCurrency(fromCents(shareCents)) : "—";
        rightSideHtml = `<span class="equal-amount-preview">${preview}</span>`;
      } else {
        const val = prevValues[m.id] !== undefined ? prevValues[m.id] : "";
        rightSideHtml = `<input type="number" class="unequal-amount" data-id="${m.id}" min="0" step="0.01" placeholder="0.00" value="${escapeHtml(val)}" ${isChecked ? "" : "disabled"} />`;
      }

      row.innerHTML =
        `<input type="checkbox" id="${checkboxId}" data-id="${m.id}" ${isChecked ? "checked" : ""} />` +
        `<label for="${checkboxId}" class="split-name"><span class="swatch-dot" style="background:${m.color}"></span>${escapeHtml(m.name)}</label>` +
        rightSideHtml;

      el.splitMembers.appendChild(row);
    });
  }

  /* -------------------------------------------------------
     RENDER: BALANCES (net paid - net owed per member)
  ------------------------------------------------------- */

  function computeBalances() {
    const balances = {};
    state.members.forEach((m) => (balances[m.id] = 0));

    state.expenses.forEach((exp) => {
      if (balances[exp.payerId] !== undefined) {
        balances[exp.payerId] += exp.amount;
      }
      Object.entries(exp.shares).forEach(([memberId, owed]) => {
        if (balances[memberId] !== undefined) {
          balances[memberId] -= owed;
        }
      });
    });

    // Round to cents to eliminate floating point noise
    Object.keys(balances).forEach((id) => {
      balances[id] = fromCents(Math.round(toCents(balances[id])));
    });

    return balances;
  }

  function renderBalances(balances) {
    el.balancesList.querySelectorAll(".balance-row").forEach((n) => n.remove());
    el.balancesEmptyState.hidden = state.members.length > 0 && state.expenses.length > 0;

    if (state.members.length === 0 || state.expenses.length === 0) {
      return;
    }

    const sorted = [...state.members].sort(
      (a, b) => balances[b.id] - balances[a.id]
    );

    sorted.forEach((m, i) => {
      const net = balances[m.id] || 0;
      const cls = net > 0.005 ? "positive" : net < -0.005 ? "negative" : "zero";
      const sign = net > 0.005 ? "+" : "";
      const label =
        net > 0.005
          ? "is owed"
          : net < -0.005
          ? "owes the group"
          : "is settled";

      const row = document.createElement("div");
      row.className = "balance-row";
      row.style.animationDelay = i * 0.05 + "s";
      row.innerHTML =
        `<span class="balance-name"><span class="swatch-dot" style="width:10px;height:10px;border-radius:50%;border:1.5px solid #0f172a;display:inline-block;background:${m.color}"></span>${escapeHtml(m.name)} <span style="font-weight:400;opacity:.65;font-size:.78rem;">${label}</span></span>` +
        `<span class="balance-amount ${cls}">${sign}${formatCurrency(net)}</span>`;
      el.balancesList.appendChild(row);
    });
  }

  /* -------------------------------------------------------
     DEBT OPTIMIZATION — GREEDY MINIMUM-TRANSACTION MATCHING
  ------------------------------------------------------- */

  function computeSettlements(balances) {
    // Build creditor/debtor lists in cents (integers) for precision
    const creditors = [];
    const debtors = [];

    state.members.forEach((m) => {
      const cents = Math.round(toCents(balances[m.id] || 0));
      if (cents > 0) creditors.push({ id: m.id, name: m.name, amount: cents });
      else if (cents < 0) debtors.push({ id: m.id, name: m.name, amount: -cents });
    });

    // Sort descending: largest debtor / creditor first
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const settlements = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const transfer = Math.min(debtor.amount, creditor.amount);

      if (transfer > 0) {
        settlements.push({
          from: debtor.name,
          fromId: debtor.id,
          to: creditor.name,
          toId: creditor.id,
          amount: fromCents(transfer),
        });
      }

      debtor.amount -= transfer;
      creditor.amount -= transfer;

      if (debtor.amount === 0) i++;
      if (creditor.amount === 0) j++;
    }

    return settlements;
  }

  function renderSettlements(settlements) {
    el.settlementList.querySelectorAll(".settlement-row").forEach((n) => n.remove());
    const hasAny = settlements.length > 0;
    el.settlementEmptyState.hidden = hasAny;
    el.settlementCountBadge.textContent =
      settlements.length + (settlements.length === 1 ? " payment" : " payments");

    settlements.forEach((s, i) => {
      const fromMember = getMember(s.fromId);
      const toMember = getMember(s.toId);
      const row = document.createElement("div");
      row.className = "settlement-row";
      row.style.animationDelay = i * 0.06 + "s";
      row.innerHTML =
        `<span class="swatch-dot" style="width:10px;height:10px;border-radius:50%;border:1.5px solid #0f172a;display:inline-block;background:${fromMember ? fromMember.color : "#ccc"}"></span>` +
        `${escapeHtml(s.from)} <span class="arrow">→ pays →</span> ` +
        `<span class="swatch-dot" style="width:10px;height:10px;border-radius:50%;border:1.5px solid #0f172a;display:inline-block;background:${toMember ? toMember.color : "#ccc"}"></span>` +
        `${escapeHtml(s.to)}` +
        `<span class="settle-amount">${formatCurrency(s.amount)}</span>`;
      el.settlementList.appendChild(row);
    });
  }

  /* -------------------------------------------------------
     RENDER: EXPENSE HISTORY
  ------------------------------------------------------- */

  function renderHistory() {
    el.historyList.querySelectorAll(".history-item").forEach((n) => n.remove());
    el.historyEmptyState.hidden = state.expenses.length > 0;

    let total = 0;

    [...state.expenses].reverse().forEach((exp, i) => {
      total += exp.amount;
      const payer = getMember(exp.payerId);
      const payerName = payer ? payer.name : "(removed)";
      const participantNames = Object.keys(exp.shares)
        .map((id) => {
          const m = getMember(id);
          return m ? m.name : "(removed)";
        })
        .join(", ");

      const item = document.createElement("div");
      item.className = "history-item";
      item.style.animationDelay = i * 0.04 + "s";
      item.innerHTML =
        `<div class="history-item-top">` +
        `<span class="history-desc">${escapeHtml(exp.description)}</span>` +
        `<span class="history-amount">${formatCurrency(exp.amount)}</span>` +
        `</div>` +
        `<div class="history-meta">` +
        `<span>paid by <strong>${escapeHtml(payerName)}</strong> · split ${exp.splitType === "equal" ? "equally" : "unequally"} among ${escapeHtml(participantNames)}</span>` +
        `<button type="button" class="history-delete" data-id="${exp.id}">Delete</button>` +
        `</div>`;
      el.historyList.appendChild(item);
    });

    // total is computed forward regardless of reverse-render above
    const trueTotal = state.expenses.reduce((sum, e) => sum + e.amount, 0);
    el.historyTotalBadge.textContent = formatCurrency(trueTotal) + " total";
  }

  /* -------------------------------------------------------
     MASTER RENDER
  ------------------------------------------------------- */

  function render() {
    renderMembers();
    renderSplitMembers();

    const balances = computeBalances();
    renderBalances(balances);

    const settlements = computeSettlements(balances);
    renderSettlements(settlements);

    renderHistory();
  }

  /* -------------------------------------------------------
     EXPENSE FORM VALIDATION + SUBMIT
  ------------------------------------------------------- */

  function showExpenseError(msg) {
    el.expenseError.textContent = msg;
    el.expenseError.hidden = false;
    // restart shake animation
    el.expenseError.style.animation = "none";
    void el.expenseError.offsetWidth;
    el.expenseError.style.animation = "";
  }

  function clearExpenseError() {
    el.expenseError.hidden = true;
    el.expenseError.textContent = "";
  }

  function collectSplitRows() {
    return Array.from(el.splitMembers.querySelectorAll(".split-row")).map((row) => {
      const id = row.dataset.id;
      const checked = row.querySelector('input[type="checkbox"]').checked;
      const unequalInput = row.querySelector(".unequal-amount");
      const unequalValue = unequalInput ? parseFloat(unequalInput.value) : NaN;
      return { id, checked, unequalValue };
    });
  }

  function handleExpenseSubmit(evt) {
    evt.preventDefault();
    clearExpenseError();

    const description = sanitizeText(el.expenseDesc.value);
    const amount = parseFloat(el.expenseAmount.value);
    const payerId = el.expensePayer.value;

    if (!description) {
      showExpenseError("Give this expense a short description.");
      el.expenseDesc.focus();
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      showExpenseError("Enter a total amount greater than ₹0.");
      el.expenseAmount.focus();
      return;
    }
    if (!payerId) {
      showExpenseError("Select who paid for this.");
      return;
    }

    const rows = collectSplitRows();
    const checkedRows = rows.filter((r) => r.checked);

    if (checkedRows.length === 0) {
      showExpenseError("Select at least one person to split this with.");
      return;
    }

    const shares = {};

    if (state.splitType === "equal") {
      const totalCents = toCents(amount);
      const count = checkedRows.length;
      const baseShare = Math.floor(totalCents / count);
      const remainder = totalCents - baseShare * count;

      checkedRows.forEach((r, idx) => {
        let cents = baseShare;
        if (idx === 0) cents += remainder; // assign leftover pennies to first participant
        shares[r.id] = fromCents(cents);
      });
    } else {
      // Unequal: validate sum matches total exactly (within half a cent)
      let sumCents = 0;
      for (const r of checkedRows) {
        if (isNaN(r.unequalValue) || r.unequalValue < 0) {
          showExpenseError("Enter a valid dollar amount for every selected person.");
          return;
        }
        sumCents += toCents(r.unequalValue);
      }
      const totalCents = toCents(amount);
      if (sumCents !== totalCents) {
        const diff = fromCents(totalCents - sumCents);
        showExpenseError(
          `Unequal shares must add up to the total. Currently ${diff > 0 ? "short by" : "over by"} ${formatCurrency(Math.abs(diff))}.`
        );
        return;
      }
      checkedRows.forEach((r) => {
        shares[r.id] = r.unequalValue;
      });
    }

    addExpense(description, amount, payerId, state.splitType, shares);

    // Reset form
    el.expenseForm.reset();
    setSplitType("equal");
    clearExpenseError();
  }

  /* -------------------------------------------------------
     SPLIT TYPE TOGGLE
  ------------------------------------------------------- */

  function setSplitType(type) {
    state.splitType = type;
    el.splitToggle.querySelectorAll(".toggle-btn").forEach((btn) => {
      const active = btn.dataset.split === type;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    renderSplitMembers();
  }

  /* -------------------------------------------------------
     EVENT BINDINGS
  ------------------------------------------------------- */

  el.memberForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    addMember(el.memberInput.value);
    el.memberInput.value = "";
    el.memberInput.focus();
  });

  el.memberList.addEventListener("click", (evt) => {
    const btn = evt.target.closest(".tag-delete");
    if (!btn) return;
    removeMember(btn.dataset.id);
  });

  el.splitToggle.addEventListener("click", (evt) => {
    const btn = evt.target.closest(".toggle-btn");
    if (!btn) return;
    setSplitType(btn.dataset.split);
  });

  el.expenseAmount.addEventListener("input", () => {
    if (state.splitType === "equal") renderSplitMembers();
  });

  el.splitMembers.addEventListener("change", (evt) => {
    if (evt.target.matches('input[type="checkbox"]')) {
      renderSplitMembers();
    }
  });

  el.expenseForm.addEventListener("submit", handleExpenseSubmit);

  el.historyList.addEventListener("click", (evt) => {
    const btn = evt.target.closest(".history-delete");
    if (!btn) return;
    removeExpense(btn.dataset.id);
  });

  /* =========================================================
     ACCOUNTS & DATABASE

     FairShare supports two ways to save trip data:

     1) SIGNED-IN ACCOUNTS (Google or email/password), backed by
        Firebase Authentication + Cloud Firestore. This is a real,
        working cloud database — data follows the person across
        devices. To turn it on:
          a) Create a free project at https://console.firebase.google.com
          b) Enable "Email/Password" and "Google" under
             Authentication → Sign-in method
          c) Create a Firestore database (production or test mode)
          d) Copy your project's config object into FIREBASE_CONFIG
             below, replacing the placeholder values.

     2) GUEST MODE — no setup required. Data is saved with the
        browser's own localStorage, so it stays on that one device
        only. This is what runs automatically until a real Firebase
        config is added above.
  ========================================================= */

  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAVzz0Xcn40mEvnY0gNedn4QwdAfO4E2ug",
    authDomain: "fairshare-1.firebaseapp.com",
    projectId: "fairshare-1",
    storageBucket: "fairshare-1.firebasestorage.app",
    messagingSenderId: "998374903718",
    appId: "1:998374903718:web:a147b2ffad1b79ec1a4967",
  };

  const GUEST_STORAGE_KEY = "fairshare_guest_data_v1";

  const isFirebaseConfigured = FIREBASE_CONFIG.apiKey !== "YOUR_FIREBASE_API_KEY";

  let firebaseApp = null;
  let firebaseAuth = null;
  let firestoreDb = null;
  let currentUser = null;   // { uid, email } for real accounts
  let isGuest = false;
  let authMode = "signin";  // "signin" | "signup"

  if (isFirebaseConfigured && window.firebase) {
    try {
      firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
      firebaseAuth = firebase.auth();
      firestoreDb = firebase.firestore();
    } catch (err) {
      console.error("Firebase failed to initialize:", err);
    }
  } else {
    el.firebaseSetupNote.hidden = false;
  }

  /* -------------------------------------------------------
     LOAD / SAVE STATE
  ------------------------------------------------------- */

  function resetLocalState() {
    state.members = [];
    state.expenses = [];
    state.splitType = "equal";
  }

  async function loadStateForCurrentUser() {
    resetLocalState();

    if (isGuest) {
      try {
        const raw = localStorage.getItem(GUEST_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          state.members = Array.isArray(parsed.members) ? parsed.members : [];
          state.expenses = Array.isArray(parsed.expenses) ? parsed.expenses : [];
        }
      } catch (err) {
        console.error("Could not read guest data:", err);
      }
      return;
    }

    if (currentUser && firestoreDb) {
      try {
        const docSnap = await firestoreDb
          .collection("fairshare_users")
          .doc(currentUser.uid)
          .get();
        if (docSnap.exists) {
          const data = docSnap.data();
          state.members = Array.isArray(data.members) ? data.members : [];
          state.expenses = Array.isArray(data.expenses) ? data.expenses : [];
        }
      } catch (err) {
        console.error("Could not load expense data from Firestore:", err);
      }
    }
  }

  let saveTimer = null;
  function persistState() {
    // Debounce so rapid edits don't spam writes.
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const payload = {
        members: state.members,
        expenses: state.expenses,
      };

      if (isGuest) {
        try {
          localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(payload));
        } catch (err) {
          console.error("Could not save guest data:", err);
        }
        return;
      }

      if (currentUser && firestoreDb) {
        firestoreDb
          .collection("fairshare_users")
          .doc(currentUser.uid)
          .set(
            { ...payload, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
            { merge: true }
          )
          .catch((err) => console.error("Could not save expense data:", err));
      }
    }, 250);
  }

  /* -------------------------------------------------------
     AUTH SCREEN <-> APP SHELL
  ------------------------------------------------------- */

  function showAuthScreen() {
    el.authScreen.hidden = false;
    el.appShell.hidden = true;
  }

  async function showAppShell() {
    el.authScreen.hidden = true;
    el.appShell.hidden = false;
    el.userEmailDisplay.textContent = isGuest ? "Guest mode" : (currentUser ? currentUser.email : "");
    await loadStateForCurrentUser();
    render();
  }

  function showAuthError(msg) {
    el.authError.textContent = msg;
    el.authError.hidden = false;
  }

  function clearAuthError() {
    el.authError.hidden = true;
    el.authError.textContent = "";
  }

  function friendlyAuthErrorMessage(err) {
    const code = err && err.code ? err.code : "";
    if (code.includes("wrong-password") || code.includes("invalid-credential")) {
      return "That email and password don't match our records.";
    }
    if (code.includes("user-not-found")) {
      return "No account found with that email. Try signing up instead.";
    }
    if (code.includes("email-already-in-use")) {
      return "An account already exists for that email. Try signing in instead.";
    }
    if (code.includes("weak-password")) {
      return "Choose a password with at least 6 characters.";
    }
    if (code.includes("invalid-email")) {
      return "That doesn't look like a valid email address.";
    }
    return (err && err.message) || "Something went wrong. Please try again.";
  }

  function setAuthMode(mode) {
    authMode = mode;
    el.authTabs.querySelectorAll(".auth-tab").forEach((btn) => {
      const active = btn.dataset.mode === mode;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    el.authSubmitBtn.textContent = mode === "signin" ? "Sign In →" : "Create Account →";
    clearAuthError();
  }

  async function handleAuthSubmit(evt) {
    evt.preventDefault();
    clearAuthError();

    if (!isFirebaseConfigured || !firebaseAuth) {
      showAuthError("Email accounts aren't connected yet — try Guest mode below, or see the setup note.");
      return;
    }

    const email = el.authEmail.value.trim();
    const password = el.authPassword.value;

    if (!email || !password) {
      showAuthError("Enter both an email and a password.");
      return;
    }

    el.authSubmitBtn.disabled = true;
    try {
      if (authMode === "signin") {
        await firebaseAuth.signInWithEmailAndPassword(email, password);
      } else {
        await firebaseAuth.createUserWithEmailAndPassword(email, password);
      }
      // onAuthStateChanged will take over from here.
    } catch (err) {
      showAuthError(friendlyAuthErrorMessage(err));
    } finally {
      el.authSubmitBtn.disabled = false;
    }
  }

  async function handleGoogleSignIn() {
    clearAuthError();
    if (!isFirebaseConfigured || !firebaseAuth) {
      showAuthError("Google sign-in isn't connected yet — try Guest mode below, or see the setup note.");
      return;
    }
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await firebaseAuth.signInWithPopup(provider);
    } catch (err) {
      showAuthError(friendlyAuthErrorMessage(err));
    }
  }

  function handleGuestEntry() {
    clearAuthError();
    isGuest = true;
    currentUser = null;
    showAppShell();
  }

  async function handleSignOut() {
    isGuest = false;
    if (firebaseAuth && firebaseAuth.currentUser) {
      try {
        await firebaseAuth.signOut();
      } catch (err) {
        console.error("Sign out failed:", err);
      }
    }
    currentUser = null;
    resetLocalState();
    render();
    showAuthScreen();
  }

  /* -------------------------------------------------------
     AUTH EVENT BINDINGS
  ------------------------------------------------------- */

  el.authTabs.addEventListener("click", (evt) => {
    const btn = evt.target.closest(".auth-tab");
    if (!btn) return;
    setAuthMode(btn.dataset.mode);
  });

  el.authForm.addEventListener("submit", handleAuthSubmit);
  el.googleSignInBtn.addEventListener("click", handleGoogleSignIn);
  el.guestBtn.addEventListener("click", handleGuestEntry);
  el.signOutBtn.addEventListener("click", handleSignOut);

  /* -------------------------------------------------------
     INIT
  ------------------------------------------------------- */

  if (isFirebaseConfigured && firebaseAuth) {
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        isGuest = false;
        currentUser = { uid: user.uid, email: user.email || "Signed in" };
        showAppShell();
      } else if (!isGuest) {
        currentUser = null;
        showAuthScreen();
      }
    });
  } else {
    showAuthScreen();
  }
})();
