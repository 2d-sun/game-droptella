export default {
  donates: "$",
  catched: "CATCHED",
  missed: "MISSED",
  housesPersentage: "HEALTH",
  failed: "You've lost the city. The enemy has more suply for the next one. Good luck.",
  start: "LETS PROTECT",
  premise: [
    "The enemy has failed. But they still have bombs. Protect our towns, while we will take care of their command centres."
  ],
  clickToProceed: "(click to proceed)",
  victory: (savedBuilding, lostBuilding) => {
    return `The number of buildings you have lost: ${lostBuilding}. The number of building you have saved: ${savedBuilding}`
  },
  fullVictory: (savedCity, lostCity) => {
    const constantMessage = "We won. We eliminated the enemy. The world is save now."

    if (lostCity === 0) return `${constantMessage} You saved all the cities. You are hero. Glory to Ukraine.`
    if (savedCity === 0) return `Glory to Ukraine. Aren't you saboteur? All the cities under you protection were destroyed. But we will rebuild them. We also have a good news. ${constantMessage}`

    const savedCityLabel = savedCity > 1 ? "city" : "cities"
    const lostCityLabel = lostCity > 1 ? "city" : "cities"
    
    return `${constantMessage} You saved ${savedCity} ${savedCityLabel}. You lost ${lostCity} ${lostCityLabel}. But we will rebuild them. Glory to Ukraine.`
  },
  widescreenRatioSupportAlert: "We are sorry. But currently we support only widescreen aspect ratio. Please rotate you device and reload the page.",


  supportUkrainePrytula: {
    text: "Donate to Serhiy Prytula Foundation",
    url: "https://quicknote.io/e7869010-bf2a-11ec-aabc-9bb4d2c6951f"
  },
  supportUkraineSafeLifeInUa: {
    text: "Donate to safelife.in.ua",
    url: "https://savelife.in.ua/en/donate-en/"
  },
  supportUkraineInfo: {
    text: "--> More information <--",
    url: "https://www.comebackalive.in.ua"
  },
  supportUkraineStandWithUkraine: {
    text: "#STANDWITHUKRAINE"
  }
}