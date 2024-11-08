import { activateNavigation } from "./main-nav/index.js"

let navigations = document.querySelectorAll(`.main-nav`)

navigations.forEach((navigation) => { activateNavigation(navigation) })
