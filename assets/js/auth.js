/* Demo client-side auth helper with registration support
   - Use a real backend for production (this is intentionally simple)
   - Demo credential: demo@elemiax.local / demo123
   - Registration permits only @elemiax.local emails and persists users in localStorage under 'elemiax_users'
*/
window.Auth = (function(){
  const tokenKey = 'elemiax_auth_token';
  const usersKey = 'elemiax_users';
  const demoUser = {
    email: 'demo@elemiax.local',
    name: 'Demo User'
  };
  const demoPass = 'demo123';

  function _makeToken(user){
    // lightweight token for demo
    return btoa(JSON.stringify({u: user.email, n: user.name, iat: Date.now()}));
  }

  function _getUsers(){
    try {
      const raw = localStorage.getItem(usersKey);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch(e){ return []; }
  }

  function _saveUsers(list){
    localStorage.setItem(usersKey, JSON.stringify(list));
  }

  function _findUser(email){
    const list = _getUsers();
    return list.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || null;
  }

  function isLoggedIn(){
    return !!localStorage.getItem(tokenKey);
  }

  function getUser(){
    const t = localStorage.getItem(tokenKey);
    if (!t) return null;
    try {
      const payload = JSON.parse(atob(t));
      return { email: payload.u, name: payload.n };
    } catch(e){ return null; }
  }

  function login(email, password, remember){
    return new Promise((resolve, reject) => {
      if (!email || !password) return reject('Enter email and password');

      // check demo account
      if (email.toLowerCase() === demoUser.email && password === demoPass) {
        const token = _makeToken(demoUser);
        localStorage.setItem(tokenKey, token);
        if (!remember) sessionStorage.setItem(tokenKey + '_session', '1');
        return resolve(getUser());
      }

      // check registered users
      const user = _findUser(email);
      if (!user) return reject('No such account. Register first (demo only)');
      // stored password is base64-encoded (demo only)
      const stored = user.pw || '';
      if (stored === btoa(password)) {
        const token = _makeToken({ email: user.email, name: user.name });
        localStorage.setItem(tokenKey, token);
        if (!remember) sessionStorage.setItem(tokenKey + '_session', '1');
        return resolve(getUser());
      }
      return reject('Invalid credentials');
    });
  }

  function register(email, name, password){
    return new Promise((resolve, reject) => {
      if (!email || !password || !name) return reject('Please enter name, email and password');
      const lower = email.toLowerCase();

      if (!lower.endsWith('@elemiax.local')) {
        return reject('Registration limited to @elemiax.local emails (demo requirement)');
      }

      if (_findUser(email)) {
        return reject('An account with that email already exists');
      }

      // very small password rule for demo
      if (password.length < 6) return reject('Password must be at least 6 characters');

      const users = _getUsers();
      users.push({
        email: lower,
        name: name,
        // DO NOT store plain text passwords in production. This is demo-only.
        pw: btoa(password)
      });
      _saveUsers(users);
      return resolve({ email: lower, name });
    });
  }

  function logout(){
    localStorage.removeItem(tokenKey);
    sessionStorage.removeItem(tokenKey + '_session');
    localStorage.removeItem('intended');
    return Promise.resolve();
  }

  function init(){
    // if no local token but session flag set, restore a session token for demo user
    if (!localStorage.getItem(tokenKey) && sessionStorage.getItem(tokenKey + '_session')) {
      // if a registered user exists, we should not be able to reconstruct user without server;
      // for demo we restore demo user token
      localStorage.setItem(tokenKey, _makeToken(demoUser));
    }
  }

  // initialize automatically
  init();

  return {
    isLoggedIn,
    login,
    logout,
    getUser,
    register
  };
})();
