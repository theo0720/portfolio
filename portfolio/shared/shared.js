/* shared.js — logique commune à toutes les pages */

(function () {
  "use strict";

  /* ── 1. Active nav link ──────────────────────────────────── */
  const page = location.pathname.split("/").slice(-2, -1)[0]; // dossier parent
  document.querySelectorAll(".nav-links a[data-page]").forEach((a) => {
    if (a.dataset.page === page) a.classList.add("active");
  });

  /* ── 2. Burger mobile ────────────────────────────────────── */
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      navLinks.classList.toggle("open");
    });
    // Ferme au clic extérieur
    document.addEventListener("click", (e) => {
      if (!burger.contains(e.target) && !navLinks.contains(e.target)) {
        burger.classList.remove("open");
        navLinks.classList.remove("open");
      }
    });
  }

  /* ── 3. Scroll reveal ────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ── 4. PDF Loader ───────────────────────────────────────── */
  document.querySelectorAll("input[type='file'][data-iframe]").forEach((input) => {
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file || file.type !== "application/pdf") return;
      const url = URL.createObjectURL(file);
      const iframeId = input.dataset.iframe;
      const zoneId   = input.dataset.zone;
      const iframe   = document.getElementById(iframeId);
      const zone     = document.getElementById(zoneId);
      if (iframe) { iframe.src = url; iframe.style.display = "block"; }
      if (zone)   { zone.style.display = "none"; }
    });
  });

  /* ── 5. Onglets génériques ───────────────────────────────── */
  // Usage : boutons avec data-tab="id", panneaux avec data-panel="id"
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.closest("[data-tabs-group]");
      if (!group) return;
      group.querySelectorAll("[data-tab]").forEach((b) => b.classList.remove("tab-active"));
      group.querySelectorAll("[data-panel]").forEach((p) => p.classList.remove("panel-active"));
      btn.classList.add("tab-active");
      const target = group.querySelector(`[data-panel="${btn.dataset.tab}"]`);
      if (target) target.classList.add("panel-active");
    });
  });

  /* ── 6. Skill bars (déclenche l'animation au scroll) ────── */
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(".bar-fill[data-w]").forEach((fill) => {
            fill.style.width = fill.dataset.w;
          });
          barObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  document.querySelectorAll("[data-skills-block]").forEach((el) =>
    barObserver.observe(el)
  );
})();
