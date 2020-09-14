Hooks.on('ready', () => {
  //register game setting to auto set incapaciated
  game.settings.register('swade-macros-simple', 'autoToggleIncap', {
    name: "Autoset Skull on Incapacitated",
    config: true, 
    hint: "Sets the skull overlay when max wounds or fatigue are reached",
    scope: "world",
    default: true,
    type: Boolean
  })
})

Hooks.on("updateActor", (actor, data, diff, id) => {
  if(!game.settings.get("swade-macros-simple", "autoToggleIncap")){return;}
  if(actor.data.data.wounds.value > actor.data.data.wounds.max || actor.data.data.fatigue.value > actor.data.data.fatigue.max){
    actor.getActiveTokens().forEach(token => {
      if(token.data.overlayEffect != "icons/svg/skull.svg"){
        token.toggleOverlay("icons/svg/skull.svg")
      }
    })    
  }
})

