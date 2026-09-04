import { DurableObject } from "cloudflare:workers";

const ANSWERS = [
  "a suspiciously confident raccoon", "CSS, but wetter", "the CEO’s pet lizard",
  "11,000 identical notifications", "a deeply personal spreadsheet", "an unexpectedly judgmental tooltip",
  "the concept of weekends", "a legally distinct space whale", "a premium apology",
  "three pigeons in a trench coat", "a badly timed confetti cannon", "the moon’s privacy policy",
  "a keyboard shortcut nobody can prove exists", "an alarming amount of hummus", "a haunted PDF",
  "the user’s third monitor", "a very small but determined asteroid", "a calendar invite from 2018",
  "the absence of a product manager", "a non-consensual team-building exercise", "a pop-up that knows your full name",
  "an aggressively optimistic loading spinner", "the ghost of Internet Explorer", "a 14-hour free trial",
  "the phrase “quick question”", "a fresh coat of technical debt", "the office ficus",
  "a plugin called Greg", "the last clean coffee mug", "a dropdown with too much confidence",
  "the Wi-Fi password written on a banana", "some extremely premium whitespace", "a morally ambiguous checkbox",
  "a timeout with abandonment issues", "the world’s least helpful chatbot", "a tiny union of ducks",
  "a spreadsheet that has started setting boundaries", "one very loud semicolon", "the snack drawer’s terms of service",
  "a status page written entirely in emojis", "a CRITICAL bug in the vibes layer", "a mysterious extra Tuesday",
];

const PROMPTS = [
  "Fixed an issue where ___ was incorrectly displayed as a candlestick chart.",
  "Added experimental support for ___ in dark mode.",
  "Resolved a crash caused by rapidly clicking ___.",
  "Deprecated the legacy ___ API. Please migrate before Tuesday.",
  "Improved accessibility when users are emotionally affected by ___.",
  "Known issue: widgets may become sentient after ___.",
  "We have made ___ 37% more collaborative.",
  "The onboarding flow now asks fewer questions about ___.",
  "Performance improvements for users with more than 4,000 ___.",
  "Fixed a rounding error that turned ___ into a taxable event.",
  "The settings screen now remembers your preference for ___.",
  "Removed a confusing button labelled ___. It was not supposed to be there.",
];

const PRODUCTS = [
  ["PigeonOS", "operating system for city pigeons"], ["Toastify", "social network for bread"],
  ["MoonBnB", "holiday rentals on the Moon"], ["PlantGPT", "houseplants with strong opinions"],
  ["Moustache Maps", "navigation by facial hair"], ["DogDash", "same-day delivery for dogs"],
  ["CaveCloud", "secure storage for prehistoric files"], ["GossipGrid", "enterprise rumours, responsibly managed"],
] as const;

const HAND_SIZE = 10;
const CARD_PACK = [
  ...ANSWERS,
  "a submarine full of accountants", "the emotional support semicolon", "a coupon for one haunted sandwich",
  "the world’s slowest emergency button", "a folder named final_FINAL_really", "a browser tab with unfinished business",
  "a goose with administrator access", "a ceremonial rubber keyboard", "a left-handed loading bar",
  "the year 2007, but in portrait mode", "a group chat called ‘Do Not Reply’", "a password hint that says ‘good luck’",
  "an artisanal error message", "a twelve-step plan for a seven-step wizard", "the fog machine in legal",
  "an office chair that has seen too much", "a calendar made entirely of Fridays", "the deleted scenes from a spreadsheet",
  "one extremely persuasive potato", "a loyalty programme for minor inconveniences", "the last known JPEG",
  "a badly supervised wizard", "a queue with excellent posture", "the second-best idea in the meeting",
  "a vending machine that only accepts compliments", "a haunted dropdown inside another dropdown", "a cloud with a strong opinion about fonts",
  "a meeting that could have been a lighthouse", "the apparently optional emergency exit", "an unlicensed horoscope for databases",
  "a Bluetooth-enabled cardigan", "the office’s secret third printer", "a tiny bell for every typo",
  "a mood board for existential dread", "the CEO’s extremely public draft", "a procedural cheese incident",
  "a speedrun of the entire terms and conditions", "an adorable little compliance issue", "a ghost-written grocery list",
  "a suspiciously damp hyperlink", "the ratio of tabs to actual work", "a premium-grade misunderstanding",
  "an apology letter from the cache", "the tiny hat protocol", "a very large comma",
  "the user’s ceremonial backup browser", "a ceremonial cache clear", "the first pancake of every batch",
  "an unreasonably fancy tooltip", "a fortune cookie full of stack traces", "the no-questions-asked button",
  "a velvet-lined pagination control", "a Wi-Fi network named ‘ask your manager’", "some limited-edition latency",
  "a spellcheck rebellion", "the dishwasher’s annual performance review", "one perfectly normal crab",
  "the rival app’s apology tour", "a mysterious tax on vibes", "the fifth-most important dashboard",
  "a 404 page that calls you by your childhood nickname", "a backwards-compatible drum solo", "a product roadmap written by crows",
  "an optimism overflow", "the strictest possible interpretation of ‘maybe’", "a pop-up wearing a tiny tie",
  "the post-it note at the centre of the universe", "an aggressive amount of onboarding", "a medieval newsletter",
  "the coffee machine’s release candidate", "the world’s most guarded shortcut", "a collaboration-shaped object",
  "the accidental jazz mode", "a table with far too many feelings", "a box of deprecated cables",
  "an iced latte with root access", "the fake moustache fallback", "a tiny parade of unresolved dependencies",
  "an invisible accordion menu", "the most expensive empty state", "a polite but firm goose",
  "a release note that escaped containment", "a second breakfast of API calls", "an electric kettle with a Git history",
  "the fun-sized incident response plan", "a microservice called Susan", "a non-refundable exclamation mark",
  "a legally binding thumbs-up", "the human-readable black hole", "an awkwardly sincere toggle switch",
  "a compatibility layer for feelings", "a dashboard full of cryptic weather", "the low-battery noise from 2013",
  "a memo marked ‘for pigeons only’", "the aesthetically pleasing outage", "an emergency yodel",
  "a high-resolution shrug", "the ceremonial third coffee", "an API endpoint that only works on Tuesdays",
  "the break-glass-in-case-of-fun button", "a rogue accessibility statement", "a four-dimensional sticky note",
  "the snack budget’s final form", "a predictive text coup", "one majestic error boundary",
  "a passive-aggressive progress bar", "the office’s shadow IT karaoke machine", "a polite invasion of swans",
  "a confidence interval for sandwiches", "the communal emergency spoon", "a bug report written in glitter",
  "the unacceptable amount of jazz in this endpoint", "an unusually handsome spreadsheet", "the final boss of calendar invites",
  "a reusable apology component", "the aftertaste of an all-hands", "a highly trained ceremonial llama",
  "the font size of regret", "a beta feature for people who enjoy paperwork", "an experimental third weekend",
  "a commemorative USB stick", "a portable existential crisis", "the snack drawer’s standing ovation",
  "an acoustic firewall", "the opt-in mystery box", "a neat little pile of permissions",
  "a subscription to disappointing weather", "the deluxe edition of ‘have you tried refreshing?’", "an unsafe amount of confetti",
  "the annual migration of the office mugs", "an emoji with management responsibilities", "a very patient small horse",
  "the artisanal blank page", "a single-use keyboard shortcut", "a rogue semicolon with a plan",
  "the GDPR-compliant pirate ship", "a friendly reminder from the void", "a breakdancing tooltip",
  "an error code with a side hustle", "the tabletop version of a loading spinner", "a strategic absence of context",
  "a lightly toasted data model", "the legal department’s karaoke playlist", "a five-star outage experience",
  "an annual license for the word ‘synergy’", "the secret sauce, now with audit logs", "a toggle that controls the moon",
  "an aggressively local cloud", "the search history of a very anxious toaster", "a compatibility issue with Tuesdays",
  "the internationally recognised shrug format", "a ponytail-shaped dependency graph", "a deeply discounted miracle",
  "the office mascot’s performance bonus", "an annual reminder to drink water", "the most formal possible typo",
  "a content warning for pie charts", "the fifth little pig’s API key", "a ceremonial merge conflict",
  "a pack of unionised geese", "a recyclable emergency", "the deadpan mode toggle",
  "an advanced degree in clicking ‘later’", "the literal last straw", "a mystery flavour of pagination",
  "an ergonomically correct panic button", "a bonus level inside the privacy policy", "a cloud-native sandwich",
  "the last remaining fax machine’s revenge", "a finite amount of infinite scroll", "an unusually loud checkbox",
  "a polite request from the spreadsheet dimension", "a thought leader trapped in a modal", "the receipt for a minor miracle",
  "a browser extension that only compliments you", "a tax-deductible thunderstorm", "the low-poly version of Monday",
  "a feature flag named after a cat", "the final remaining office plant", "an automated eyebrow raise",
  "the legal minimum amount of whimsy", "a spreadsheet wearing sunglasses", "a top-secret sandwich roadmap",
  "the lost city of cached assets", "a group discount for bugs", "an overqualified rubber duck",
  "a package manager’s cry for help", "the company’s backup backup plan", "a small but meaningful amount of drama",
  "an unplanned expansion pack", "the last known sensible dropdown", "a confidence-building typo",
  "an inspirational quote from the build server", "a complimentary side quest", "the executive-level rubber band",
  "a debug mode for imaginary friends", "the coupon code for enlightenment", "an opaque container of vibes",
];

type Phase = "lobby" | "submitting" | "closed" | "reveal" | "round-complete" | "finished";

type Player = {
  id: string;
  name: string;
  score: number;
  hand: string[];
};

type Submission = {
  id: string;
  playerId: string;
  answer: string;
};

type RoomState = {
  roomCode: string;
  hostId: string;
  players: Player[];
  round: number;
  totalRounds: number;
  seconds: number;
  allowCustom: boolean;
  phase: Phase;
  prompt: string;
  product: readonly [string, string];
  judgeId: string | null;
  deadline: number | null;
  submissions: Submission[];
  winnerId: string | null;
};

type SocketAttachment = { playerId: string };

function randomIndex(length: number): number {
  const limit = Math.floor(0x1_0000_0000 / length) * length;
  const value = new Uint32Array(1);
  do crypto.getRandomValues(value); while (value[0] >= limit);
  return value[0] % length;
}

function drawHand(): string[] {
  const deck = [...CARD_PACK];
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const other = randomIndex(index + 1);
    [deck[index], deck[other]] = [deck[other], deck[index]];
  }
  return deck.slice(0, HAND_SIZE);
}

function dealHands(players: Player[]): Player[] {
  const deck = [...CARD_PACK];
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const other = randomIndex(index + 1);
    [deck[index], deck[other]] = [deck[other], deck[index]];
  }
  return players.map((player, index) => ({
    ...player,
    hand: deck.slice(index * HAND_SIZE, (index + 1) * HAND_SIZE),
  }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string, maxLength = 120): string | null {
  const value = record[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
}

function isSocketAttachment(value: unknown): value is SocketAttachment {
  return isRecord(value) && typeof value.playerId === "string";
}

function isPhase(value: unknown): value is Phase {
  return value === "lobby" || value === "submitting" || value === "closed" || value === "reveal" || value === "round-complete" || value === "finished";
}

function isRoomState(value: unknown): value is RoomState {
  if (!isRecord(value) || typeof value.roomCode !== "string" || typeof value.hostId !== "string") return false;
  if (!Array.isArray(value.players) || !Array.isArray(value.submissions) || !isPhase(value.phase)) return false;
  return typeof value.round === "number" && typeof value.totalRounds === "number" && typeof value.seconds === "number";
}

function parseState(json: string): RoomState | null {
  try {
    const state: unknown = JSON.parse(json);
    return isRoomState(state) ? state : null;
  } catch {
    return null;
  }
}

function safeSend(ws: WebSocket, value: unknown): void {
  try {
    ws.send(JSON.stringify(value));
  } catch {
    // A socket can disappear between getWebSockets() and send().
  }
}

export class GameRoom extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS room_state (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          value TEXT NOT NULL
        )
      `);
    });
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return Response.json({ error: "WebSocket upgrade required" }, { status: 426 });
    }

    const playerId = new URL(request.url).searchParams.get("playerId");
    if (!playerId || !/^[a-zA-Z0-9-]{16,64}$/.test(playerId)) {
      return Response.json({ error: "Invalid player session" }, { status: 400 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.serializeAttachment({ playerId });
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== "string" || message.length > 4_000) return;
    const attachment = ws.deserializeAttachment();
    if (!isSocketAttachment(attachment)) {
      safeSend(ws, { type: "error", message: "Your session could not be restored." });
      return;
    }

    try {
      const parsed: unknown = JSON.parse(message);
      if (!isRecord(parsed)) return;
      await this.handleMessage(ws, attachment.playerId, parsed);
    } catch (error) {
      console.error(JSON.stringify({ message: "room_message_failed", error: error instanceof Error ? error.message : String(error) }));
      safeSend(ws, { type: "error", message: "That action could not be completed." });
    }
  }

  async alarm(): Promise<void> {
    const state = this.readState();
    if (!state || state.phase !== "submitting" || !state.deadline || Date.now() < state.deadline) return;
    state.phase = "closed";
    this.saveState(state);
    this.broadcast(state);
  }

  private async handleMessage(ws: WebSocket, playerId: string, message: Record<string, unknown>): Promise<void> {
    const type = readString(message, "type", 40);
    if (!type) return;

    if (type === "join") {
      await this.join(ws, playerId, message);
      return;
    }

    const state = this.readState();
    if (!state) {
      safeSend(ws, { type: "error", message: "This room no longer exists." });
      return;
    }

    if (type === "start-round") {
      await this.startRound(ws, playerId, state);
    } else if (type === "submit") {
      this.submit(ws, playerId, state, message);
    } else if (type === "reveal") {
      this.reveal(ws, playerId, state);
    } else if (type === "choose-winner") {
      this.chooseWinner(ws, playerId, state, message);
    }
  }

  private async join(ws: WebSocket, playerId: string, message: Record<string, unknown>): Promise<void> {
    const name = readString(message, "name", 32);
    const wantsHost = message.wantsHost === true;
    if (!name) {
      safeSend(ws, { type: "error", message: "Choose a name with up to 32 characters." });
      return;
    }

    let state = this.readState();
    if (!state) {
      if (!wantsHost) {
        safeSend(ws, { type: "error", message: "Ask the host to create the room first." });
        return;
      }
      const roomCode = readString(message, "roomCode", 12)?.toUpperCase();
      if (!roomCode || !/^[A-Z0-9]{6}$/.test(roomCode)) {
        safeSend(ws, { type: "error", message: "Invalid room code." });
        return;
      }
      const totalRounds = Number(message.totalRounds);
      const seconds = Number(message.seconds);
      state = {
        roomCode,
        hostId: playerId,
        players: [{ id: playerId, name, score: 0, hand: drawHand() }],
        round: 0,
        totalRounds: [6, 8, 12].includes(totalRounds) ? totalRounds : 8,
        seconds: [30, 45, 60].includes(seconds) ? seconds : 45,
        allowCustom: message.allowCustom !== false,
        phase: "lobby",
        prompt: "",
        product: PRODUCTS[0],
        judgeId: null,
        deadline: null,
        submissions: [],
        winnerId: null,
      };
    } else if (!state.players.some((player) => player.id === playerId)) {
      if (state.phase !== "lobby" && state.phase !== "round-complete") {
        safeSend(ws, { type: "error", message: "Wait for the next lobby to join this room." });
        return;
      }
      state.players.push({ id: playerId, name, score: 0, hand: drawHand() });
    }

    this.saveState(state);
    this.broadcast(state);
  }

  private async startRound(ws: WebSocket, playerId: string, state: RoomState): Promise<void> {
    if (playerId !== state.hostId) return this.notAllowed(ws);
    if (state.phase !== "lobby" && state.phase !== "round-complete") return this.invalidPhase(ws);
    if (state.players.length < 3) {
      safeSend(ws, { type: "error", message: "Invite at least three players before starting." });
      return;
    }

    const nextRound = state.round + 1;
    if (nextRound > state.totalRounds) {
      state.phase = "finished";
      state.deadline = null;
      this.saveState(state);
      this.broadcast(state);
      return;
    }
    state.round = nextRound;
    state.phase = "submitting";
    state.prompt = PROMPTS[randomIndex(PROMPTS.length)];
    state.product = PRODUCTS[randomIndex(PRODUCTS.length)];
    state.judgeId = state.players[(state.round - 1) % state.players.length].id;
    state.deadline = Date.now() + state.seconds * 1_000;
    state.submissions = [];
    state.winnerId = null;
    state.players = dealHands(state.players);
    this.saveState(state);
    await this.ctx.storage.setAlarm(state.deadline);
    this.broadcast(state);
  }

  private submit(ws: WebSocket, playerId: string, state: RoomState, message: Record<string, unknown>): void {
    if (state.phase !== "submitting" || !state.deadline || Date.now() >= state.deadline) return this.invalidPhase(ws, "Submissions are closed.");
    if (playerId === state.judgeId) {
      safeSend(ws, { type: "error", message: "You are judging this round, so you do not submit a card." });
      return;
    }
    const player = state.players.find((candidate) => candidate.id === playerId);
    if (!player) return this.notAllowed(ws);
    if (state.submissions.some((submission) => submission.playerId === playerId)) {
      safeSend(ws, { type: "error", message: "You have already submitted this round." });
      return;
    }

    const cardIndex = message.cardIndex;
    const customAnswer = readString(message, "customAnswer", 120);
    let answer: string | null = null;
    if (typeof cardIndex === "number" && Number.isInteger(cardIndex) && cardIndex >= 0 && cardIndex < player.hand.length) {
      answer = player.hand[cardIndex];
    } else if (state.allowCustom && customAnswer) {
      answer = customAnswer;
    }
    if (!answer) {
      safeSend(ws, { type: "error", message: "Choose a card or write a short answer." });
      return;
    }

    state.submissions.push({ id: crypto.randomUUID(), playerId, answer });
    this.saveState(state);
    this.broadcast(state);
  }

  private reveal(ws: WebSocket, playerId: string, state: RoomState): void {
    if (playerId !== state.hostId) return this.notAllowed(ws);
    if (state.phase !== "submitting" && state.phase !== "closed") return this.invalidPhase(ws);
    state.phase = "reveal";
    state.deadline = null;
    this.saveState(state);
    this.broadcast(state);
  }

  private chooseWinner(ws: WebSocket, playerId: string, state: RoomState, message: Record<string, unknown>): void {
    if (playerId !== state.judgeId) return this.notAllowed(ws, "Only this round’s judge can choose a winner.");
    if (state.phase !== "reveal") return this.invalidPhase(ws);
    const submissionId = readString(message, "submissionId", 64);
    const winner = state.submissions.find((submission) => submission.id === submissionId);
    if (!winner) return safeSend(ws, { type: "error", message: "That entry is no longer available." });
    const player = state.players.find((candidate) => candidate.id === winner.playerId);
    if (!player) return safeSend(ws, { type: "error", message: "That player has left the room." });
    player.score += 1;
    state.winnerId = winner.playerId;
    state.phase = "round-complete";
    this.saveState(state);
    this.broadcast(state);
  }

  private readState(): RoomState | null {
    const row = this.ctx.storage.sql.exec<{ value: string }>("SELECT value FROM room_state WHERE id = 1").toArray()[0];
    return row ? parseState(row.value) : null;
  }

  private saveState(state: RoomState): void {
    this.ctx.storage.sql.exec(
      "INSERT INTO room_state (id, value) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value",
      JSON.stringify(state),
    );
  }

  private broadcast(state: RoomState): void {
    for (const socket of this.ctx.getWebSockets()) {
      const attachment = socket.deserializeAttachment();
      if (isSocketAttachment(attachment)) safeSend(socket, { type: "state", state: this.viewFor(state, attachment.playerId) });
    }
  }

  private viewFor(state: RoomState, playerId: string): Record<string, unknown> {
    const player = state.players.find((candidate) => candidate.id === playerId);
    const revealAnswers = state.phase === "reveal" || state.phase === "round-complete" || state.phase === "finished";
    const winner = state.players.find((candidate) => candidate.id === state.winnerId);
    return {
      roomCode: state.roomCode,
      phase: state.phase,
      round: state.round,
      totalRounds: state.totalRounds,
      seconds: state.seconds,
      deadline: state.deadline,
      prompt: state.prompt,
      product: state.product,
      allowCustom: state.allowCustom,
      isHost: playerId === state.hostId,
      isJudge: playerId === state.judgeId,
      judgeName: state.players.find((candidate) => candidate.id === state.judgeId)?.name ?? null,
      winnerName: winner?.name ?? null,
      canStart: playerId === state.hostId && (state.phase === "lobby" || state.phase === "round-complete"),
      hasSubmitted: state.submissions.some((submission) => submission.playerId === playerId),
      hand: player?.hand ?? [],
      players: state.players.map((candidate) => ({
        name: candidate.name,
        score: candidate.score,
        submitted: state.submissions.some((submission) => submission.playerId === candidate.id),
      })),
      submissions: revealAnswers ? state.submissions.map((submission) => ({ id: submission.id, answer: submission.answer })) : [],
    };
  }

  private notAllowed(ws: WebSocket, message = "You are not allowed to do that in this room."): void {
    safeSend(ws, { type: "error", message });
  }

  private invalidPhase(ws: WebSocket, message = "That action is not available right now."): void {
    safeSend(ws, { type: "error", message });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const roomMatch = /^\/api\/rooms\/([A-Z0-9]{6})\/ws$/.exec(url.pathname);
    try {
      if (roomMatch) {
        if (request.method !== "GET") return Response.json({ error: "Method not allowed" }, { status: 405 });
        if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
          return Response.json({ error: "WebSocket upgrade required" }, { status: 426 });
        }
        return env.GAME_ROOM.getByName(roomMatch[1], { locationHint: "weur" }).fetch(request);
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(JSON.stringify({ message: "request_failed", path: url.pathname, error: error instanceof Error ? error.message : String(error) }));
      return Response.json({ error: "The game room is temporarily unavailable." }, { status: 503 });
    }
  },
} satisfies ExportedHandler<Env>;
