(function () {
  "use strict";

  var App = window.App;

  function render() {
    var container = document.getElementById("prices");
    if (!container) return;
    App.fetchJSON("src/data/prices.json")
      .then(function (categories) {
        container.innerHTML = "";
        if (!Array.isArray(categories) || categories.length === 0) {
          container.appendChild(App.el("p", "prices-empty", App.t("prices.empty")));
          return;
        }
        categories.forEach(function (cat) {
          var card = App.el("section", "price-card");
          card.appendChild(App.el("h2", "price-cat", App.text(cat.category)));
          var list = App.el("div", "price-list");
          (cat.items || []).forEach(function (item) {
            var row = App.el("div", "price-row");
            row.appendChild(App.el("span", "price-name", App.text(item.name)));
            row.appendChild(App.el("span", "price-dots"));
            row.appendChild(
              App.el("span", "price-value", item.price != null ? String(item.price) : "")
            );
            list.appendChild(row);
          });
          card.appendChild(list);
          container.appendChild(card);
        });
      })
      .catch(function () {
        container.innerHTML = "";
        container.appendChild(App.el("p", "prices-empty", App.t("prices.empty")));
      });
  }

  function init() {
    render();
    document.addEventListener("langchange", render);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
