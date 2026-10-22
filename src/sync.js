/* Optional account + cloud sync (Firebase Auth + Firestore). The app works the same without it.
   Cloud layout: users/{uid}/docs/{encoded path} = { p: path, d: JSON string | null, at: client ms, del, sat: server time }.
   d is a string so any shape the app stores is accepted (Firestore rejects nested arrays and undefined).
   Pull: listen for docs with sat newer than the last one seen on this device. Push: every local change.
   Conflicts: the newer `at` wins, per doc. */
import config from "./firebase-config.js";

const V = "10.12.2";
const S = window.Sync = { state: { configured: !!config, user: null, status: "off", msg: "" } };
const set = (o) => { Object.assign(S.state, o); if (typeof render === "function") render(); };

const AUTH_MSG = {
  "auth/invalid-credential": "Wrong email or password.", "auth/wrong-password": "Wrong email or password.", "auth/user-not-found": "No account with that email.",
  "auth/email-already-in-use": "There's already an account with that email. Sign in instead.", "auth/weak-password": "Use at least 6 characters.",
  "auth/invalid-email": "That email doesn't look right.", "auth/too-many-requests": "Too many tries. Wait a few minutes.",
  "auth/popup-closed-by-user": "Sign-in window closed.", "auth/popup-blocked": "The browser blocked the sign-in window. Allow pop-ups and try again.",
  "auth/configuration-not-found": "Sign-in isn't switched on for this app yet.", "auth/operation-not-allowed": "That sign-in method isn't switched on yet.",
  "auth/unauthorized-domain": "Sign-in isn't allowed from this web address yet.",
  "auth/network-request-failed": "No connection. Try again when you're online.", "auth/requires-recent-login": "For safety, sign out and back in, then try again.",
};
const friendly = e => AUTH_MSG[e?.code] || e?.message || "Something went wrong.";

if (config) start().catch(e => set({ status: "error", msg: friendly(e) }));

async function start() {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`),
  ]);
  const app = initializeApp(config);
  const auth = A.getAuth(app);
  const fs = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) });
  const store = await LocalStore.open();
  const enc = p => encodeURIComponent(p);
  let uid = null, unsub = null, live = false;

  const col = () => F.collection(fs, "users", uid, "docs");
  async function push(path) {
    const m = store.pending().find(x => x.path === path); if (!m || !uid) return;
    set({ status: "saving" });
    try {
      await F.setDoc(F.doc(col(), enc(path)), { p: path, d: m.del ? null : JSON.stringify(m.data ?? null), at: m.at, del: !!m.del, sat: F.serverTimestamp() });
      await store.markSynced(path, m.at);
    } catch (e) { set({ status: "error", msg: friendly(e) }); return; }
    if (!store.pending().length) set({ status: "synced", msg: "" });
  }
  store.onWrite(path => { if (uid && live) push(path); });

  function startSync() {
    const since = store.kv("sat:" + uid) || 0;
    set({ status: "syncing" });
    unsub = F.onSnapshot(F.query(col(), F.where("sat", ">", F.Timestamp.fromMillis(since))), { includeMetadataChanges: true }, async snap => {
      const rows = []; let maxSat = store.kv("sat:" + uid) || 0;
      for (const ch of snap.docChanges()) {
        if (ch.type === "removed" || ch.doc.metadata.hasPendingWrites) continue;
        const d = ch.doc.data();
        if (d.sat) maxSat = Math.max(maxSat, d.sat.toMillis());
        rows.push({ path: d.p, at: d.at, del: !!d.del, data: d.d == null ? undefined : JSON.parse(d.d) });
      }
      if (rows.length) await store.applyRemote(rows);
      if (maxSat) await store.setKv("sat:" + uid, maxSat);
      // Once the server has answered (not just the offline cache), send what this device changed meanwhile
      if (!snap.metadata.fromCache && !live) {
        live = true;
        for (const m of store.pending()) await push(m.path);
        if (!store.pending().length) set({ status: "synced", msg: "" });
      }
    }, e => set({ status: "error", msg: friendly(e) }));
  }

  A.onAuthStateChanged(auth, async user => {
    unsub?.(); unsub = null; live = false;
    if (!user) { uid = null; set({ user: null, status: "off" }); return; }
    // Another account's data on this device: clear it first. Data logged before ever signing in is kept and uploaded.
    const owner = store.kv("owner");
    if (owner && owner !== user.uid) await store.wipe();
    await store.setKv("owner", user.uid);
    uid = user.uid;
    set({ user: { email: user.email, name: user.displayName } });
    window.dispatchEvent(new Event("il-user"));
    startSync();
  });

  Object.assign(S, {
    google: () => A.signInWithPopup(auth, new A.GoogleAuthProvider()).catch(e => { throw friendly(e); }),
    signIn: (email, pw) => A.signInWithEmailAndPassword(auth, email, pw).catch(e => { throw friendly(e); }),
    signUp: (email, pw) => A.createUserWithEmailAndPassword(auth, email, pw).catch(e => { throw friendly(e); }),
    reset: email => A.sendPasswordResetEmail(auth, email).catch(e => { throw friendly(e); }),
    // For a script on the user's computer: it trades the refresh token for short-lived ID tokens and writes via REST
    idToken: () => auth.currentUser.getIdToken(),
    connectorKey: () => ({ apiKey: config.apiKey, projectId: config.projectId, uid, refreshToken: auth.currentUser.refreshToken }),
    // Signing out removes the log from this device; it stays in the account
    async signOut() { unsub?.(); unsub = null; live = false; await A.signOut(auth); await store.wipe(); },
    async deleteAccount() {
      const user = auth.currentUser; if (!user) return;
      try {
        unsub?.(); unsub = null; live = false;
        const docs = await F.getDocs(col());
        for (let i = 0; i < docs.docs.length; i += 400) {
          const b = F.writeBatch(fs); docs.docs.slice(i, i + 400).forEach(d => b.delete(d.ref)); await b.commit();
        }
        await A.deleteUser(user);
      } catch (e) { if (auth.currentUser) startSync(); throw friendly(e); }
      await store.wipe();
    },
  });
  set({ ready: true });
}
