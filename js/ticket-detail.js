/* GoLive Asia — Ticket Detail Page Logic */
(function () {
  'use strict';

  var Auth = window.GoLive.Auth;
  var TicketStore = window.GoLive.TicketStore;
  var maskName = window.GoLive.maskName;

  // Auth check
  if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  // Get ticket ID from URL
  var params = new URLSearchParams(window.location.search);
  var ticketId = params.get('id');

  if (!ticketId) {
    window.location.href = 'my-tickets.html';
    return;
  }

  var tickets = TicketStore.getAll();
  var ticket = tickets.find(function (t) { return t.id === ticketId; });

  if (!ticket) {
    alert('Ticket not found');
    window.location.href = 'my-tickets.html';
    return;
  }

  // Hero image
  var heroImg = document.getElementById('detail-hero-img');
  if (heroImg) {
    heroImg.src = ticket.imageUrl || 'https://images.unsplash.com/photo-1603012870030-8f10a8fd0b9d?w=800';
    heroImg.alt = ticket.eventName;
  }

  // Badge
  var badge = document.getElementById('detail-badge');
  if (badge) badge.textContent = 'Concert';

  // Artist and tour
  var artistEl = document.getElementById('detail-artist');
  var tourEl = document.getElementById('detail-tour');
  if (artistEl) artistEl.textContent = ticket.eventName;
  if (tourEl) tourEl.textContent = ticket.tourTitle;

  // Chips
  var chips = document.getElementById('detail-chips');
  if (chips) {
    chips.innerHTML = 
      '<span class="chip">📅 ' + (ticket.date || '') + '</span>' +
      '<span class="chip">📍 ' + (ticket.venue || '') + '</span>' +
      '<span class="chip">🕐 ' + (ticket.time || '') + '</span>';
  }

  // Tabs for multiple tickets
  var tabsEl = document.getElementById('detail-tabs');
  if (tabsEl) {
    tabsEl.innerHTML = '';
    var ticketCount = ticket.tickets || 1;
    var holders = ticket.ticketHolders || [ticket.participant];
    
    for (var i = 0; i < ticketCount; i++) {
      var tab = document.createElement('button');
      tab.className = 'detail-tab' + (i === 0 ? ' active' : '');
      var holderName = holders[i] || ticket.participant || '';
      // Mask the name as in screenshot
      tab.textContent = 'Ticket ' + (i + 1) + ' | ' + holderName;
      tabsEl.appendChild(tab);
    }
  }

  // Ticket stub
  var stubTicketNo = document.getElementById('stub-ticketNo');
  var stubOrderId = document.getElementById('stub-orderId');
  var stubPrice = document.getElementById('stub-price');
  var stubParticipant = document.getElementById('stub-participant');
  var stubCategory = document.getElementById('stub-category');

  if (stubTicketNo) stubTicketNo.textContent = ticket.ticketNo || 'N/A';
  if (stubOrderId) stubOrderId.textContent = ticket.orderId || 'N/A';
  if (stubPrice) stubPrice.textContent = ticket.price || 'N/A';
  if (stubParticipant) {
    var participant = ticket.participant || ticket.participantRaw || '';
    stubParticipant.textContent = participant;
  }
  if (stubCategory) stubCategory.textContent = ticket.category || 'N/A';

  // Remove button
  var removeBtn = document.getElementById('remove-ticket-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', function () {
      if (confirm('Are you sure you want to remove this ticket?')) {
        TicketStore.remove(ticketId);
        alert('Ticket removed successfully');
        window.location.href = 'my-tickets.html';
      }
    });
  }
})();
