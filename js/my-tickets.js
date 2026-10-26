/* GoLive Asia — My Tickets Page Logic */
(function () {
  'use strict';

  var Auth = window.GoLive.Auth;
  var TicketStore = window.GoLive.TicketStore;
  var maskName = window.GoLive.maskName;

  // Ensure seeded
  if (!localStorage.getItem('golive_tickets')) {
    TicketStore.seed();
  }

  // Auth check
  var user = Auth.getUser();
  if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  // Update nav
  var userGreeting = document.getElementById('user-greeting');
  var userAvatar = document.getElementById('user-avatar');
  if (userGreeting) userGreeting.textContent = 'Hi, ' + (user.name || 'User');
  if (userAvatar) userAvatar.textContent = (user.name || 'U').charAt(0).toUpperCase();

  // Logout
  var logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', function (e) {
      e.preventDefault();
      Auth.logout();
    });
  }

  // Render tickets
  function renderTickets(filterQuery) {
    var allTickets = filterQuery ? TicketStore.search(filterQuery) : TicketStore.getAll();
    var upcoming = allTickets.filter(function (t) { return t.status === 'upcoming'; });
    var past = allTickets.filter(function (t) { return t.status === 'past'; });

    var upcomingCarousel = document.getElementById('upcoming-carousel');
    var pastCarousel = document.getElementById('past-carousel');
    var upcomingEmpty = document.getElementById('upcoming-empty');
    var pastEmpty = document.getElementById('past-empty');

    // Upcoming
    if (upcomingCarousel) {
      upcomingCarousel.innerHTML = '';
      if (upcoming.length === 0) {
        if (upcomingEmpty) upcomingEmpty.style.display = 'block';
      } else {
        if (upcomingEmpty) upcomingEmpty.style.display = 'none';
        upcoming.forEach(function (ticket) {
          var card = document.createElement('a');
          card.href = 'ticket-detail.html?id=' + encodeURIComponent(ticket.id);
          card.className = 'ticket-card';
          
          var ticketCount = ticket.tickets || 1;
          var countText = ticketCount === 1 ? '1 Ticket' : ticketCount + ' Tickets';
          
          card.innerHTML = 
            '<img src="' + (ticket.imageUrl || 'https://images.unsplash.com/photo-1603012870030-8f10a8fd0b9d?w=800') + '" alt="' + ticket.eventName + '" class="ticket-card-bg">' +
            '<div class="ticket-card-overlay"></div>' +
            '<div class="ticket-date-badge">' + (ticket.date || '').toUpperCase() + '</div>' +
            '<div class="ticket-venue-badge">' + (ticket.venue || '') + '</div>' +
            '<div class="ticket-card-content">' +
              '<div class="ticket-tour-title">' + (ticket.tourTitle || '') + '</div>' +
              '<div class="ticket-artist-name">' + (ticket.eventName || '') + '</div>' +
              '<div class="ticket-count-pill">🎫 ' + countText + '</div>' +
            '</div>';
          
          upcomingCarousel.appendChild(card);
        });
      }
    }

    // Past
    if (pastCarousel) {
      pastCarousel.innerHTML = '';
      if (past.length === 0) {
        if (pastEmpty) pastEmpty.style.display = 'block';
      } else {
        if (pastEmpty) pastEmpty.style.display = 'none';
        past.forEach(function (ticket) {
          var card = document.createElement('a');
          card.href = 'ticket-detail.html?id=' + encodeURIComponent(ticket.id);
          card.className = 'ticket-card';
          
          var ticketCount = ticket.tickets || 1;
          var countText = ticketCount === 1 ? '1 Ticket' : ticketCount + ' Tickets';
          
          card.innerHTML = 
            '<img src="' + (ticket.imageUrl || 'https://images.unsplash.com/photo-1603012870030-8f10a8fd0b9d?w=800') + '" alt="' + ticket.eventName + '" class="ticket-card-bg">' +
            '<div class="ticket-card-overlay"></div>' +
            '<div class="ticket-date-badge">' + (ticket.date || '').toUpperCase() + '</div>' +
            '<div class="ticket-venue-badge">' + (ticket.venue || '') + '</div>' +
            '<div class="ticket-card-content">' +
              '<div class="ticket-tour-title">' + (ticket.tourTitle || '') + '</div>' +
              '<div class="ticket-artist-name">' + (ticket.eventName || '') + '</div>' +
              '<div class="ticket-count-pill">🎫 ' + countText + '</div>' +
            '</div>';
          
          pastCarousel.appendChild(card);
        });
      }
    }
  }

  // Search
  var searchInput = document.getElementById('ticket-search');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderTickets(this.value);
    });
  }

  // Carousel arrows
  var upcomingPrev = document.getElementById('upcoming-prev');
  var upcomingNext = document.getElementById('upcoming-next');
  var pastPrev = document.getElementById('past-prev');
  var pastNext = document.getElementById('past-next');
  var upcomingCarouselEl = document.getElementById('upcoming-carousel');
  var pastCarouselEl = document.getElementById('past-carousel');

  if (upcomingPrev && upcomingCarouselEl) {
    upcomingPrev.addEventListener('click', function () {
      upcomingCarouselEl.scrollBy({ left: -300, behavior: 'smooth' });
    });
  }
  if (upcomingNext && upcomingCarouselEl) {
    upcomingNext.addEventListener('click', function () {
      upcomingCarouselEl.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }
  if (pastPrev && pastCarouselEl) {
    pastPrev.addEventListener('click', function () {
      pastCarouselEl.scrollBy({ left: -300, behavior: 'smooth' });
    });
  }
  if (pastNext && pastCarouselEl) {
    pastNext.addEventListener('click', function () {
      pastCarouselEl.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }

  // Initial render
  renderTickets();
})();
