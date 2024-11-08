import { activateNavigation } from "./main-nav/index.js"
import { activateSlider } from "./before-after-slider/index.js"

let navigations = document.querySelectorAll(`.main-nav`)

navigations.forEach((navigation) => { activateNavigation(navigation) })

let sliders = document.querySelectorAll(`.slider__wrapper`)

sliders.forEach((slider) => { activateSlider(slider) })
