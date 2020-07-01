getRequirements();

function getRequirements() {
  //How Many Cards to Draw
  //Width/Height
  //Which Table to Draw From
  let cardsList = "";
  Array.from(game.tables).map((el) => {
    cardsList += `<option value="${el.data.name}">${el.data.name}</option>`;
  });

  let template = `
  <p>Table to Draw From: <select id="tableName">${cardsList}</select></p>
  <p>Number of Cards to Draw: <input id="drawAmt" type="number" style="width: 50px;" value=1></p>
  <p>
    Height: <input id="height" type="number" style="width: 50px" value=350>
    Width: <input id="width" type="number" style="width: 50px" value=250>
  </p>
  `;
  new Dialog({
    title: "Draw Cards To Table",
    content: template,
    buttons: {
      ok: {
        label: "Draw",
        callback: async (html) => {
          makeTiles(html);
        },
      },
      cancel: {
        label: "Cancel",
      },
    },
  }).render(true);
}

async function makeTiles(html) {
  let tableName = html.find("#tableName")[0].value;
  let cardsToDraw = html.find("#drawAmt")[0].value;
  let _height = html.find("#height")[0].value;
  let _width = html.find("#width")[0].value;

  let cardDraws = (
    await game.tables
      .find((el) => el.data.name == tableName)
      .drawMany(cardsToDraw)
  ).results;

  for (let i = 0; i < cardsToDraw; i++) {
    await Tile.create({
      img: cardDraws[i].img,
      width: _width,
      height: _height,
      x: 1000,
      y: 1000,
    });
  }
}
