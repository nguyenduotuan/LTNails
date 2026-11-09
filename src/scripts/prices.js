// Price list page: renders categories from src/data/prices.json.
document.addEventListener("site:ready", async () => {
  const root = document.getElementById("price-list");
  const empty = document.getElementById("price-empty");
  let data = [];
  try { data = await Site.loadJSON("prices"); } catch (e) { console.error(e); }

  const render = () => {
    root.replaceChildren();
    empty.hidden = data.length > 0;
    data.forEach((group) => {
      const section = document.createElement("section");
      section.className = "price-group";
      const h = document.createElement("h2");
      h.textContent = Site.pick(group.category);
      const ul = document.createElement("ul");
      group.items.forEach((item) => {
        const li = document.createElement("li");
        const name = document.createElement("span");
        const price = document.createElement("span");
        name.textContent = Site.pick(item.name);
        price.textContent = item.price;
        li.append(name, price);
        ul.appendChild(li);
      });
      section.append(h, ul);
      root.appendChild(section);
    });
  };
  render();
  Site.onLangChange(render);
});
