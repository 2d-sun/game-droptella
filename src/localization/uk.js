export default {
  donates: "$",
  catched: "СПІЙМАНО",
  missed: "ПРОПУЩЕНО",
  housesPersentage: "ЦІЛІСНІСТЬ",
  failed: "Ви втратили місто. Тепер ворог матиме більше припасів для іншого. Щасти.",
  start: "ДО БОЮ",
  premise: [
    "Ворог зазнав невдачі. Але у них все ще є бомби. Захисти наші міста, а ми подбаємо про їхні командні центри."
  ],
  clickToProceed: "(Клацніть, щоб продовжити)",
  victory: "ПЕРЕМОГА",
  fullVictory: (savedCity, lostCity) => {
    const constantMessage = "Ми перемогли. Ми знищили ворога, тож він тепер нікому не завдасть шкоди."

    if (lostCity === 0) return `${constantMessage} Ви врятували усі міста. Ви великий герой. Слава Україні.`
    if (savedCity === 0) return `Слава Україні. Ви не диверсант часом? Усі міста, які були під вашою опікою знищено. Та ми відбудуємо їх. Є й хороша новина. ${constantMessage}`

    const savedCityLabel = savedCity > 1 ? "міст" : "місто"
    const lostCityLabel = lostCity > 1 ? "міст" : "місто"
    
    return `${constantMessage} Завдяки вам, ми врятували ${savedCity} ${savedCityLabel}. Проте також ми втратили ${lostCity} ${lostCityLabel}. Та ми відбудуємо їх. Слава Україні.`
  }
}