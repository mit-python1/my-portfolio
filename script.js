/* ============================================
   Mitali Mahajan Portfolio — shared behaviour
   1. IntersectionObserver scroll-reveal
   2. Mobile sidebar drawer (hamburger)
   3. Optional pointer tilt for [data-tilt] cards
   Plain vanilla JS, no dependencies.
   ============================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var toArray = function (list) {
    return Array.prototype.slice.call(list);
  };

  /* ---------- 1. Scroll reveal ---------- */
  function initReveal() {
    var items = toArray(document.querySelectorAll(".reveal"));
    if (!items.length) return;

    // Stagger siblings that live inside a [data-reveal-group] container.
    items.forEach(function (el) {
      var group = el.closest ? el.closest("[data-reveal-group]") : null;
      if (!group) return;
      var siblings = toArray(group.querySelectorAll(".reveal"));
      var i = siblings.indexOf(el);
      if (i > 0) {
        el.style.setProperty("--reveal-delay", Math.min(i, 6) * 80 + "ms");
      }
    });

    // No IO support or reduced motion: just show everything.
    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );

    items.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- 2. Mobile sidebar drawer ---------- */
  function initNav() {
    var body = document.body;
    var toggle = document.querySelector(".nav-toggle");
    var sidebar = document.getElementById("sidebar");
    var scrim = document.querySelector(".nav-scrim");
    if (!toggle || !sidebar) return;

    function focusables() {
      return toArray(
        sidebar.querySelectorAll('a[href], button:not([disabled])')
      );
    }

    function isOpen() {
      return body.classList.contains("nav-open");
    }

    function openNav() {
      body.classList.add("nav-open");
      toggle.setAttribute("aria-expanded", "true");
      var f = focusables();
      if (f.length) f[0].focus();
      document.addEventListener("keydown", onKeydown);
    }

    function closeNav(returnFocus) {
      body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      document.removeEventListener("keydown", onKeydown);
      if (returnFocus !== false) toggle.focus();
    }

    function onKeydown(e) {
      if (e.key === "Escape" || e.key === "Esc") {
        closeNav();
        return;
      }
      if (e.key !== "Tab") return;
      // Keep tab focus inside the open drawer.
      var f = focusables();
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    toggle.addEventListener("click", function () {
      if (isOpen()) closeNav();
      else openNav();
    });

    if (scrim) {
      scrim.addEventListener("click", function () {
        closeNav();
      });
    }

    // Close when any link in the sidebar is activated.
    sidebar.addEventListener("click", function (e) {
      var link = e.target.closest ? e.target.closest("a") : null;
      if (link && isOpen()) closeNav(false);
    });

    // Clear the drawer state if the viewport grows back to desktop.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && isOpen()) closeNav(false);
    });
  }

  /* ---------- 3. Optional pointer tilt ---------- */
  function initTilt() {
    if (prefersReduced) return;
    if (
      !window.matchMedia ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return;
    }

    toArray(document.querySelectorAll("[data-tilt]")).forEach(function (el) {
      var MAX = 4; // degrees

      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--tiltX", (py * -MAX).toFixed(2) + "deg");
        el.style.setProperty("--tiltY", (px * MAX).toFixed(2) + "deg");
      });

      el.addEventListener("mouseleave", function () {
        el.style.setProperty("--tiltX", "0deg");
        el.style.setProperty("--tiltY", "0deg");
      });
    });
  }

  /* ---------- 4. Skills & Tools "More" toggle ---------- */
  function initSkillsToggle() {
    var btn = document.querySelector(".skill-more");
    if (!btn) return;
    var extras = toArray(document.querySelectorAll(".skill-extra"));
    if (!extras.length) return;

    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      extras.forEach(function (el) {
        el.hidden = expanded;
      });
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      btn.textContent = expanded ? "+ More" : "Show Less";
    });
  }

  function init() {
    initReveal();
    initNav();
    initTilt();
    initSkillsToggle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
