/* GoLive Asia — localStorage-based Auth + Tickets */
(function () {
  'use strict';

  // ── Keys ──────────────────────────────────────────────
  var K_USER = 'golive_user';
  var K_TICKETS = 'golive_tickets';
  var K_USERS = 'golive_users';

  // ── User ──────────────────────────────────────────────
  var Auth = {
    getUser: function () {
      try { return JSON.parse(localStorage.getItem(K_USER)); } catch (e) { return null; }
    },
    setUser: function (u) { localStorage.setItem(K_USER, JSON.stringify(u)); },
    logout: function () {
      localStorage.removeItem(K_USER);
      window.location.href = 'login.html';
    },
    isLoggedIn: function () {
      var u = Auth.getUser();
      return !!(u && u.loggedIn);
    }
  };

  // ── Tickets ───────────────────────────────────────────
  var TicketStore = {
    getAll: function () {
      try { return JSON.parse(localStorage.getItem(K_TICKETS)) || []; }
      catch (e) { return []; }
    },
    save: function (arr) { localStorage.setItem(K_TICKETS, JSON.stringify(arr)); },
    add: function (t) {
      var arr = TicketStore.getAll();
      t.id = t.id || ('t' + Date.now() + Math.floor(Math.random() * 1000));
      arr.push(t);
      TicketStore.save(arr);
      return t;
    },
    remove: function (id) {
      var arr = TicketStore.getAll().filter(function (t) { return t.id !== id; });
      TicketStore.save(arr);
    },
    removeTicket: function (id) {
      var arr = TicketStore.getAll().filter(function (t) { return t.id !== id; });
      TicketStore.save(arr);
    },
    getByStatus: function (status) {
      return TicketStore.getAll().filter(function (t) { return t.status === status; });
    },
    search: function (q) {
      if (!q) return TicketStore.getAll();
      q = q.toLowerCase();
      return TicketStore.getAll().filter(function (t) {
        return (t.eventName || '').toLowerCase().indexOf(q) !== -1 ||
          (t.tourTitle || '').toLowerCase().indexOf(q) !== -1 ||
          (t.venue || '').toLowerCase().indexOf(q) !== -1;
      });
    },
    seed: function () {
      if (localStorage.getItem(K_TICKETS)) return;
      var seed = [
        {
          id: 'seed-1',
          eventName: 'BTS',
          tourTitle: "WORLD TOUR 'ARIRANG' IN KUALA LUMPUR",
          date: '12 Dec 2026',
          venue: 'TM Stadium Nasional',
          time: '7:30 PM',
          category: 'VIP',
          price: 'RM 1,288.00',
          ticketNo: 'TCK-7F3A9B2D',
          orderId: 'ORD-2026-4481',
          participant: 'Luqman H***',
          participantRaw: 'Luqman Haziq',
          imageUrl: 'https://images.unsplash.com/photo-1603012870030-8f10a8fd0b9d?w=800',
          status: 'upcoming',
          tickets: 2,
          ticketHolders: ['Luqman H***', 'Aina S***']
        },
        {
          id: 'seed-2',
          eventName: 'BLACKPINK',
          tourTitle: 'WORLD TOUR IN KUALA LUMPUR',
          date: '24 Jan 2027',
          venue: 'Axiata Arena',
          time: '8:00 PM',
          category: 'CAT 1',
          price: 'RM 538.00',
          ticketNo: 'TCK-2E9C4A1F',
          orderId: 'ORD-2026-5520',
          participant: 'Luqman H***',
          participantRaw: 'Luqman Haziq',
          imageUrl: 'https://images.unsplash.com/photo-1614683505751-dff6021b4d8e?w=800',
          status: 'upcoming',
          tickets: 1,
          ticketHolders: ['Luqman H***']
        }
      ];
      localStorage.setItem(K_TICKETS, JSON.stringify(seed));
    }
  };

  // ── Masking helper ────────────────────────────────────
  function maskName(name) {
    if (!name) return '***';
    var parts = name.split(/\s+/);
    return parts.map(function (p) {
      if (p.length <= 2) return p;
      return p[0] + '***';
    }).join(' ');
  }

  // ── Export ────────────────────────────────────────────
  window.GoLive = {
    Auth: Auth,
    TicketStore: TicketStore,
    maskName: maskName,
    K_USER: K_USER,
    K_TICKETS: K_TICKETS,
    K_USERS: K_USERS
  };

  // Seed on load
  if (!localStorage.getItem(K_TICKETS)) TicketStore.seed();
})();
