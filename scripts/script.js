(function () {
  "use strict";

  var MONTHS = ["jan", "feb", "mars", "apr", "maj", "juni", "juli", "aug", "sep", "okt", "nov", "dec"];

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  /* "2022-08" -> "aug 2022", "1999-10-16" -> "16 okt 1999", "1992" -> "1992" */
  function formatDate(value) {
    var p = String(value).split("-");
    if (p.length === 1) return p[0];
    var month = MONTHS[parseInt(p[1], 10) - 1];
    if (p.length === 2) return month + " " + p[0];
    return parseInt(p[2], 10) + " " + month + " " + p[0];
  }

  function formatDuration(from, to) {
    var a = String(from).split("-");
    var b = String(to).split("-");
    if (a.length !== 2 || b.length !== 2) return "";
    var months = (parseInt(b[0], 10) - parseInt(a[0], 10)) * 12 + (parseInt(b[1], 10) - parseInt(a[1], 10)) + 1;
    if (months < 1) return "";
    var y = Math.floor(months / 12);
    var m = months % 12;
    var out = [];
    if (y) out.push(y + " år");
    if (m) out.push(m + " mån");
    return out.join(" ");
  }

  function buildWhen(item) {
    var when = el("div", "when");
    if (item.dates && item.dates.length) {
      item.dates.forEach(function (d, i) {
        if (i) when.appendChild(document.createElement("br"));
        when.appendChild(document.createTextNode(formatDate(d)));
      });
      return when;
    }
    if (item.date) {
      when.textContent = formatDate(item.date);
      return when;
    }
    var start = item.from ? formatDate(item.from) : "";
    var end = item.to ? formatDate(item.to) : "nu";
    var range = el("span", null, start === end ? start : start + " – " + end);
    when.appendChild(range);
    if (item.from && item.to) {
      var d = formatDuration(item.from, item.to);
      if (d) when.appendChild(el("span", "duration", d));
    }
    return when;
  }

  function tagGroup(title, items) {
    if (!items || !items.length) return null;
    var group = el("div", "group");
    group.appendChild(el("p", "group-title", title));
    var list = el("ul", "tags");
    items.forEach(function (t) { list.appendChild(el("li", null, t)); });
    group.appendChild(list);
    return group;
  }

  function highlightList(items) {
    if (!items || !items.length) return null;
    var list = el("ul", "highlights");
    items.forEach(function (t) { list.appendChild(el("li", null, t)); });
    return list;
  }

  function orgLine(organization, location) {
    var line = el("p", "org");
    line.appendChild(document.createTextNode(organization));
    if (location) line.appendChild(el("span", "where", ", " + location));
    return line;
  }

  function entry(item, buildCard) {
    var li = el("li", "entry");
    li.appendChild(buildWhen(item));
    var card = el("div", "card");
    buildCard(card, item);
    li.appendChild(card);
    return li;
  }

  function append(parent, child) { if (child) parent.appendChild(child); }

  function workCard(card, w) {
    var h = el("h3", null, w.role);
    if (w.employmentType) h.appendChild(el("span", "badge", w.employmentType));
    card.appendChild(h);
    card.appendChild(orgLine(w.organization, w.location));
    if (w.description) card.appendChild(el("p", null, w.description));
    append(card, tagGroup("Kurser", w.courses));
    append(card, tagGroup("Extra lektioner inom", w.extraCourses));
    append(card, highlightList(w.highlights));
    if (w.note) card.appendChild(el("p", "note", w.note));
  }

  function educationCard(card, e) {
    card.appendChild(el("h3", null, e.program));
    card.appendChild(orgLine(e.institution));
    append(card, tagGroup("Kurser", e.courses));
    append(card, tagGroup("Uppdrag", e.roles));
  }

  function courseCard(card, c) {
    card.appendChild(el("h3", null, c.title));
    if (c.provider) card.appendChild(orgLine(c.provider));
    if (c.note) card.appendChild(el("p", "note", c.note));
  }

  function renderList(id, items, builder) {
    var root = document.getElementById(id);
    (items || []).forEach(function (item) { root.appendChild(entry(item, builder)); });
  }

  function renderPortrait(basics) {
    var box = document.getElementById("portrait");
    var initials = basics.name.split(/\s+/).map(function (p) { return p.charAt(0); }).join("").slice(0, 2).toUpperCase();

    function showInitials() {
      box.textContent = "";
      box.appendChild(el("span", "initials", initials));
    }

    if (!basics.photo) { showInitials(); return; }
    var img = new Image();
    img.alt = "Porträtt av " + basics.name;
    img.onload = function () { box.textContent = ""; box.appendChild(img); };
    img.onerror = showInitials;
    showInitials();
    img.src = basics.photo;
  }

  function renderHeader(basics) {
    document.title = basics.name + " – CV";
    document.getElementById("name").textContent = basics.name;
    document.getElementById("headline").textContent = basics.title || "";
    document.getElementById("footer-name").textContent = basics.name;

    var contact = document.getElementById("contact");
    function item(label, node) {
      var d = el("div");
      d.appendChild(el("span", "label", label));
      d.appendChild(node);
      contact.appendChild(d);
    }

    if (basics.address && basics.address.length) {
      var addr = el("span");
      basics.address.forEach(function (line, i) {
        if (i) addr.appendChild(document.createElement("br"));
        addr.appendChild(document.createTextNode(line));
      });
      item("Adress", addr);
    }
    if (basics.phone) {
      var tel = el("a", null, basics.phone);
      tel.href = "tel:" + basics.phone.replace(/[^\d+]/g, "");
      item("Telefon", tel);
    }
    if (basics.email) {
      var mail = el("a", null, basics.email);
      mail.href = "mailto:" + basics.email;
      item("E-post", mail);
    }
    renderPortrait(basics);
  }

  function trackActiveSection() {
    if (!("IntersectionObserver" in window)) return;
    var links = document.querySelectorAll(".section-nav a");
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.remove("active"); });
          if (map[e.target.id]) map[e.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll("main section").forEach(function (s) { observer.observe(s); });
  }

  function showError() {
    var main = document.getElementById("main");
    main.textContent = "";
    var p = el("p", "notice", "Det gick inte att läsa in cv.json. ");
    main.appendChild(p);
  }

  fetch("cv.json", { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (cv) {
      renderHeader(cv.basics);
      renderList("work", cv.work, workCard);
      renderList("education", cv.education, educationCard);
      renderList("courses", cv.courses, courseCard);
      trackActiveSection();
    })
    .catch(showError);
})();
