/**
 * SkillBridge Core Logic
 * Handles global state, persistence (localStorage), and Firebase Auth.
 */

// --- FIREBASE CONFIG ---
// USER: Replace this with your actual Firebase config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyB_A1657N-t2d_wi29FB0KR46IpEc4LJcY",
  authDomain: "skillbridge-90549.firebaseapp.com",
  projectId: "skillbridge-90549",
  storageBucket: "skillbridge-90549.firebasestorage.app",
  messagingSenderId: "268047596275",
  appId: "1:268047596275:web:981617c2a2058fbe3a9586",
  measurementId: "G-LZNSQ2MCEG"
};

const SkillBridge = {
  // --- INITIAL DATA ---
  initData() {
    if (!localStorage.getItem('sb_initialized')) {
      const initialSkills = [
        { id: 1, title: 'React & Next.js Development', category: 'Technology', provider: 'Arjun Reddy', rating: 4.9, reviews: 18, price: 30, image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80', description: 'Master modern web development with React and Next.js.' },
        { id: 2, title: 'Brand Identity Design', category: 'Design', provider: 'Sarah Chen', rating: 4.8, reviews: 12, price: 25, image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&q=80', description: 'Create stunning brand identities that resonate.' },
        { id: 3, title: 'Arabic Calligraphy', category: 'Arts', provider: 'Omar Farooq', rating: 5.0, reviews: 8, price: 20, image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80', description: 'Learn the ancient art of beautiful writing.' },
        { id: 4, title: 'Python for Data Science', category: 'Technology', provider: 'Elena Rodriguez', rating: 4.7, reviews: 22, price: 35, image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', description: 'Analyze data like a pro using Python.' }
      ];

      const initialPosts = [
        { id: 1, author: 'Alex Chen', avatar: 'AC', content: 'Just finished my first React session with Arjun! Mind blown. Highly recommend him if you want to understand hooks.', likes: 12, comments: 3, time: '2h ago', category: 'Showcase' },
        { id: 2, author: 'Priya S.', avatar: 'PS', content: 'Anyone interested in a language exchange? Offering Hindi, looking for Spanish! 🇪🇸', likes: 8, comments: 15, time: '5h ago', category: 'Request' }
      ];

      const initialUser = {
        name: 'Arjun Reddy',
        email: 'arjun@example.com',
        credits: 120,
        skills: ['React', 'Next.js', 'UI/UX Design'],
        avatar: 'AR',
        location: 'Hyderabad, India'
      };

      localStorage.setItem('sb_skills', JSON.stringify(initialSkills));
      localStorage.setItem('sb_posts', JSON.stringify(initialPosts));
      localStorage.setItem('sb_currentUser', JSON.stringify(initialUser));
      localStorage.setItem('sb_users', JSON.stringify([initialUser]));
      localStorage.setItem('sb_notifications', JSON.stringify([
        { id: 1, type: 'exchange', text: 'Priya S. requested a React session', time: '10m ago', unread: true },
        { id: 2, type: 'msg', text: 'New message from Sarah Chen', time: '1h ago', unread: true }
      ]));
      localStorage.setItem('sb_initialized', 'true');
    }
  },

  // --- AUTH METHODS (REAL FIREBASE) ---
  async socialLogin(providerName) {
    if (typeof firebase === 'undefined') {
      console.warn("Firebase SDK not loaded. Falling back to static simulation.");
      return this.simulateSocialLogin(providerName);
    }

    try {
      let provider;
      if (providerName === 'Google') {
        provider = new firebase.auth.GoogleAuthProvider();
      } else if (providerName === 'GitHub') {
        provider = new firebase.auth.GithubAuthProvider();
      }

      const result = await firebase.auth().signInWithPopup(provider);
      const user = result.user;
      
      return this.updateCurrentUser({
        name: user.displayName,
        email: user.email,
        avatar: user.photoURL || user.displayName[0],
        credits: 100 // Welcome credits
      });
    } catch (error) {
      console.error("Auth error:", error);
      alert("Failed to connect with " + providerName + ": " + error.message);
      throw error;
    }
  },

  simulateSocialLogin(providerName) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.updateCurrentUser({
          name: providerName + " User",
          email: "user@" + providerName.toLowerCase() + ".com",
          avatar: providerName[0],
          credits: 100
        });
        resolve(user);
      }, 1000);
    });
  },

  // --- STATE HELPERS ---
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('sb_currentUser'));
  },

  updateCurrentUser(userData) {
    const user = { ...this.getCurrentUser(), ...userData };
    localStorage.setItem('sb_currentUser', JSON.stringify(user));
    return user;
  },

  isLoggedIn() {
    return !!localStorage.getItem('sb_currentUser');
  },

  logout() {
    localStorage.removeItem('sb_currentUser');
    if (typeof firebase !== 'undefined') firebase.auth().signOut();
    window.location.href = 'index.html';
  },

  // --- DATA ACCESS ---
  getSkills() {
    return JSON.parse(localStorage.getItem('sb_skills')) || [];
  },

  getPosts() {
    return JSON.parse(localStorage.getItem('sb_posts')) || [];
  },

  getNotifications() {
    return JSON.parse(localStorage.getItem('sb_notifications')) || [];
  },

  addSkill(skill) {
    const skills = this.getSkills();
    const newSkill = { id: Date.now(), ...skill };
    skills.unshift(newSkill);
    localStorage.setItem('sb_skills', JSON.stringify(skills));
    return newSkill;
  },

  addPost(post) {
    const posts = this.getPosts();
    const newPost = { id: Date.now(), ...post, likes: 0, comments: 0, time: 'Just now' };
    posts.unshift(newPost);
    localStorage.setItem('sb_posts', JSON.stringify(posts));
    return newPost;
  },

  // --- UI UPDATES ---
  updateNav() {
    const user = this.getCurrentUser();
    const navActions = document.querySelector('.nav-actions');

    if (user && navActions) {
      navActions.innerHTML = `
        <div class="user-chip" onclick="location.href='dashboard.html'" style="display:flex; align-items:center; gap:0.8rem; cursor:pointer; background:rgba(124,106,255,0.1); padding:0.4rem 0.8rem; border-radius:100px; border:1px solid var(--border);">
          <span style="font-size:0.8rem; font-weight:600; color:var(--accent);">${user.credits} SC</span>
          <div style="width:30px; height:30px; border-radius:50%; background:var(--accent); display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:0.7rem;">${user.avatar}</div>
        </div>
        <button onclick="SkillBridge.logout()" class="btn-ghost" style="padding:0.4rem 0.8rem; font-size:0.75rem;">Logout</button>
      `;
    }
  }
};

// Auto-init
SkillBridge.initData();
window.addEventListener('DOMContentLoaded', () => SkillBridge.updateNav());
