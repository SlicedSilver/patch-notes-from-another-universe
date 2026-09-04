(() => {
  const app = document.querySelector('#app');
  const SESSION_KEY = 'patch-notes-session';
  const PLAYER_KEY = 'patch-notes-player';
  let socket = null;
  let session = null;
  let roomState = null;
  let customOpen = false;
  let reconnectTimer = null;
  let countdownTimer = null;

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  }

  function toast(message) {
    const node = document.querySelector('#toast-template').content.firstElementChild.cloneNode(true);
    node.textContent = message;
    document.body.append(node);
    setTimeout(() => node.remove(), 2800);
  }

  function playerId() {
    let value = localStorage.getItem(PLAYER_KEY);
    if (!value) {
      value = crypto.randomUUID();
      localStorage.setItem(PLAYER_KEY, value);
    }
    return value;
  }

  function makeRoomCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const values = new Uint32Array(6);
    crypto.getRandomValues(values);
    return Array.from(values, value => alphabet[value % alphabet.length]).join('');
  }

  function saveSession(next) {
    session = next;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  }

  function loadSession() {
    try {
      const value = sessionStorage.getItem(SESSION_KEY);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  function clearSession() {
    session = null;
    roomState = null;
    customOpen = false;
    sessionStorage.removeItem(SESSION_KEY);
    socket?.close();
    socket = null;
    clearTimeout(reconnectTimer);
    clearInterval(countdownTimer);
  }

  function wsAddress(roomCode) {
    const scheme = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${scheme}//${location.host}/api/rooms/${roomCode}/ws?playerId=${encodeURIComponent(playerId())}`;
  }

  function connect(nextSession) {
    clearTimeout(reconnectTimer);
    saveSession(nextSession);
    roomState = null;
    renderConnecting();
    socket?.close();
    socket = new WebSocket(wsAddress(nextSession.roomCode));
    socket.addEventListener('open', () => {
      send({
        type: 'join',
        roomCode: nextSession.roomCode,
        name: nextSession.name,
        wantsHost: nextSession.wantsHost,
        totalRounds: nextSession.totalRounds,
        seconds: nextSession.seconds,
        allowCustom: nextSession.allowCustom,
      });
    });
    socket.addEventListener('message', event => {
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (message.type === 'state') {
        roomState = message.state;
        customOpen = false;
        renderRoom();
      } else if (message.type === 'error') {
        toast(message.message || 'Something went wrong.');
      }
    });
    socket.addEventListener('close', () => {
      if (!session) return;
      renderConnecting('Reconnecting to the room…');
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => connect(session), 1_500);
    });
    socket.addEventListener('error', () => socket?.close());
  }

  function send(message) {
    if (socket?.readyState !== WebSocket.OPEN) return toast('The room is reconnecting. Try again in a moment.');
    socket.send(JSON.stringify(message));
  }

  function copy(text) {
    navigator.clipboard?.writeText(text).then(() => toast('Join link copied.')).catch(() => toast('Copy the link from your browser address bar.'));
  }

  function header(right = '') {
    return `<div class="shell"><header class="topbar"><div class="brand"><span class="brand-mark">v∞</span> Patch Notes From Another Universe</div>${right}</header>`;
  }

  function renderConnecting(message = 'Connecting to your room…') {
    clearInterval(countdownTimer);
    app.innerHTML = `${header('<button class="ghost" id="leave">Leave room</button>')}<section class="intro compact"><div class="eyebrow">LIVE ROOM</div><h1>${esc(message)}</h1><p class="lead">Your place is reserved. If this takes more than a moment, check that the local game server is still running.</p></section></div>`;
    document.querySelector('#leave').onclick = () => { clearSession(); renderLanding(); };
  }

  function renderLanding() {
    clearInterval(countdownTimer);
    const queryRoom = new URLSearchParams(location.search).get('room')?.toUpperCase() || '';
    app.innerHTML = `${header()}<section class="intro"><div class="eyebrow">A live 45-second release-note party game</div><h1>Ship nonsense.<br><span>Win glory.</span></h1><p class="lead">Join one shared room. Everyone gets a private hand, submits directly, and watches each reveal together.</p><div class="setup"><form class="panel" id="host-form"><h2>Start a live room</h2><p>You control the rounds; a different player judges each reveal.</p><label for="host-name">Your name</label><input id="host-name" required maxlength="32" placeholder="Aisha" autocomplete="name" /><div class="form-row"><div><label for="rounds">Rounds</label><select id="rounds"><option value="6">6 quick rounds</option><option value="8" selected>8 rounds</option><option value="12">12 rounds</option></select></div><div><label for="seconds">Pick time</label><select id="seconds"><option value="30">30 seconds</option><option value="45" selected>45 seconds</option><option value="60">60 seconds</option></select></div></div><label class="check"><input id="custom" type="checkbox" checked /> Let players write one of their own</label><button class="primary" type="submit">Create room →</button></form><form class="panel" id="join-form"><h2>Join a room</h2><p>Enter the six-character room code from your host.</p><label for="join-name">Your name</label><input id="join-name" required maxlength="32" placeholder="Ben" autocomplete="name" /><label for="room-code">Room code</label><input id="room-code" required maxlength="6" pattern="[A-Za-z0-9]{6}" value="${esc(queryRoom)}" placeholder="A1B2C3" autocapitalize="characters" /><button class="secondary" type="submit" style="margin-top:18px">Join live room →</button></form></div><section class="three-up"><div class="notice"><strong>Private hands</strong><br>Only you receive your answer cards.</div><div class="notice"><strong>No side chat</strong><br>Submit directly inside the game.</div><div class="notice"><strong>Live reveal</strong><br>Every score updates for everyone.</div></section></section></div>`;
    document.querySelector('#host-form').onsubmit = event => {
      event.preventDefault();
      const name = document.querySelector('#host-name').value.trim();
      if (!name) return;
      const roomCode = makeRoomCode();
      history.replaceState(null, '', `${location.pathname}?room=${roomCode}`);
      connect({ roomCode, name, wantsHost: true, totalRounds: Number(document.querySelector('#rounds').value), seconds: Number(document.querySelector('#seconds').value), allowCustom: document.querySelector('#custom').checked });
    };
    document.querySelector('#join-form').onsubmit = event => {
      event.preventDefault();
      const name = document.querySelector('#join-name').value.trim();
      const roomCode = document.querySelector('#room-code').value.trim().toUpperCase();
      if (!name || !/^[A-Z0-9]{6}$/.test(roomCode)) return toast('Enter your name and a six-character room code.');
      history.replaceState(null, '', `${location.pathname}?room=${roomCode}`);
      connect({ roomCode, name, wantsHost: false });
    };
  }

  function phaseLabel(phase) {
    return ({ lobby: 'LOBBY', submitting: 'PICK A CARD', closed: 'TIME', reveal: 'REVEAL', 'round-complete': 'ROUND COMPLETE', finished: 'RELEASE TRAIN COMPLETE' })[phase] || 'LIVE ROOM';
  }

  function timerText() {
    if (!roomState?.deadline) return roomState?.phase === 'closed' ? 'TIME' : '—';
    const remaining = Math.max(0, Math.ceil((roomState.deadline - Date.now()) / 1_000));
    return `0:${String(remaining).padStart(2, '0')}`;
  }

  function promptText(prompt) {
    return esc(prompt).replace('___', '<span class="blank">___</span>');
  }

  function completedReleaseNote(prompt, answer) {
    return esc(prompt).replace('___', `<span class="release-answer">${esc(answer)}</span>`);
  }

  function renderRoom() {
    clearInterval(countdownTimer);
    const game = roomState;
    if (!game) return renderConnecting();
    const joinLink = `${location.origin}${location.pathname}?room=${game.roomCode}`;
    const players = game.players.map(player => `<span class="score">${esc(player.name)} <b>${player.score}</b>${player.submitted ? ' ✓' : ''}</span>`).join('');
    const productLockup = game.product && game.round ? `<div class="product-lockup"><span>Fictional application</span><strong>${esc(game.product[0])}</strong><em>${esc(game.product[1])}</em></div>` : '';
    const entries = game.submissions.map(entry => `<article class="submission"><span class="who">ANONYMOUS PATCH · ${esc(game.product?.[0] || 'RELEASE')}</span><p class="release-note">${completedReleaseNote(game.prompt, entry.answer)}</p>${game.isJudge && game.phase === 'reveal' ? `<button class="secondary pick-winner" data-entry="${esc(entry.id)}">Pick this release note</button>` : ''}</article>`).join('');
    const cards = game.hand.map((card, index) => `<button class="card player-card" data-card="${index}" ${game.hasSubmitted ? 'disabled' : ''}>${esc(card)}<span class="index">${index + 1}</span></button>`).join('');
    const phaseHelp = game.phase === 'lobby' ? 'Wait for the host to start the first absurd release.' : game.phase === 'submitting' ? (game.isJudge ? 'You are judging this round. Watch the submissions roll in.' : game.hasSubmitted ? 'Submission locked. Enjoy the suspense.' : 'Choose a card before the timer runs out.') : game.phase === 'closed' ? 'Time is up. The host can reveal the entries.' : game.phase === 'reveal' ? (game.isJudge ? 'You are the judge. Pick the funniest patch.' : `Waiting for ${esc(game.judgeName)} to choose.`) : game.phase === 'round-complete' ? `${esc(game.winnerName)} takes the point.` : 'The final changelog has shipped.';
    app.innerHTML = `${header('<button class="ghost" id="leave">Leave room</button>')}<section class="round-grid"><div><div class="round-meta"><span class="pill">${phaseLabel(game.phase)} · ROUND ${game.round || 0} / ${game.totalRounds}</span></div><article class="prompt-card">${productLockup}<span class="eyebrow">${game.product && game.round ? `RELEASE ${game.round}.0.0` : 'The release train is boarding'}</span><p class="prompt">${game.prompt ? promptText(game.prompt) : 'Invite your team, then start the first release note.'}</p></article></div><aside class="sidebar"><section class="timer"><strong id="timer-value">${timerText()}</strong><small>${game.phase === 'submitting' ? 'LIVE SUBMISSIONS' : 'ROOM STATUS'}</small></section><section class="room-card"><h3>Invite players</h3><div class="room-code">${esc(game.roomCode)}</div><p>They can join directly — no separate chat needed.</p><button class="secondary" id="copy-link">Copy join link</button></section><section class="room-card"><h3>${game.judgeName ? 'Round judge' : 'How it works'}</h3><p>${game.judgeName ? `<strong>${esc(game.judgeName)}</strong> picks the winning patch.` : 'The host starts each round; the judge rotates.'}</p></section></aside></section><section class="host-stage live-status"><h2>${phaseHelp}</h2><div class="scoreboard">${players}</div>${game.canStart ? `<div class="host-actions"><button class="primary" id="start-round">${game.round ? 'Next release note →' : 'Start first release →'}</button></div>` : ''}${game.isHost && (game.phase === 'submitting' || game.phase === 'closed') ? `<div class="host-actions"><button class="secondary" id="reveal">Reveal submissions</button></div>` : ''}</section>${game.phase === 'submitting' ? `<section class="hands"><div class="hands-title"><h2>${game.isJudge ? 'Judge’s bench' : game.hasSubmitted ? 'Your answer is in' : 'Your private hand'}</h2><span class="mono">${game.isJudge ? 'NO SUBMISSION' : game.hasSubmitted ? 'LOCKED' : '10 CARDS + CUSTOM'}</span></div>${game.isJudge ? '<div class="notice">You are judging this round, so you sit out the card selection. You will choose the winner after the reveal.</div>' : game.hasSubmitted ? '<div class="notice">Your answer is safely locked. It will stay hidden until the reveal.</div>' : `<div class="cards">${cards}${game.allowCustom ? '<button class="card custom-card" id="write-own">✎ Write your own patch<span class="index">CUSTOM</span></button>' : ''}</div>${customOpen ? '<form class="custom-answer" id="custom-form"><label for="custom-text">Your patch</label><input id="custom-text" maxlength="120" autofocus placeholder="a highly competent llama" /><button class="primary">Submit custom answer</button></form>' : ''}`}</section>` : ''}${['reveal', 'round-complete', 'finished'].includes(game.phase) ? `<section class="host-stage release-candidates"><div class="hands-title"><h2>${game.phase === 'reveal' ? 'Candidate release notes' : 'Round results'}</h2><span class="mono">${game.submissions.length} COMPLETE RELEASES</span></div><div class="submissions">${entries || '<div class="notice">Nobody submitted a patch this round.</div>'}</div></section>` : ''}</div>`;
    document.querySelector('#leave').onclick = () => { clearSession(); history.replaceState(null, '', location.pathname); renderLanding(); };
    document.querySelector('#copy-link').onclick = () => copy(joinLink);
    document.querySelector('#start-round')?.addEventListener('click', () => send({ type: 'start-round' }));
    document.querySelector('#reveal')?.addEventListener('click', () => send({ type: 'reveal' }));
    document.querySelectorAll('.player-card').forEach(card => card.addEventListener('click', () => send({ type: 'submit', cardIndex: Number(card.dataset.card) })));
    document.querySelector('#write-own')?.addEventListener('click', () => { customOpen = true; renderRoom(); });
    document.querySelector('#custom-form')?.addEventListener('submit', event => { event.preventDefault(); const answer = document.querySelector('#custom-text').value.trim(); if (!answer) return; send({ type: 'submit', customAnswer: answer }); });
    document.querySelectorAll('.pick-winner').forEach(button => button.addEventListener('click', () => send({ type: 'choose-winner', submissionId: button.dataset.entry })));
    if (game.phase === 'submitting') countdownTimer = setInterval(() => { const node = document.querySelector('#timer-value'); if (node) node.textContent = timerText(); }, 200);
  }

  const saved = loadSession();
  if (saved?.roomCode && saved?.name) connect(saved); else renderLanding();
})();
