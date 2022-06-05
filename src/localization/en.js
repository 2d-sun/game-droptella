export default {
  donates: "$",
  catched: "CATCHED",
  missed: "MISSED",
  housesPersentage: "HEALTH",
  failed: "FAILED",
  start: "LETS PROTECT",
  premise: [
    "The enemy has failed. But they still have bombs. Protect our towns, while we will take care of their command centres."
  ],
  clickToProceed: "(click to proceed)",
  victory: "VICTORY",
  fullVictory: (savedCity, lostCity) => {
    const constantMessage = "We won. We eliminated the enemy. The world is save now."

    if (lostCity === 0) return `${constantMessage} You saved all the cities. You are hero. Glory to Ukraine.`
    if (savedCity === 0) return `Glory to Ukraine. Aren't you saboteur? All the cities under you protection were destroyed. But we will rebuild them. We also have a good news. ${constantMessage}`

    const savedCityLabel = savedCity > 1 ? "city" : "cities"
    const lostCityLabel = lostCity > 1 ? "city" : "cities"
    
    return `${constantMessage} You saved ${savedCity} ${savedCityLabel}. You lost ${lostCity} ${lostCityLabel}. But we will rebuild them. Glory to Ukraine.`
  }
}