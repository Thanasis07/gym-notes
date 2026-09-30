const savedTheme = localStorage.getItem('gymTheme') || 'theme-dark-gold';
document.body.className = savedTheme;

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, sendPasswordResetEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyASGtTaBoBrijNQEjafiKE1QcR-FQgj53w",
    authDomain: "gym-app-d7d36.firebaseapp.com",
    projectId: "gym-app-d7d36",
    storageBucket: "gym-app-d7d36.firebasestorage.app",
    messagingSenderId: "562017910463",
    appId: "1:562017910463:web:7382d5cef3429863ea100a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Σύγχρονη αρχικοποίηση με Offline Cache (Firebase v10)
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

const authScreen = document.getElementById('auth-screen');
const listScreen = document.getElementById('list-screen');
const editorScreen = document.getElementById('editor-screen');
const welcomeScreen = document.getElementById('welcome-screen');
const settingsScreen = document.getElementById('settings-screen');

let currentUser = null;
let isLoginMode = true;

const quotes = [
    "«No pain, no gain.»",
    "«Consistency is key.»",
    "«Push harder than yesterday.»",
    "«Evolve or remain the same.»",
    "«Earn your body.»",
    "«Focus and execute.»",
    "«Hard work beats talent.»"
];

function showScreen(screen) {
    [authScreen, listScreen, editorScreen, welcomeScreen, settingsScreen].forEach(s => s.style.display = 'none');
    screen.style.display = (screen === welcomeScreen) ? 'flex' : 'block';
}

const toggleAuthBtn = document.getElementById('toggle-auth-btn');
const mainAuthBtn = document.getElementById('main-auth-btn');
const registerFields = document.getElementById('register-fields');
const authMsg = document.getElementById('auth-msg');

toggleAuthBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        registerFields.style.display = 'none';
        mainAuthBtn.innerText = 'Είσοδος';
        toggleAuthBtn.innerText = 'Δεν έχεις λογαριασμό; Εγγραφή';
    } else {
        registerFields.style.display = 'block';
        mainAuthBtn.innerText = 'Ολοκλήρωση Εγγραφής';
        toggleAuthBtn.innerText = 'Έχεις ήδη λογαριασμό; Είσοδος';
    }
    authMsg.innerText = '';
});

mainAuthBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    authMsg.style.color = '#ff453a';

    if (isLoginMode) {
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            if (!userCred.user.emailVerified) {
                await signOut(auth);
                authMsg.innerText = "Παρακαλώ επαληθεύστε το email σας πριν συνδεθείτε.";
            }
        } catch (e) {
            authMsg.innerText = "Λάθος στοιχεία σύνδεσης.";
        }
    } else {
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        if (!firstName || !lastName) { authMsg.innerText = "Βάλε Όνομα και Επώνυμο!"; return; }
        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const fullName = firstName + " " + lastName;
            await updateProfile(userCred.user, { displayName: fullName });
            await sendEmailVerification(userCred.user);
            await signOut(auth);
            isLoginMode = true;
            registerFields.style.display = 'none';
            mainAuthBtn.innerText = 'Είσοδος';
            toggleAuthBtn.innerText = 'Δεν έχεις λογαριασμό; Εγγραφή';
            authMsg.style.color = 'var(--accent)';
            authMsg.innerText = "Επιτυχής εγγραφή! Στάλθηκε email επαλήθευσης.";
        } catch (err) {
            authMsg.innerText = "Σφάλμα εγγραφής (βάλε 6+ χαρακτήρες κωδικό).";
        }
    }
});

document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
    if (user) {
        if (!user.emailVerified) { signOut(auth); return; }
        currentUser = user;
        const name = user.displayName || "";
        document.getElementById('welcome-name').innerText = name;
        document.getElementById('profile-name-input').value = name;
        showScreen(welcomeScreen);
        setTimeout(() => { showScreen(listScreen); loadWorkouts(); }, 1500);
    }
    else { currentUser = null; showScreen(authScreen); }
});

document.getElementById('go-settings-btn').addEventListener('click', () => showScreen(settingsScreen));
document.getElementById('back-from-settings-btn').addEventListener('click', () => showScreen(listScreen));

document.getElementById('save-name-btn').addEventListener('click', () => {
    const newName = document.getElementById('profile-name-input').value.trim();
    if (newName) {
        updateProfile(currentUser, { displayName: newName }).then(() => {
            document.getElementById('settings-msg').innerText = "Το όνομα αποθηκεύτηκε!";
            document.getElementById('welcome-name').innerText = newName;
        });
    }
});

document.getElementById('reset-pass-btn').addEventListener('click', () => {
    sendPasswordResetEmail(auth, currentUser.email).then(() => {
        document.getElementById('settings-msg').innerText = "Στάλθηκε email αλλαγής κωδικού!";
    });
});

card.querySelector('.delete-btn').addEventListener('click', () => {
    if (confirm("Σίγουρα θέλεις να διαγράψεις αυτή την προπόνηση;")) {
        card.remove(); // 1. Εξαφανίζει αμέσως την κάρτα από την οθόνη!
        deleteDoc(doc(db, "workouts", docId)); // 2. Διαγράφει στο παρασκήνιο
    }
});

document.getElementById('search-input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.workout-card').forEach(card => {
        const title = card.querySelector('.workout-info h3').innerText.toLowerCase();
        card.style.display = title.includes(searchTerm) ? 'flex' : 'none';
    });
});

function getTodayFormatted() { return new Date().toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' }); }

function getStartOfCurrentWeek() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function triggerConfetti() {
    for (let i = 0; i < 35; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = ['#e5b022', '#0a84ff', '#32d74b', '#bb9af7', '#ff453a'][Math.floor(Math.random() * 5)];
        confetti.style.animationDuration = (Math.random() * 1 + 1) + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 2000);
    }
}

async function loadWorkouts() {
    const workoutsList = document.getElementById('workouts-list');
    const statsCard = document.getElementById('stats-card');
    workoutsList.innerHTML = '<p style="text-align:center; color:#8e8e93;">Φόρτωση...</p>';

    document.getElementById('quote-text').innerText = quotes[Math.floor(Math.random() * quotes.length)];

    const q = query(collection(db, "workouts"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"));
    try {
        const querySnapshot = await getDocs(q);
        workoutsList.innerHTML = '';

        if (querySnapshot.empty) {
            statsCard.style.display = 'none';
            workoutsList.innerHTML = `
                <div style="text-align: center; padding: 50px 20px; color: #8e8e93;">
                    <div style="font-size: 56px; margin-bottom: 15px;">🏋️‍♂️</div>
                    <h3 style="color: #fff; margin-bottom: 8px; font-size: 20px;">Δεν έχεις προπονήσεις ακόμα</h3>
                    <p style="font-size: 14px; line-height: 1.5;">Η επόμενη αλλαγή σου ξεκινάει εδώ.<br>Πάτα παρακάτω για να φτιάξεις την πρώτη σου προπόνηση!</p>
                </div>
            `;
            return;
        }

        statsCard.style.display = 'block';
        let weeklyWorkoutsCount = 0;
        let grandTotalVolume = 0;
        const startOfWeek = getStartOfCurrentWeek();

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            grandTotalVolume += (data.totalVolume || 0);

            let workoutDate = new Date();
            if (data.createdAtDate) {
                workoutDate = new Date(data.createdAtDate);
            } else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                workoutDate = data.createdAt.toDate();
            }

            if (workoutDate >= startOfWeek) {
                weeklyWorkoutsCount++;
            }

            const docId = docSnap.id;

            // ΕΔΩ ορίζεται η "card" σωστά για κάθε προπόνηση
            const card = document.createElement('div');
            card.className = 'workout-card';

            const volText = data.totalVolume ? ` • 🏋️ ${data.totalVolume.toLocaleString()} kg` : '';
            const notePreview = data.workoutNote ? `<p style="font-size: 13px; color: var(--accent); margin-top: 45px;">💬 ${data.workoutNote}</p>` : '';

            card.innerHTML = `
                <div class="workout-info">
                    <h3>${data.title}</h3>
                    <p>${data.dateString || ""}${volText}</p>
                    ${notePreview}
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="clone-btn" title="Αντιγραφή">🔄</button>
                    <button class="delete-btn" style="background: #ff453a; color: white; width: 40px; height: 40px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 18px; padding: 0;">🗑️</button>
                </div>
            `;

            card.querySelector('.clone-btn').addEventListener('click', () => openEditor(data.title, data.exercisesData || [], data.workoutNote || ''));

            // Το σωστό κουμπί Διαγραφής με Optimistic UI (διαγράφει αμέσως)
            card.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm("Σίγουρα θέλεις να διαγράψεις αυτή την προπόνηση;")) {
                    card.remove();
                    deleteDoc(doc(db, "workouts", docId));
                }
            });

            workoutsList.appendChild(card);
        });

        document.getElementById('stat-count').innerText = weeklyWorkoutsCount;
        document.getElementById('stat-volume').innerText = grandTotalVolume.toLocaleString() + ' kg';

    } catch (e) {
        console.error("Το Firebase σταμάτησε τη φόρτωση λόγω αυτού:", e);
        workoutsList.innerHTML = '<p style="text-align:center; color:#ff453a;">Σφάλμα φόρτωσης.</p>';
    }
}

document.getElementById('new-workout-btn').addEventListener('click', () => openEditor("", [], ""));
document.getElementById('back-btn').addEventListener('click', () => showScreen(listScreen));

function openEditor(title, exercisesData, workoutNote) {
    document.getElementById('workout-title').value = title;
    document.getElementById('workout-note').value = workoutNote;
    document.getElementById('exercises-container').innerHTML = '';
    document.getElementById('current-date').innerText = getTodayFormatted();
    document.getElementById('save-msg').innerText = '';
    document.getElementById('save-btn').disabled = false;
    if (exercisesData && exercisesData.length > 0) { exercisesData.forEach(ex => buildExerciseBox(ex.type, ex)); }
    showScreen(editorScreen);
}

document.getElementById('add-classic-btn').addEventListener('click', () => buildExerciseBox('classic'));
document.getElementById('add-superset-btn').addEventListener('click', () => buildExerciseBox('superset'));

function buildExerciseBox(type, existingData = null) {
    const box = document.createElement('div');
    box.className = 'exercise-box';
    box.dataset.type = type;

    let titleHTML = type === 'classic'
        ? `<input type="text" class="ex-name" placeholder="Όνομα Άσκησης" value="${existingData ? existingData.name : ''}">`
        : `<input type="text" class="ex-name1" placeholder="Άσκηση 1" value="${existingData ? existingData.name1 : ''}">
           <input type="text" class="ex-name2" placeholder="Άσκηση 2" value="${existingData ? existingData.name2 : ''}">`;

    const existingNote = existingData && existingData.note ? existingData.note : '';

    box.innerHTML = `
        <div class="exercise-title-row">${titleHTML}</div>
        <div class="sets-container"></div>
        <button class="add-set-btn">+ Επόμενο Σετ</button>
        <div class="exercise-note-container" style="margin-top: 10px;">
            <input type="text" class="ex-note" placeholder="💬 Σχόλιο άσκησης(προεραιτικό) " value="${existingNote}" style="background-color: var(--surface); padding: 8px; font-size: 13px; border-radius: 6px;">
        </div>
        <button class="remove-box-btn">Διαγραφή Άσκησης</button>
    `;

    const setsContainer = box.querySelector('.sets-container');
    if (existingData && existingData.sets && existingData.sets.length > 0) {
        existingData.sets.forEach((set, i) => addSetRow(setsContainer, type, i + 1, set));
    } else { addSetRow(setsContainer, type, 1); }

    box.querySelector('.add-set-btn').addEventListener('click', () => addSetRow(setsContainer, type, setsContainer.querySelectorAll('.set-row').length + 1));
    box.querySelector('.remove-box-btn').addEventListener('click', () => box.remove());
    document.getElementById('exercises-container').appendChild(box);
}

function addSetRow(container, type, setNumber, setData = null) {
    const row = document.createElement('div');
    row.className = 'set-row';
    if (type === 'classic') {
        const k = setData ? setData.kilos : ''; const r = setData ? setData.reps : '';
        row.innerHTML = `
            <span style="min-width: 50px; font-weight: bold; color: var(--accent);">Σετ ${setNumber}</span>
            <div style="display: flex; align-items: center; flex: 1; background-color: var(--surface); border-radius: 8px; padding-right: 10px;">
                <input type="number" inputmode="decimal" class="kilos" placeholder="Κιλά" value="${k}" style="background: transparent; padding: 10px; width: 100%;">
                <span style="color: #8e8e93; font-size: 14px;">kg</span>
            </div>
            <div style="display: flex; align-items: center; flex: 1; background-color: var(--surface); border-radius: 8px; padding-right: 10px;">
                <input type="number" inputmode="numeric" class="reps" placeholder="Επαν." value="${r}" style="background: transparent; padding: 10px; width: 100%;">
                <span style="color: #8e8e93; font-size: 14px;">reps</span>
            </div>`;
    } else {
        const k1 = setData ? setData.kilos1 : ''; const r1 = setData ? setData.reps1 : '';
        const k2 = setData ? setData.kilos2 : ''; const r2 = setData ? setData.reps2 : '';
        row.style.flexDirection = 'column'; row.style.alignItems = 'flex-start'; row.style.backgroundColor = 'rgba(0,0,0,0.3)'; row.style.padding = '10px'; row.style.borderRadius = '8px'; row.style.width = '100%';
        row.innerHTML = `
            <span style="font-weight: bold; color: var(--accent); margin-bottom: 8px;">Σετ ${setNumber}</span>
            <div style="display: flex; gap: 10px; width: 100%; margin-bottom: 5px;">
                <div style="display: flex; align-items: center; flex: 1; background-color: var(--surface); border-radius: 8px; padding-right: 10px;"><input type="number" inputmode="decimal" class="kilos1" placeholder="Κιλά 1" value="${k1}" style="background: transparent; padding: 10px; width: 100%;"><span style="color: #8e8e93; font-size: 12px;">kg</span></div>
                <div style="display: flex; align-items: center; flex: 1; background-color: var(--surface); border-radius: 8px; padding-right: 10px;"><input type="number" inputmode="numeric" class="reps1" placeholder="Επαν. 1" value="${r1}" style="background: transparent; padding: 10px; width: 100%;"><span style="color: #8e8e93; font-size: 12px;">reps</span></div>
            </div>
            <div style="display: flex; gap: 10px; width: 100%;">
                <div style="display: flex; align-items: center; flex: 1; background-color: var(--surface); border-radius: 8px; padding-right: 10px;"><input type="number" inputmode="decimal" class="kilos2" placeholder="Κιλά 2" value="${k2}" style="background: transparent; padding: 10px; width: 100%;"><span style="color: #8e8e93; font-size: 12px;">kg</span></div>
                <div style="display: flex; align-items: center; flex: 1; background-color: var(--surface); border-radius: 8px; padding-right: 10px;"><input type="number" inputmode="numeric" class="reps2" placeholder="Επαν. 2" value="${r2}" style="background: transparent; padding: 10px; width: 100%;"><span style="color: #8e8e93; font-size: 12px;">reps</span></div>
            </div>`;
    }
    container.appendChild(row);
}

document.getElementById('save-btn').addEventListener('click', async () => {
    const saveBtn = document.getElementById('save-btn');
    const msg = document.getElementById('save-msg');
    const title = document.getElementById('workout-title').value.trim();
    if (!title) { msg.style.color = '#ff453a'; msg.innerText = "Βάλε τίτλο!"; return; }

    saveBtn.disabled = true; msg.style.color = 'var(--accent)'; msg.innerText = "Αποθήκευση...";
    let exercisesData = [];
    let totalVolume = 0;

    document.querySelectorAll('.exercise-box').forEach(box => {
        let type = box.dataset.type;
        if (!type) return; // Αν είναι το κουτί γενικών σχολίων

        let exObj = { type: type, sets: [], note: box.querySelector('.ex-note').value.trim() };
        if (type === 'classic') {
            exObj.name = box.querySelector('.ex-name').value;
            box.querySelectorAll('.set-row').forEach(row => {
                const kilos = row.querySelector('.kilos').value;
                const reps = row.querySelector('.reps').value;
                exObj.sets.push({ kilos, reps });
                totalVolume += (parseFloat(kilos) || 0) * (parseFloat(reps) || 0);
            });
        } else {
            exObj.name1 = box.querySelector('.ex-name1').value;
            exObj.name2 = box.querySelector('.ex-name2').value;
            box.querySelectorAll('.set-row').forEach(row => {
                const kilos1 = row.querySelector('.kilos1').value;
                const reps1 = row.querySelector('.reps1').value;
                const kilos2 = row.querySelector('.kilos2').value;
                const reps2 = row.querySelector('.reps2').value;
                exObj.sets.push({ kilos1, reps1, kilos2, reps2 });
                totalVolume += ((parseFloat(kilos1) || 0) * (parseFloat(reps1) || 0)) + ((parseFloat(kilos2) || 0) * (parseFloat(reps2) || 0));
            });
        }
        exercisesData.push(exObj);
    });

    const workoutNote = document.getElementById('workout-note').value.trim();

    try {
        addDoc(collection(db, "workouts"), {
            userId: currentUser.uid,
            title: title.toUpperCase(),
            exercisesData: exercisesData,
            totalVolume: totalVolume,
            workoutNote: workoutNote, // Αποθήκευση γενικού σχολίου
            dateString: getTodayFormatted(),
            createdAtDate: new Date().toISOString(),
            createdAt: serverTimestamp()
        });

        triggerConfetti();
        msg.innerText = "Αποθηκεύτηκε!";
        setTimeout(() => { showScreen(listScreen); loadWorkouts(); }, 1200);
    } catch (e) { msg.style.color = '#ff453a'; msg.innerText = "Σφάλμα!"; saveBtn.disabled = false; }
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log("Service Worker Registered"))
        .catch(err => console.log("Service Worker Failed", err));
}