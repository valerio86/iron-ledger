export const getAuth = () => (window.__authObj = { currentUser: null });
export const onAuthStateChanged = (a, cb) => { window.__auth = u => { a.currentUser = u; return cb(u); }; };
export const signOut = async a => { a.currentUser = null; };
export const deleteUser = async u => { if (window.__deleteFails) throw { code: "auth/requires-recent-login" }; window.__deleted = true; };
export class GoogleAuthProvider {}
