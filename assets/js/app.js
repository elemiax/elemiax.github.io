// Small behaviour for the index page
document.addEventListener('DOMContentLoaded', function(){
  const user = Auth.getUser();
  const uname = document.getElementById('username-display');
  const sessionInfo = document.getElementById('session-info');
  const logoutBtn = document.getElementById('logout-btn');

  if (user) {
    uname.textContent = user.name || user.email;
    sessionInfo.textContent = `Signed in as ${user.name || user.email}`;
  } else {
    // fallback (should have been redirected already)
    uname.textContent = 'Guest';
    sessionInfo.textContent = 'Not signed in';
  }

  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await Auth.logout();
    location.replace('login.html');
  });

  document.getElementById('open-profile').addEventListener('click', (e) => {
    e.preventDefault();
    const u = Auth.getUser();
    alert(`Profile (demo)\n\nName: ${u?.name || 'Unknown'}\nEmail: ${u?.email || 'Unknown'}\n\nThis data is stored locally in your browser for the demo.`);
  });
});
