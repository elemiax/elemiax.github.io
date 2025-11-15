/* Demo client-side auth helper
   - Use a real backend for production (this is intentionally simple)
   - Demo credential: demo@elemiax.local / demo123
*/
window.Auth = (function(){
  const storageKey = 'elemiax_auth_token';
  const demoUser = {
    email: 'demo@elemiax.local',
    name: 'Demo User'
  };
  const demoPass = 'demo123';

  function _makeToken(user){
    // lightweight token for demo
    return btoa(JSON.stringify({u: user.email, n: user.name, iat: Date.now()}));
  }

  function isLoggedIn(){
    return !!localStorage.getItem(storageKey);
  }

  function getUser(){
    const t = localStorage.getItem(storageKey);
    if (!t) return null;
    try {
      const payload = JSON.parse(atob(t));
      return { email: payload.u, name: payload.n };
    } catch(e){ return null; }
  }

  function login(email, password, remember){
    return new Promise((resolve, reject) => {
      // Very simple validation for demo — replace with server check
      if (!email || !password) return reject('Enter email and password');
      // Accept demo account OR any password with "demo" prefix for testing
      if (email.toLowerCase() === demoUser.email && password === demoPass) {
        const token = _makeToken(demoUser);
        localStorage.setItem(storageKey, token);
        if (!remember) sessionStorage.setItem(storageKey + '_session', '1');
        return resolve(getUser());
      }
      // For other emails deny (demo only)
      return reject('Invalid credentials (demo only)');
    });
  }

  function logout(){
    localStorage.removeItem(storageKey);
    sessionStorage.removeItem(storageKey + '_session');
    // optional: clear intended route
    localStorage.removeItem('intended');
    return Promise.resolve();
  }

  // if session-only flag used, transfer token to sessionStorage (very simple)
  function init(){
    // if no local token but session flag set, treat as logged in? (demo logic)
    if (!localStorage.getItem(storageKey) && sessionStorage.getItem(storageKey + '_session')) {
      // restore a demo token into localStorage for the session only
      localStorage.setItem(storageKey, _makeToken(demoUser));
    }
  }

  // initialize automatically
  init();

  return {
    isLoggedIn,
    login,
    logout,
    getUser
  };
})();
