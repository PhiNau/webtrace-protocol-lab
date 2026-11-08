const scenes = [
  {
    kicker: "21:13 UHR · MEDIENZENTRUM",
    title: "Die Startseite ist verschwunden.",
    text: "Morgen öffnet die digitale Ausstellung des Medienzentrums. Doch statt der Startseite sehen alle Browser nur noch einen Fehler. Der Webserver antwortet – aber offenbar nicht mit der erwarteten Datei.",
    label: "LIVE-MELDUNG",
    transmission: "BROWSER // HTTP 404 · /startseite.html nicht gefunden",
  },
  {
    kicker: "21:16 UHR · NETZWERKLEITSTELLE",
    title: "Der Weg durch das Netz ist Teil des Rätsels.",
    text: "Mehrere Clients, ein zentraler Switch, Web- und Mailserver: Nur wer die Rollen und den Weg einer Anfrage versteht, kann erkennen, welches System tatsächlich gestört ist.",
    label: "NETZPLAN",
    transmission: "CLIENT 07 → SWITCH A → WEB-SRV\nMAIL-SRV meldet: 2 ungelesene Nachrichten",
  },
  {
    kicker: "21:18 UHR · SICHERHEITSKANAL",
    title: "Eine Spur liegt im Postfach.",
    text: "Ein fertiger POP3-Client kann die Nachricht abrufen. Doch bevor du ihn einsetzen darfst, musst du erklären können, welche Befehle er sendet, welche Antworten er erwartet und in welchem Zustand sich die Sitzung befindet.",
    label: "AUFTRAG",
    transmission: "Rekonstruiere den Website-Aufruf. Prüfe HTTPS. Analysiere den POP3-Client. Sichere die Startseite.",
  },
];

const missions = [
  {
    title: "Das Netz hinter der Website",
    kicker: "EINSATZ 01 · TOPOLOGIE & ROLLEN",
    lead: "Untersuche den Netzplan des Medienzentrums und ordne Client, Server und Netzkomponente korrekt zu.",
    summary: "Netztopologie und Client-Server-Struktur als Grundlage jeder Anfrage verstehen.",
    tags: ["Stern", "Client", "Server"],
    hint: "Überlege bei jedem Gerät: Startet es eine Anfrage, stellt es einen Dienst bereit oder verbindet es andere Geräte?",
  },
  {
    title: "Die Reise einer Website-Anfrage",
    kicker: "EINSATZ 02 · WEBSERVERZUGRIFF",
    lead: "Baue den Weg von der URL bis zur dargestellten Website auf und sende anschließend selbst eine korrekte HTTP-Anfrage.",
    summary: "DNS, Verbindung, HTTP-Anfrage, Serverantwort und Browserdarstellung in eine sinnvolle Reihenfolge bringen.",
    tags: ["DNS", "GET", "Response"],
    hint: "Jeder Schritt benötigt Informationen aus dem vorherigen. Beim Request-Builder gilt: Alles hinter dem Hostnamen – beginnend mit / – ist der Ressourcenpfad.",
  },
  {
    title: "Offener Kanal oder sichere Verbindung?",
    kicker: "EINSATZ 03 · HTTP & HTTPS",
    lead: "Vergleiche HTTP und HTTPS, prüfe ein Zertifikat und deute die Antwort eines Webservers.",
    summary: "Verstehen, was TLS schützt, wie ein Zertifikat die Serveridentität absichert und was Statuscodes aussagen.",
    tags: ["TLS", "Zertifikat", "Statuscode"],
    hint: "Ein Zertifikat muss nicht nur gültig und vertrauenswürdig sein. Es muss auch genau zu dem Namen passen, den der Browser aufgerufen hat.",
  },
  {
    title: "Den POP3-Client durchleuchten",
    kicker: "EINSATZ 04 · PROGRAMMANALYSE",
    lead: "Analysiere einen fertigen POP3-Client Zeile für Zeile und führe danach selbst eine vollständige Mail-Sitzung.",
    summary: "Programmcode, POP3-Befehle, Serverantworten und Protokollzustände miteinander verknüpfen.",
    tags: ["USER / PASS", "STAT / LIST", "RETR"],
    hint: "Die Methodennamen des Clients ähneln den POP3-Befehlen. Achte außerdem darauf, wann Anmeldung, Postfachzugriff und Sitzungsende stattfinden.",
  },
  {
    title: "Fall 404 rekonstruieren",
    kicker: "FINALE · BEWEISKETTE",
    lead: "Verbinde Netzplan, HTTP-Antwort, Zertifikat und Mailspur zu einer belastbaren technischen Erklärung.",
    summary: "Alle Beweise auswerten und die Ursache der verschwundenen Startseite fachsprachlich erklären.",
    tags: ["Transfer", "Diagnose", "Erklärung"],
    hint: "Trenne erreichbare Systeme von fehlerhaften Inhalten: Eine Fehlermeldung des Servers beweist bereits, dass mehrere Teile der Kommunikation funktionieren.",
  },
];

const elements = {
  briefing: document.querySelector("#briefing-view"),
  hub: document.querySelector("#hub-view"),
  mission: document.querySelector("#mission-view"),
  completion: document.querySelector("#completion-view"),
  nav: document.querySelector("#mission-nav"),
  progressLabel: document.querySelector("#progress-label"),
  progressBar: document.querySelector("#progress-bar"),
  score: document.querySelector("#case-score"),
  missionGrid: document.querySelector("#mission-grid"),
  missionNumber: document.querySelector("#mission-number"),
  missionKicker: document.querySelector("#mission-kicker"),
  missionTitle: document.querySelector("#mission-title"),
  missionLead: document.querySelector("#mission-lead"),
  missionContent: document.querySelector("#mission-content"),
  evidenceSummary: document.querySelector("#evidence-summary"),
  hintDialog: document.querySelector("#hint-dialog"),
  hintTitle: document.querySelector("#hint-title"),
  hintText: document.querySelector("#hint-text"),
};

const defaultState = {
  completed: Array(missions.length).fill(false),
  briefingSeen: false,
};

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem("webtrace-state"));
    return {
      ...defaultState,
      ...stored,
      completed: Array.from({ length: missions.length }, (_, index) => Boolean(stored?.completed?.[index])),
    };
  } catch {
    return { ...defaultState, completed: [...defaultState.completed] };
  }
}

let state = loadState();
let sceneIndex = 0;
let activeMission = null;
let runtime = {};

function saveState() {
  localStorage.setItem("webtrace-state", JSON.stringify(state));
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showView(name) {
  [elements.briefing, elements.hub, elements.mission, elements.completion].forEach((view) => view.classList.add("hidden"));
  elements[name].classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function completedCount() {
  return state.completed.filter(Boolean).length;
}

function canOpen(index) {
  return index === 0 || state.completed[index - 1] || state.completed[index];
}

function updateProgress() {
  const count = completedCount();
  elements.progressLabel.textContent = `${count} / ${missions.length}`;
  elements.progressBar.style.width = `${(count / missions.length) * 100}%`;
  elements.score.textContent = count;
}

function renderNav() {
  elements.nav.innerHTML = `
    <p class="nav-group-label">01 · NETZ &amp; WEB</p>
    ${missions.slice(0, 3).map((mission, index) => navButton(mission, index)).join("")}
    <p class="nav-group-label">02 · MAILFORENSIK</p>
    ${navButton(missions[3], 3)}
    <p class="nav-group-label">03 · ABSCHLUSS</p>
    ${navButton(missions[4], 4)}
  `;
  elements.nav.querySelectorAll("[data-nav-index]").forEach((button) => {
    button.addEventListener("click", () => openMission(Number(button.dataset.navIndex)));
  });
}

function navButton(mission, index) {
  const complete = state.completed[index];
  const enabled = canOpen(index);
  const active = activeMission === index;
  return `
    <button class="mission-nav-button ${complete ? "complete" : ""} ${active ? "active" : ""}"
      data-nav-index="${index}" type="button" ${enabled ? "" : "disabled"}>
      <span>${complete ? "✓" : String(index + 1).padStart(2, "0")}</span>
      <strong>${mission.title}</strong>
      <i>${complete ? "✓" : ""}</i>
    </button>`;
}

function renderHub() {
  updateProgress();
  activeMission = null;
  renderNav();
  elements.missionGrid.innerHTML = missions.map((mission, index) => {
    const complete = state.completed[index];
    const enabled = canOpen(index);
    return `
      <button class="mission-card ${complete ? "complete" : ""} ${index === missions.length - 1 ? "final-card" : ""}"
        type="button" data-mission-card="${index}" ${enabled ? "" : "disabled"}>
        <span class="mission-card-top">
          <span class="mission-index">${complete ? "✓" : String(index + 1).padStart(2, "0")}</span>
          <span class="mission-status">${complete ? "Beweis gesichert" : enabled ? "Einsatzbereit" : "Noch gesperrt"}</span>
        </span>
        <h2>${mission.title}</h2>
        <p>${mission.summary}</p>
        <span class="mission-card-tags">${mission.tags.map((tag) => `<span>${tag}</span>`).join("")}</span>
      </button>`;
  }).join("");
  elements.missionGrid.querySelectorAll("[data-mission-card]").forEach((button) => {
    button.addEventListener("click", () => openMission(Number(button.dataset.missionCard)));
  });
  showView("hub");
}

function renderScene() {
  const scene = scenes[sceneIndex];
  document.querySelector("#scene-kicker").textContent = scene.kicker;
  document.querySelector("#scene-title").textContent = scene.title;
  document.querySelector("#scene-text").textContent = scene.text;
  document.querySelector("#scene-transmission").innerHTML = `<small>${scene.label}</small><code>${escapeHtml(scene.transmission)}</code>`;
  document.querySelector("#scene-dots").innerHTML = scenes.map((_, index) => `<span class="${index === sceneIndex ? "active" : ""}"></span>`).join("");
  document.querySelector("#scene-back").disabled = sceneIndex === 0;
  document.querySelector("#scene-next").textContent = sceneIndex === scenes.length - 1 ? "Einsatzkarte öffnen" : "Weiter";
}

function showBriefing() {
  activeMission = null;
  sceneIndex = 0;
  renderNav();
  renderScene();
  showView("briefing");
}

function openMission(index) {
  if (!canOpen(index)) return;
  activeMission = index;
  runtime = {};
  const mission = missions[index];
  elements.missionNumber.textContent = String(index + 1).padStart(2, "0");
  elements.missionKicker.textContent = mission.kicker;
  elements.missionTitle.textContent = mission.title;
  elements.missionLead.textContent = mission.lead;
  renderNav();
  renderMission(index);
  showView("mission");
}

function learningBlock(title, subtitle, icon, body) {
  return `
    <article class="learning-block">
      <header class="block-heading"><span class="block-icon" aria-hidden="true">${icon}</span><div><h2>${title}</h2><p>${subtitle}</p></div></header>
      <div class="block-body">${body}</div>
    </article>`;
}

function challengeShell(title, subtitle, body, feedbackId = "challenge-feedback") {
  return `
    <section class="challenge-block">
      <header class="block-heading"><span class="block-icon" aria-hidden="true">⌁</span><div><h2>${title}</h2><p>${subtitle}</p></div></header>
      <div class="block-body">
        ${body}
        <div class="feedback" id="${feedbackId}" aria-live="polite">Bearbeite die Aufgabe und sichere anschließend das Beweisstück.</div>
        <div class="challenge-actions">
          <button class="text-button" type="button" data-hint>Hinweis anfordern</button>
          <div id="challenge-primary-action"></div>
        </div>
      </div>
    </section>`;
}

function renderMission(index) {
  if (index === 0) renderTopologyMission();
  if (index === 1) renderWebRequestMission();
  if (index === 2) renderHttpsMission();
  if (index === 3) renderPop3Mission();
  if (index === 4) renderFinalMission();
  elements.missionContent.querySelectorAll("[data-hint]").forEach((button) => button.addEventListener("click", showHint));
}

function showHint() {
  const mission = missions[activeMission];
  elements.hintTitle.textContent = `Hinweis zu Einsatz ${String(activeMission + 1).padStart(2, "0")}`;
  elements.hintText.textContent = mission.hint;
  elements.hintDialog.showModal();
}

function feedback(message, type = "", target = "challenge-feedback") {
  const box = document.querySelector(`#${target}`);
  if (!box) return;
  box.className = `feedback ${type}`.trim();
  box.textContent = message;
}

function completeMission(index, message) {
  state.completed[index] = true;
  saveState();
  updateProgress();
  renderNav();
  feedback(message, "success");
  const action = document.querySelector("#challenge-primary-action");
  if (action) {
    action.innerHTML = index === missions.length - 1
      ? `<button class="button primary" type="button" data-finish-case>Fall abschließen</button>`
      : `<button class="button primary" type="button" data-next-mission>Weiter zu Einsatz ${String(index + 2).padStart(2, "0")}</button>`;
    action.querySelector("[data-next-mission]")?.addEventListener("click", () => openMission(index + 1));
    action.querySelector("[data-finish-case]")?.addEventListener("click", showCompletion);
  }
}

function renderTopologyMission() {
  const knowledge = learningBlock(
    "Orientierung: Wer spricht mit wem?",
    "Netztopologie beschreibt die Anordnung; Client-Server beschreibt die Rollen.",
    "◉",
    `<p class="challenge-copy">Im Medienzentrum sind alle Endgeräte sternförmig an einen zentralen Switch angebunden. Fällt eine einzelne Leitung aus, betrifft das meist nur ein Gerät. Fällt der zentrale Switch aus, verlieren dagegen viele Geräte ihre Verbindung.</p>
     <div class="network-diagram" aria-label="Sternförmiger Netzplan mit Switch im Mittelpunkt">
       <svg class="star-links" viewBox="0 0 1000 360" preserveAspectRatio="none" aria-hidden="true">
         <line x1="500" y1="180" x2="170" y2="90"></line>
         <line x1="500" y1="180" x2="170" y2="270"></line>
         <line x1="500" y1="180" x2="830" y2="90"></line>
         <line x1="500" y1="180" x2="830" y2="270"></line>
         <circle cx="500" cy="180" r="12"></circle>
       </svg>
       <div class="network-node client-a"><span class="node-symbol">▱</span><strong>Redaktions-PC</strong><small>fragt Webseiten an</small></div>
       <div class="network-node client-b"><span class="node-symbol">▱</span><strong>Tablet</strong><small>fragt Webseiten an</small></div>
       <div class="network-node switch"><span class="node-symbol">⌘</span><strong>Switch A</strong><small>verbindet Geräte</small></div>
       <div class="network-node server web-server"><span class="node-symbol">▥</span><strong>Webserver</strong><small>liefert Webseiten aus</small></div>
       <div class="network-node server mail-server"><span class="node-symbol">✉</span><strong>Mailserver</strong><small>stellt das Postfach bereit</small></div>
     </div>
     <div class="explain-grid">
       <div class="explain-card"><span class="mini-label">TOPOLOGIE</span><h3>Physische oder logische Struktur</h3><p>Eine Sternstruktur verbindet alle Teilnehmer über einen zentralen Netzkoppler. Sie sagt zunächst noch nichts darüber, welches Programm eine Anfrage startet.</p></div>
       <div class="explain-card"><span class="mini-label">CLIENT</span><h3>Nutzt einen Dienst</h3><p>Der Browser ist ein Webclient. Er startet die Kommunikation und fordert beispielsweise eine HTML-Datei vom Webserver an.</p></div>
       <div class="explain-card"><span class="mini-label">SERVER</span><h3>Stellt einen Dienst bereit</h3><p>Ein Server wartet auf Anfragen. Derselbe Rechner kann mehrere Serverprogramme betreiben – etwa einen Web- und einen Maildienst.</p></div>
       <div class="explain-card"><span class="mini-label">WICHTIG</span><h3>Rolle statt Gerätetyp</h3><p>„Client“ und „Server“ bezeichnen Rollen in einer Kommunikation. Ein Gerät kann je nach Situation beide Rollen übernehmen.</p></div>
     </div>
     <div class="takeaway"><strong>Merksatz</strong><span>Die Topologie erklärt die Verbindungen. Die Client-Server-Struktur erklärt, wer einen Dienst anfragt und wer ihn anbietet.</span></div>`
  );

  const roleLabels = shuffle([
    { id: "client", label: "Client" },
    { id: "server", label: "Server" },
    { id: "switch", label: "Netzkoppler" },
  ]);
  runtime.roles = {};
  runtime.selectedRole = null;
  const challenge = challengeShell(
    "Beweis 01: Rollen im Netzplan markieren",
    "Ziehe die Begriffe auf die Geräte oder wähle erst einen Begriff und dann ein Gerät.",
    `<p class="challenge-copy">Ordne jedem markierten Element seine Rolle zu. Nutze die Rolle in genau diesem Anwendungskontext.</p>
     <div class="role-toolbar">${roleLabels.map((role) => `<button class="draggable-chip" draggable="true" type="button" data-role="${role.id}">${role.label}</button>`).join("")}</div>
     <div class="explain-grid">
       <div class="explain-card"><span class="mini-label">GERÄT A</span><h3>Redaktions-PC mit Browser</h3><button class="drop-zone" type="button" data-zone="workstation">Rolle hier ablegen</button></div>
       <div class="explain-card"><span class="mini-label">GERÄT B</span><h3>Webserver</h3><button class="drop-zone" type="button" data-zone="webserver">Rolle hier ablegen</button></div>
       <div class="explain-card"><span class="mini-label">GERÄT C</span><h3>Switch A</h3><button class="drop-zone" type="button" data-zone="central-switch">Rolle hier ablegen</button></div>
     </div>`
  );
  elements.missionContent.innerHTML = knowledge + challenge;
  document.querySelector("#challenge-primary-action").innerHTML = `<button class="button primary" id="check-roles" type="button">Zuordnung prüfen</button>`;

  const roles = elements.missionContent.querySelectorAll("[data-role]");
  const zones = elements.missionContent.querySelectorAll("[data-zone]");
  roles.forEach((button) => {
    button.addEventListener("click", () => {
      runtime.selectedRole = button.dataset.role;
      roles.forEach((item) => item.classList.toggle("selected", item === button));
    });
    button.addEventListener("dragstart", (event) => event.dataTransfer.setData("text/plain", button.dataset.role));
  });
  zones.forEach((zone) => {
    zone.addEventListener("dragover", (event) => event.preventDefault());
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      assignRole(zone, event.dataTransfer.getData("text/plain"));
    });
    zone.addEventListener("click", () => {
      if (runtime.selectedRole) assignRole(zone, runtime.selectedRole);
      else feedback("Wähle zuerst oben einen Rollenbegriff aus.", "error");
    });
  });
  document.querySelector("#check-roles").addEventListener("click", checkRoles);
}

function assignRole(zone, role) {
  const labels = { client: "Client", server: "Server", switch: "Netzkoppler" };
  runtime.roles[zone.dataset.zone] = role;
  zone.textContent = labels[role];
  zone.classList.add("filled");
  runtime.selectedRole = null;
  document.querySelectorAll("[data-role]").forEach((button) => button.classList.remove("selected"));
}

function checkRoles() {
  const correct = runtime.roles.workstation === "client" && runtime.roles.webserver === "server" && runtime.roles["central-switch"] === "switch";
  if (correct) completeMission(0, "Beweis gesichert: Du hast Topologie und Kommunikationsrollen korrekt voneinander getrennt.");
  else feedback("Noch nicht ganz. Prüfe: Wer startet die Webseitenanfrage, wer wartet auf sie und wer verbindet die Geräte?", "error");
}

const webSteps = [
  { id: "url", title: "URL auswerten", text: "Browser erkennt Protokoll, Host und Pfad." },
  { id: "dns", title: "Namen auflösen", text: "DNS liefert die IP-Adresse des Servers." },
  { id: "tcp", title: "Verbindung aufbauen", text: "Client und Server stellen einen Transportkanal her." },
  { id: "tls", title: "TLS absichern", text: "Bei HTTPS werden Identität und Verschlüsselung ausgehandelt." },
  { id: "http", title: "HTTP-Anfrage senden", text: "Der Browser fordert mit GET eine Ressource an." },
  { id: "server", title: "Server antwortet", text: "Status, Header und Inhalt kommen zurück." },
  { id: "browser", title: "Seite darstellen", text: "Der Browser verarbeitet HTML, CSS und weitere Ressourcen." },
];

function renderWebRequestMission() {
  const knowledge = learningBlock(
    "Vom Klick zur fertigen Seite",
    "Eine Website-Abfrage ist eine Kette aus mehreren Client-Server-Interaktionen.",
    "↗",
    `<p class="challenge-copy">Gibst du <code>https://museum.local/ausstellung/index.html</code> ein, muss der Browser mehr tun als „eine Seite laden“. Er bestimmt das Ziel, baut eine Verbindung auf, sendet eine strukturierte Anfrage und verarbeitet die Antwort.</p>
     <div class="web-flow">
       ${webSteps.map((step, index) => `<div class="flow-step"><b>${index + 1}</b><strong>${step.title}</strong><small>${step.text}</small></div>${index < webSteps.length - 1 ? `<span class="flow-arrow">→</span>` : ""}`).join("")}
     </div>
     <div class="explain-grid">
       <div class="explain-card"><span class="mini-label">URL</span><h3>Adresse mit mehreren Teilen</h3><p><strong>https</strong> nennt das Schema, <strong>museum.local</strong> den Host und <strong>/ausstellung/index.html</strong> die gewünschte Ressource.</p></div>
       <div class="explain-card"><span class="mini-label">DNS</span><h3>Name wird zur IP-Adresse</h3><p>Menschen merken sich Namen. Für die Weiterleitung durch Netze benötigt der Client die IP-Adresse des Zielrechners.</p></div>
       <div class="explain-card"><span class="mini-label">HTTP</span><h3>Anfrage und Antwort</h3><p>Der Client sendet Methode, Pfad, Version und Header. Der Server antwortet mit Statuscode, Headern und – wenn vorhanden – dem Inhalt.</p></div>
       <div class="explain-card"><span class="mini-label">BROWSER</span><h3>Ein Dokument löst weitere Anfragen aus</h3><p>HTML kann CSS, Bilder oder Skripte referenzieren. Für diese Ressourcen sendet der Browser zusätzliche Anfragen.</p></div>
     </div>
     <div class="layer-strip" aria-label="Kurzer TCP-IP-Überblick">
       <div><span>4 · ANWENDUNG</span><strong>HTTP / HTTPS</strong><small>Bedeutung der Anfrage</small></div>
       <div><span>3 · TRANSPORT</span><strong>TCP</strong><small>Zuverlässige Verbindung</small></div>
       <div><span>2 · INTERNET</span><strong>IP</strong><small>Weg zum Zielrechner</small></div>
       <div><span>1 · NETZZUGANG</span><strong>WLAN / Ethernet</strong><small>Lokale Übertragung</small></div>
     </div>
     <div class="micro-bridge"><p>Das Schichtenmodell bleibt hier bewusst kurz. Kapselung und Paketübermittlung kannst du im M.A.R.A.-Grundkurs vertiefen.</p><a href="https://phinau.github.io/mara-protocol-recovery/" target="_blank" rel="noreferrer">Zu M.A.R.A. ↗</a></div>
     <div class="takeaway"><strong>Merksatz</strong><span>Eine Website ist das Ergebnis einer strukturierten Anfrage des Clients und einer passenden Antwort des Servers – übertragen über mehrere darunterliegende Netzwerkdienste.</span></div>`
  );
  runtime.sequence = [];
  runtime.requestStage = false;
  const challenge = challengeShell(
    "Beweis 02: Website-Aufruf rekonstruieren",
    "Ordne zuerst die Stationen. Formuliere danach die konkrete HTTP-Anfrage.",
    `<div id="web-challenge-interactive"></div>`
  );
  elements.missionContent.innerHTML = knowledge + challenge;
  renderSequenceBoard();
}

function renderSequenceBoard() {
  const remaining = webSteps.filter((step) => !runtime.sequence.includes(step.id));
  const shuffled = runtime.sequence.length === 0 && !runtime.sequenceOrder
    ? (runtime.sequenceOrder = shuffle(remaining.map((step) => step.id)))
    : runtime.sequenceOrder.filter((id) => remaining.some((step) => step.id === id));
  const bankItems = shuffled.map((id) => webSteps.find((step) => step.id === id));
  document.querySelector("#web-challenge-interactive").innerHTML = `
    <p class="challenge-copy">Wähle die Karten in der Reihenfolge aus, in der ein neuer HTTPS-Aufruf typischerweise abläuft. Eine belegte Position kannst du anklicken, um die Karte zurückzulegen.</p>
    <div class="sequence-board">
      <div class="sequence-bank"><h3>Noch einzuordnen</h3>${bankItems.map((step) => `<button class="sequence-item" type="button" data-add-step="${step.id}"><b>+</b><span><strong>${step.title}</strong><small>${step.text}</small></span></button>`).join("") || `<p class="challenge-copy">Alle Karten sind eingesetzt.</p>`}</div>
      <div class="sequence-slots"><h3>Deine Reihenfolge</h3>${webSteps.map((_, index) => {
        const id = runtime.sequence[index];
        const step = webSteps.find((item) => item.id === id);
        return `<div class="sequence-slot ${step ? "filled" : ""}" data-remove-step="${index}"><b>${index + 1}</b>${step ? `<span><strong>${step.title}</strong><small>${step.text}</small></span>` : `<span>Position ${index + 1}</span>`}</div>`;
      }).join("")}</div>
    </div>`;
  document.querySelector("#challenge-primary-action").innerHTML = `<button class="button primary" id="check-sequence" type="button">Reihenfolge prüfen</button>`;
  document.querySelectorAll("[data-add-step]").forEach((button) => button.addEventListener("click", () => {
    runtime.sequence.push(button.dataset.addStep);
    renderSequenceBoard();
  }));
  document.querySelectorAll(".sequence-slot.filled").forEach((slot) => slot.addEventListener("click", () => {
    const removed = runtime.sequence.splice(Number(slot.dataset.removeStep), 1)[0];
    if (!runtime.sequenceOrder.includes(removed)) runtime.sequenceOrder.push(removed);
    renderSequenceBoard();
  }));
  document.querySelector("#check-sequence").addEventListener("click", checkSequence);
}

function checkSequence() {
  const correct = webSteps.every((step, index) => runtime.sequence[index] === step.id);
  if (!correct) {
    feedback("Die Kette enthält noch einen Bruch. Prüfe besonders, was bekannt sein muss, bevor Verbindung, Verschlüsselung und HTTP-Anfrage möglich sind.", "error");
    return;
  }
  feedback("Reihenfolge korrekt. Jetzt fehlt noch die konkrete Anfrage des Browsers.", "success");
  renderRequestBuilder();
}

function renderRequestBuilder() {
  runtime.requestStage = true;
  document.querySelector("#web-challenge-interactive").innerHTML = `
    <p class="challenge-copy">Der Browser soll genau die unten angegebene Zieladresse abrufen. Lies Methode, Host und Ressourcenpfad aus dem Auftrag ab und übertrage sie in die HTTP/1.1-Anfrage.</p>
    <div class="request-source" aria-label="Auftragskarte mit vollständiger Zieladresse">
      <span class="mini-label">AUFTRAGSKARTE · VOLLSTÄNDIGE ZIELADRESSE</span>
      <code><span>https://</span><strong>museum.local</strong><mark>/ausstellung/index.html</mark></code>
      <div class="url-legend"><span><i class="scheme-key"></i>Schema</span><span><i class="host-key"></i>Host</span><span><i class="path-key"></i>Ressourcenpfad</span></div>
      <p>Für das Pfadfeld übernimmst du den farbig markierten Teil ab dem ersten <strong>/</strong> hinter dem Hostnamen.</p>
    </div>
    <div class="request-builder">
      <div class="request-line">
        <select id="request-method" aria-label="HTTP-Methode"><option>POST</option><option>GET</option><option>DELETE</option></select>
        <input id="request-path" aria-label="Ressourcenpfad" value="/" placeholder="Pfad aus der Zieladresse" />
        <strong>HTTP/1.1</strong>
      </div>
      <div class="request-line" style="margin-top:12px"><strong>Host:</strong><input id="request-host" aria-label="Host-Header" placeholder="Hostname" /></div>
    </div>`;
  document.querySelector("#challenge-primary-action").innerHTML = `<button class="button primary" id="send-request" type="button">Anfrage senden</button>`;
  document.querySelector("#send-request").addEventListener("click", () => {
    const method = document.querySelector("#request-method").value;
    const path = document.querySelector("#request-path").value.trim();
    const host = document.querySelector("#request-host").value.trim().toLowerCase();
    if (method === "GET" && path === "/ausstellung/index.html" && host === "museum.local") {
      completeMission(1, "HTTP/1.1 200 OK – Beweis gesichert: Der Client hat eine vollständige Anfrage formuliert und der Server liefert die Startdatei.");
    } else {
      feedback("Der Server kann diese Anfrage noch nicht eindeutig zuordnen. Vergleiche Methode, Host und den Teil ab dem ersten / mit der Auftragskarte.", "error");
    }
  });
}

function renderHttpsMission() {
  const knowledge = learningBlock(
    "HTTP-Inhalt schützen, Serveridentität prüfen",
    "HTTPS ist HTTP über eine durch TLS geschützte Verbindung.",
    "◇",
    `<p class="challenge-copy">HTTP legt fest, wie Webclient und Webserver Anfragen und Antworten formulieren. HTTPS ersetzt dieses Protokoll nicht: Es schützt die HTTP-Kommunikation während der Übertragung durch TLS.</p>
     <div class="protocol-compare">
       <div class="protocol-panel"><div class="protocol-title"><strong>HTTP</strong><span>OHNE TLS-SCHUTZ</span></div><div class="wire-data">GET /profil HTTP/1.1\nHost: portal.schule.test\nCookie: session=7F3A</div><p class="challenge-copy">Wer die Übertragung mitlesen kann, könnte Inhalte erkennen oder verändern.</p></div>
       <div class="protocol-panel secure"><div class="protocol-title"><strong>HTTPS</strong><span>TLS-GESCHÜTZT</span></div><div class="wire-data encrypted">17 03 03 A8 9F 4C …\n8B 21 E0 7D 52 1A …</div><p class="challenge-copy">Die HTTP-Nutzdaten werden verschlüsselt und gegen unbemerkte Veränderung geschützt.</p></div>
     </div>
     <div class="explain-grid">
       <div class="explain-card"><span class="mini-label">VERTRAULICHKEIT</span><h3>Inhalt bleibt geschützt</h3><p>TLS verschlüsselt die übertragenen HTTP-Daten. Außenstehende sollen weder Passwörter noch Seiteninhalte einfach mitlesen können.</p></div>
       <div class="explain-card"><span class="mini-label">INTEGRITÄT</span><h3>Veränderungen fallen auf</h3><p>Die Verbindung schützt davor, dass Daten unterwegs unbemerkt manipuliert werden.</p></div>
       <div class="explain-card"><span class="mini-label">AUTHENTIZITÄT</span><h3>Zertifikat belegt Identität</h3><p>Der Browser prüft unter anderem Vertrauenskette, Gültigkeitszeitraum und ob der aufgerufene Hostname zum Zertifikat passt.</p></div>
       <div class="explain-card"><span class="mini-label">GRENZE</span><h3>HTTPS schützt den Transport</h3><p>Ein korrektes Schloss-Symbol beweist nicht, dass jeder Inhalt einer Website wahr oder ungefährlich ist. Es sichert zunächst die Verbindung zum geprüften Server.</p></div>
     </div>
     <div class="takeaway"><strong>Merksatz</strong><span>HTTPS schützt HTTP auf dem Übertragungsweg. Das Zertifikat muss vertrauenswürdig, zeitlich gültig und passend zum aufgerufenen Servernamen sein.</span></div>`
  );
  runtime.certSelection = new Set();
  runtime.httpsStage = "certificate";
  const challenge = challengeShell(
    "Beweis 03: Zertifikatswarnung untersuchen",
    "Markiere den entscheidenden Fehler. Deute anschließend die HTTP-Antwort.",
    `<div id="https-challenge-interactive"></div>`
  );
  elements.missionContent.innerHTML = knowledge + challenge;
  renderCertificateChallenge();
}

function renderCertificateChallenge() {
  document.querySelector("#https-challenge-interactive").innerHTML = `
    <p class="challenge-copy">Aufgerufen wurde <code>https://portal.schule.test</code>. Welche Zertifikatsangabe verhindert eine sichere Identitätsprüfung?</p>
    <div class="certificate">
      <button class="cert-field" type="button" data-cert="issuer"><small>AUSSTELLER</small><strong>Lernnetz Root CA · vertrauenswürdig</strong></button>
      <button class="cert-field" type="button" data-cert="hostname"><small>AUSGESTELLT FÜR</small><strong>media.schule.test</strong></button>
      <button class="cert-field" type="button" data-cert="validity"><small>GÜLTIGKEIT</small><strong>01.08.2026 – 01.08.2027</strong></button>
      <button class="cert-field" type="button" data-cert="algorithm"><small>VERBINDUNG</small><strong>TLS 1.3 · AES-GCM</strong></button>
    </div>`;
  document.querySelector("#challenge-primary-action").innerHTML = `<button class="button primary" id="check-certificate" type="button">Zertifikat bewerten</button>`;
  document.querySelectorAll("[data-cert]").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.cert;
    runtime.certSelection.has(key) ? runtime.certSelection.delete(key) : runtime.certSelection.add(key);
    button.classList.toggle("selected", runtime.certSelection.has(key));
  }));
  document.querySelector("#check-certificate").addEventListener("click", () => {
    if (runtime.certSelection.size === 1 && runtime.certSelection.has("hostname")) {
      feedback("Richtig: Der aufgerufene Hostname und der Name im Zertifikat stimmen nicht überein. Der Browser kann die Serveridentität so nicht bestätigen.", "success");
      renderStatusChallenge();
    } else {
      feedback("Noch nicht. Vergleiche die konkrete Adresse aus der Browserzeile mit dem Namen, für den das Zertifikat ausgestellt wurde.", "error");
    }
  });
}

function renderStatusChallenge() {
  runtime.httpsStage = "status";
  const options = shuffle([
    { id: "missing", text: "Der Server wurde erreicht, findet aber die angeforderte Ressource nicht." },
    { id: "offline", text: "Der Client hat keinerlei Verbindung zum Server." },
    { id: "redirect", text: "Der Server leitet die Anfrage dauerhaft an eine andere Adresse um." },
    { id: "success", text: "Die Ressource wurde vollständig und erfolgreich übertragen." },
  ]);
  document.querySelector("#https-challenge-interactive").innerHTML = `
    <p class="challenge-copy">Nach Korrektur des Zertifikats antwortet der Webserver:</p>
    <div class="wire-data">HTTP/1.1 404 Not Found\nContent-Type: text/html\nContent-Length: 842</div>
    <div class="answer-grid">${options.map((option) => `<button class="option-button" type="button" data-status-answer="${option.id}">${option.text}</button>`).join("")}</div>`;
  document.querySelector("#challenge-primary-action").innerHTML = `<button class="button primary" id="check-status" type="button">Antwort deuten</button>`;
  runtime.statusAnswer = null;
  document.querySelectorAll("[data-status-answer]").forEach((button) => button.addEventListener("click", () => {
    runtime.statusAnswer = button.dataset.statusAnswer;
    document.querySelectorAll("[data-status-answer]").forEach((item) => item.classList.toggle("selected", item === button));
  }));
  document.querySelector("#check-status").addEventListener("click", () => {
    if (runtime.statusAnswer === "missing") completeMission(2, "Beweis gesichert: HTTPS schützt den Transport; der Status 404 belegt zugleich, dass der Webserver erreichbar war, die Ressource aber nicht gefunden hat.");
    else feedback("Lies den Statuscode als Aussage des bereits erreichten Servers. Was kann er über genau diese Ressource mitteilen?", "error");
  });
}

const pop3Code = [
  "from poplib import POP3_SSL",
  "",
  "client = POP3_SSL('mail.medienzentrum.local', 995)",
  "client.user('team7')",
  "client.pass_('spuren')",
  "anzahl, groesse = client.stat()",
  "antwort, liste, octets = client.list()",
  "antwort, zeilen, octets = client.retr(2)",
  "mailtext = b'\\n'.join(zeilen).decode('utf-8')",
  "client.quit()",
];

const codeQuestions = [
  { prompt: "Welche Zeile baut die TLS-geschützte Verbindung zum POP3-Server auf?", answer: 3, explain: "POP3_SSL verbindet sich hier mit Port 995 und schützt die Verbindung von Beginn an." },
  { prompt: "Welche Zeile fragt Anzahl und Gesamtgröße der Nachrichten ab?", answer: 6, explain: "stat() entspricht dem POP3-Befehl STAT und liefert eine kurze Postfachstatistik." },
  { prompt: "Welche Zeile ruft den vollständigen Inhalt von Nachricht 2 ab?", answer: 8, explain: "retr(2) fordert Nachricht 2 an; der Server liefert daraufhin Kopfzeilen und Inhalt." },
];

function renderPop3Mission() {
  const knowledge = learningBlock(
    "POP3: Ein Client holt Nachrichten ab",
    "Das Post Office Protocol Version 3 ist ein textbasiertes Anfrage-Antwort-Protokoll.",
    "✉",
    `<p class="challenge-copy">Ein POP3-Client verbindet sich mit einem Mailserver, meldet sich an und ruft Nachrichten aus einem Postfach ab. Der Server beginnt Antworten typischerweise mit <code>+OK</code> oder <code>-ERR</code>. Mehrzeilige Antworten enden mit einer einzelnen Zeile, die nur einen Punkt enthält.</p>
     <div class="state-machine">
       <div class="state-card"><strong>1 · Autorisierung</strong><p><code>USER</code> und <code>PASS</code> weisen den Benutzer nach. Erst danach darf der Client das Postfach untersuchen.</p></div>
       <div class="state-card"><strong>2 · Transaktion</strong><p><code>STAT</code>, <code>LIST</code> und <code>RETR</code> fragen Zustand, Übersicht und Nachrichteninhalte ab.</p></div>
       <div class="state-card"><strong>3 · Aktualisierung</strong><p>Mit <code>QUIT</code> endet die Sitzung. Zum Löschen markierte Nachrichten würden jetzt endgültig entfernt.</p></div>
     </div>
     <table class="command-table"><thead><tr><th>Befehl</th><th>Funktion</th><th>Beispielantwort</th></tr></thead><tbody>
       <tr><td><code>USER team7</code></td><td>Benutzername senden</td><td><code>+OK user accepted</code></td></tr>
       <tr><td><code>PASS …</code></td><td>Anmeldung abschließen</td><td><code>+OK mailbox ready</code></td></tr>
       <tr><td><code>STAT</code></td><td>Anzahl und Gesamtgröße</td><td><code>+OK 2 3460</code></td></tr>
       <tr><td><code>LIST</code></td><td>Nachrichten mit Größen auflisten</td><td><code>1 1200 / 2 2260</code></td></tr>
       <tr><td><code>RETR 2</code></td><td>Nachricht 2 vollständig abrufen</td><td><code>+OK 2260 octets</code></td></tr>
       <tr><td><code>QUIT</code></td><td>Sitzung sauber beenden</td><td><code>+OK goodbye</code></td></tr>
     </tbody></table>
     <div class="explain-grid">
       <div class="explain-card"><span class="mini-label">PORT 110</span><h3>Klassisches POP3</h3><p>Unverschlüsseltes POP3 nutzt traditionell TCP-Port 110. Eine TLS-Aufrüstung ist mit STLS möglich, wenn Client und Server sie unterstützen.</p></div>
       <div class="explain-card"><span class="mini-label">PORT 995</span><h3>POP3 über TLS</h3><p>POP3S startet direkt in einer TLS-geschützten Verbindung. Der analysierte Client verwendet deshalb <code>POP3_SSL</code> und Port 995.</p></div>
     </div>
     <div class="takeaway"><strong>Merksatz</strong><span>Der fertige Client verbirgt nicht das Protokoll: Seine Methoden bilden POP3-Befehle ab, und jede Methode erwartet eine definierte Antwort des Servers.</span></div>`
  );
  runtime.codeQuestion = 0;
  runtime.codeSelection = null;
  runtime.terminalStep = 0;
  const challenge = challengeShell(
    "Beweis 04: Client analysieren und Sitzung ausführen",
    "Markiere passende Codezeilen. Führe danach das Analyse-Skript in der POP3-Konsole aus.",
    `<div id="pop3-challenge-interactive"></div>`
  );
  elements.missionContent.innerHTML = knowledge + challenge;
  renderCodeAnalysis();
}

function renderCodeAnalysis() {
  const question = codeQuestions[runtime.codeQuestion];
  document.querySelector("#pop3-challenge-interactive").innerHTML = `
    <div class="code-lab">
      <div class="code-window"><div class="window-bar"><span>pop3_client.py</span><span>fertiger Client · nur Analyse</span></div><div class="code-lines">${pop3Code.map((line, index) => `<button class="code-line" type="button" data-code-line="${index + 1}"><span>${String(index + 1).padStart(2, "0")}</span><span>${escapeHtml(line) || "&nbsp;"}</span></button>`).join("")}</div></div>
      <div class="analysis-panel"><p class="analysis-progress">FRAGE ${runtime.codeQuestion + 1} / ${codeQuestions.length}</p><h3>${question.prompt}</h3><p>Wähle genau die Codezeile, die diese Aufgabe ausführt.</p></div>
    </div>`;
  document.querySelector("#challenge-primary-action").innerHTML = `<button class="button primary" id="check-code-line" type="button">Codezeile prüfen</button>`;
  document.querySelectorAll("[data-code-line]").forEach((button) => button.addEventListener("click", () => {
    runtime.codeSelection = Number(button.dataset.codeLine);
    document.querySelectorAll("[data-code-line]").forEach((item) => item.classList.toggle("selected", item === button));
  }));
  document.querySelector("#check-code-line").addEventListener("click", checkCodeLine);
}

function checkCodeLine() {
  const question = codeQuestions[runtime.codeQuestion];
  if (runtime.codeSelection !== question.answer) {
    feedback("Diese Zeile erfüllt eine andere Aufgabe. Vergleiche den Methodennamen mit dem gesuchten Protokollschritt.", "error");
    return;
  }
  feedback(question.explain, "success");
  runtime.codeQuestion += 1;
  runtime.codeSelection = null;
  if (runtime.codeQuestion < codeQuestions.length) {
    window.setTimeout(renderCodeAnalysis, 550);
  } else {
    window.setTimeout(renderPop3Terminal, 550);
  }
}

const terminalScript = [
  { command: "USER TEAM7", response: "+OK user accepted" },
  { command: "PASS SPUREN", response: "+OK mailbox locked and ready" },
  { command: "STAT", response: "+OK 2 3460" },
  { command: "LIST", response: "+OK 2 messages\n1 1200\n2 2260\n." },
  { command: "RETR 2", response: "+OK 2260 octets\nFrom: leitung@medienzentrum.local\nSubject: Neuer Startpfad\n\nDie Ausstellung liegt jetzt unter /portal/index.html\n." },
  { command: "QUIT", response: "+OK update complete, goodbye" },
];

function renderPop3Terminal() {
  runtime.terminalLines = [{ type: "server", text: "+OK mail.medienzentrum.local POP3 server ready" }];
  runtime.terminalStep = 0;
  document.querySelector("#pop3-challenge-interactive").innerHTML = `
    <p class="challenge-copy">Codeanalyse bestanden. Führe nun genau das Untersuchungsskript aus: anmelden, Postfachstatus prüfen, Nachrichten auflisten, Nachricht 2 abrufen und die Sitzung beenden. Du kannst Befehle tippen oder die Schnellwahl nutzen.</p>
    <div class="terminal"><div class="window-bar"><span>POP3 // mail.medienzentrum.local:995</span><span id="terminal-state">AUTORISIERUNG</span></div><div class="terminal-output" id="terminal-output"></div><form class="terminal-input" id="terminal-form"><label for="terminal-command">C:</label><input id="terminal-command" autocomplete="off" spellcheck="false" placeholder="POP3-Befehl" /><button class="button primary" type="submit">Senden</button></form><div class="quick-commands">${terminalScript.map((step) => `<button type="button" data-quick-command="${step.command}">${step.command}</button>`).join("")}</div></div>`;
  document.querySelector("#challenge-primary-action").innerHTML = "";
  renderTerminalLines();
  document.querySelector("#terminal-form").addEventListener("submit", (event) => {
    event.preventDefault();
    submitTerminalCommand(document.querySelector("#terminal-command").value);
  });
  document.querySelectorAll("[data-quick-command]").forEach((button) => button.addEventListener("click", () => submitTerminalCommand(button.dataset.quickCommand)));
}

function renderTerminalLines() {
  const output = document.querySelector("#terminal-output");
  output.innerHTML = runtime.terminalLines.map((line) => `<div class="${line.type}">${line.type === "client" ? "C: " : "S: "}${escapeHtml(line.text).replaceAll("\n", "<br>")}</div>`).join("");
  output.scrollTop = output.scrollHeight;
  const states = ["AUTORISIERUNG", "AUTORISIERUNG", "TRANSAKTION", "TRANSAKTION", "TRANSAKTION", "AKTUALISIERUNG", "BEENDET"];
  document.querySelector("#terminal-state").textContent = states[runtime.terminalStep];
}

function submitTerminalCommand(raw) {
  const command = raw.trim().replace(/\s+/g, " ").toUpperCase();
  if (!command) return;
  const expected = terminalScript[runtime.terminalStep];
  runtime.terminalLines.push({ type: "client", text: raw.trim() });
  if (!expected || command !== expected.command) {
    runtime.terminalLines.push({ type: "error", text: `-ERR Für diesen Analyseschritt wird ein anderer Befehl erwartet.` });
    feedback("Die Syntax ist möglich, passt aber noch nicht zum nächsten Schritt des vorgegebenen Analyse-Skripts. Nutze Zustand und Zielanzeige.", "error");
  } else {
    runtime.terminalLines.push({ type: expected.command === "RETR 2" ? "mail" : "server", text: expected.response });
    runtime.terminalStep += 1;
    feedback(runtime.terminalStep < terminalScript.length ? `Antwort ausgewertet. Nächster Protokollschritt: ${runtime.terminalStep + 1} von ${terminalScript.length}.` : "Die POP3-Sitzung wurde vollständig und sauber beendet.", "success");
  }
  document.querySelector("#terminal-command").value = "";
  renderTerminalLines();
  if (runtime.terminalStep === terminalScript.length) {
    completeMission(3, "Beweis gesichert: Du hast Programmcode, POP3-Befehle, Serverantworten und Sitzungszustände erfolgreich miteinander verknüpft.");
  }
}

const finalQuestions = [
  {
    prompt: "Der Browser erhält HTTP 404 vom Webserver. Welche Aussage ist fachlich tragfähig?",
    options: [
      { id: "reached", text: "Netzweg und Webdienst funktionieren grundsätzlich; die angeforderte Ressource fehlt." },
      { id: "switch", text: "Der zentrale Switch ist vollständig ausgefallen." },
      { id: "dns", text: "DNS kann den Servernamen auf keinen Fall auflösen." },
    ],
    answer: "reached",
  },
  {
    prompt: "Das Zertifikat passt jetzt zu portal.schule.test. Was leistet HTTPS in diesem Fall?",
    options: [
      { id: "truth", text: "Es bestätigt automatisch, dass alle Inhalte sachlich richtig sind." },
      { id: "transport", text: "Es schützt die HTTP-Daten auf dem Weg und hilft, den Server zu authentifizieren." },
      { id: "topology", text: "Es wandelt die Sternstruktur des Netzes in eine Busstruktur um." },
    ],
    answer: "transport",
  },
  {
    prompt: "Die POP3-Mail nennt /portal/index.html als neuen Startpfad. Welche Anfrage prüft die Spur?",
    options: [
      { id: "correct-get", text: "GET /portal/index.html mit Host: portal.schule.test" },
      { id: "pass", text: "PASS /portal/index.html an den Webserver" },
      { id: "retr", text: "RETR /portal/index.html an den Webserver" },
    ],
    answer: "correct-get",
  },
  {
    prompt: "Welche Gesamtbeschreibung verbindet alle Beweise korrekt?",
    options: [
      { id: "full", text: "Der Browser-Client erreicht über das Sternnetz den Webserver. HTTPS schützt HTTP; POP3 liefert aus dem Mailserver den korrigierten Ressourcenpfad." },
      { id: "same", text: "HTTP, HTTPS und POP3 sind verschiedene Namen für dasselbe Protokoll und nutzen immer dieselbe Serverantwort." },
      { id: "device", text: "Ein Client ist immer ein Laptop und ein Server immer ein eigener Großrechner, unabhängig vom Programm." },
    ],
    answer: "full",
  },
];

function renderFinalMission() {
  const knowledge = learningBlock(
    "Vier Spuren, eine technische Erklärung",
    "Diagnose bedeutet, Beobachtungen den richtigen Systemteilen zuzuordnen.",
    "⌕",
    `<div class="evidence-board">
       <div class="evidence-card"><span>SPUR A · NETZPLAN</span><code>Client 07 → Switch A → Webserver</code><p>Alle Verbindungsanzeigen sind aktiv. Andere Dienste am Server sind erreichbar.</p></div>
       <div class="evidence-card"><span>SPUR B · WEB</span><code>GET /startseite.html\nHTTP/1.1 404 Not Found</code><p>Der Server antwortet selbst mit einem gültigen HTTP-Status.</p></div>
       <div class="evidence-card"><span>SPUR C · TLS</span><code>Host: portal.schule.test\nZertifikat: portal.schule.test</code><p>Nach dem Austausch passt die geprüfte Identität zum aufgerufenen Host.</p></div>
       <div class="evidence-card"><span>SPUR D · MAIL</span><code>RETR 2\nNeuer Pfad: /portal/index.html</code><p>Der analysierte POP3-Client ruft den entscheidenden Hinweis vom Mailserver ab.</p></div>
     </div>
     <div class="takeaway"><strong>Diagnoseregel</strong><span>Eine Antwort ist selbst ein Beweis. HTTP 404 bedeutet nicht „kein Netz“, sondern: Ein erreichbarer Webserver findet genau die angeforderte Ressource nicht.</span></div>`
  );
  runtime.finalQuestion = 0;
  runtime.finalAnswer = null;
  const challenge = challengeShell(
    "Abschlussprotokoll erstellen",
    "Beantworte vier Transferfragen. Die Antwortpositionen werden bei jedem Durchlauf neu gemischt.",
    `<div id="final-challenge-interactive"></div>`
  );
  elements.missionContent.innerHTML = knowledge + challenge;
  renderFinalQuestion();
}

function renderFinalQuestion() {
  const question = finalQuestions[runtime.finalQuestion];
  const options = shuffle(question.options);
  runtime.finalAnswer = null;
  document.querySelector("#final-challenge-interactive").innerHTML = `
    <p class="analysis-progress">BEWEISFRAGE ${runtime.finalQuestion + 1} / ${finalQuestions.length}</p>
    <h3>${question.prompt}</h3>
    <div class="decision-list">${options.map((option, index) => `<button class="decision-button" type="button" data-final-answer="${option.id}"><b>${String.fromCharCode(65 + index)}</b><span>${option.text}</span></button>`).join("")}</div>`;
  document.querySelector("#challenge-primary-action").innerHTML = `<button class="button primary" id="check-final-answer" type="button">Aussage prüfen</button>`;
  document.querySelectorAll("[data-final-answer]").forEach((button) => button.addEventListener("click", () => {
    runtime.finalAnswer = button.dataset.finalAnswer;
    document.querySelectorAll("[data-final-answer]").forEach((item) => item.classList.toggle("selected", item === button));
  }));
  document.querySelector("#check-final-answer").addEventListener("click", () => {
    if (runtime.finalAnswer !== question.answer) {
      feedback("Diese Schlussfolgerung passt nicht zu allen beobachteten Spuren. Nutze nur Aussagen, die durch Status, Rolle oder Protokollantwort tatsächlich belegt sind.", "error");
      return;
    }
    runtime.finalQuestion += 1;
    if (runtime.finalQuestion < finalQuestions.length) {
      feedback("Beweisschluss korrekt. Die nächste Spur wird freigegeben.", "success");
      window.setTimeout(renderFinalQuestion, 500);
    } else {
      completeMission(4, "Fall gelöst: GET /portal/index.html liefert HTTP/1.1 200 OK. Deine Beweiskette erklärt Netzstruktur, Client-Server-Rollen, HTTPS und POP3 fachlich korrekt.");
    }
  });
}

function showCompletion() {
  elements.evidenceSummary.innerHTML = missions.map((mission, index) => `<div><strong>${state.completed[index] ? "✓" : "—"}</strong><span>${mission.tags[0]}</span></div>`).join("");
  showView("completion");
}

function resetCase() {
  const confirmed = window.confirm("Soll der gesamte WEBTRACE-Fortschritt auf diesem Gerät gelöscht werden?");
  if (!confirmed) return;
  state = { ...defaultState, completed: [...defaultState.completed] };
  saveState();
  activeMission = null;
  showBriefing();
  updateProgress();
}

document.querySelector("#brand-button").addEventListener("click", renderHub);
document.querySelector("#reset-button").addEventListener("click", resetCase);
document.querySelector("#scene-back").addEventListener("click", () => { sceneIndex = Math.max(0, sceneIndex - 1); renderScene(); });
document.querySelector("#scene-next").addEventListener("click", () => {
  if (sceneIndex < scenes.length - 1) { sceneIndex += 1; renderScene(); }
  else { state.briefingSeen = true; saveState(); renderHub(); }
});
document.querySelector("#scene-skip").addEventListener("click", () => { state.briefingSeen = true; saveState(); renderHub(); });
document.querySelector("#replay-briefing").addEventListener("click", showBriefing);
document.querySelector("#back-to-hub").addEventListener("click", renderHub);
document.querySelector("#hint-close").addEventListener("click", () => elements.hintDialog.close());
document.querySelector("#return-hub").addEventListener("click", renderHub);
document.querySelector("#restart-case").addEventListener("click", resetCase);

updateProgress();
renderNav();
if (state.briefingSeen) renderHub();
else showBriefing();
