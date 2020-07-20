/*
Features
- Draw n cards placing them in the scene
- This macro can reset the table preventing from the error
- This macro can line up the cards
*/

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
  <p>Number of Cards to Draw: <input id="drawAmt" type="number" style="width: 50px;" value=9></p>
  <p>
    Height: <input id="height" type="number" style="width: 50px" value=150>
    Width: <input id="width" type="number" style="width: 50px" value=107>
  </p>
  <br />
  <label>
    <input type="checkbox" id="chase" checked/>
    Chase?
  </label>  
  <br />
  <label>
    <input type="checkbox" id="reset" checked/>
    Reset Table?
  </label>  
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
  let resetTable = html.find("#reset")[0].value;
  let chase = html.find("#chase")[0].value;
  let tableName = html.find("#tableName")[0].value;
  let cardsToDraw = html.find("#drawAmt")[0].value;
  let _height = html.find("#height")[0].value;
  let _width = html.find("#width")[0].value;

  if (resetTable=='on') {
    await game.tables.find((el) => el.data.name == tableName).reset();
  }

  let cardDraws = (
    await game.tables
      .find((el) => el.data.name == tableName)
      .drawMany(cardsToDraw)
  ).results;

  let centerX = game.scenes.active.data.width / 3;
  let centerY = game.scenes.active.data.height / 2;
  
  let deltaX = 0;
  
  for (let i = 0; i < cardsToDraw; i++) {    
    if (chase=='on' && i!=0 ) {
      deltaX = ( _width*i  );      
    }
    await Tile.create({
      img: cardDraws[i].img,
      width: _width,
      height: _height,
      x: centerX + deltaX,
      y: centerY,
    });    
  }  
}
