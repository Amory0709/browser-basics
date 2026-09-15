# Browser Basics

A classroom platform: a presenter leads participants through embedded HTML course pages on a shared board, with presenter-controlled follow/free modes. Mini-games (quizzes, CSS battles) come later on the same collab framework.

## Language

**Presenter**:
The teacher who leads a room session. Controls when participants follow the viewport and when they interact freely.
_Avoid_: Admin, host, teacher (in code and docs use Presenter)

**Participant**:
A student who joins a room to follow the presenter and interact with embedded content.
_Avoid_: User, member, learner

**Room**:
A named, persistent session with one shared Yjs document. Same room name always restores the same board state. Persisted server-side with y-leveldb.
_Avoid_: Class, channel, document

**Board**:
The shared canvas shell in a room: viewport, presenter controls, and slots where embeds appear.
_Avoid_: Playground, whiteboard

**Collab framework**:
The reusable Yjs layer (`@browser-basics/yjs-room`, `@browser-basics/embed-sdk`, embed host) that handles sync, presenter permissions, session modes, persistence, and the embed bridge. Not tied to any one course or game.
_Avoid_: Client, app, demo

**Embed**:
An arbitrary HTML page loaded inside the board (via iframe) that connects to the room through `@browser-basics/embed-sdk`. Course pages and future mini-games are both embeds.
_Avoid_: Widget, component, iframe (iframe is an implementation detail)

**Embed SDK**:
The framework-agnostic client library embeds import. Wraps a postMessage protocol to shared room state; no Yjs in course HTML. Optional React helpers ship in the same package.
_Avoid_: Bridge, plugin, collab script

**Courses**:
Static HTML (and optional JS/CSS) lesson pages under `courses/`, served same-origin with the client. Content-only — collab via Embed SDK, never direct Yjs.
_Avoid_: Knowledge site, CMS, curriculum

**Session mode**:
Room-wide setting stored as `roomMeta.sessionMode`: `'follow'` or `'free'`. Presenter toggles it; participants do not choose independently.
_Avoid_: Phase, state, lock

**Follow mode**:
`sessionMode === 'follow'`. Participants sync to the presenter's viewport.
_Avoid_: Lecture mode, locked, presentation

**Free mode**:
`sessionMode === 'free'`. Participants may pan, zoom, and interact with embeds independently.
_Avoid_: Activity mode, unlocked, workshop

**Demo board**:
Legacy sticky-note / drawing / chat features kept under `client/demo/` for development. Not the primary product surface.
_Avoid_: Playground, legacy

**Mini-game**:
A future interactive embed (classroom quiz, CSS battle, etc.). Out of scope until framework v1 is stable.
_Avoid_: Exercise, quiz (quiz is one kind of mini-game)
