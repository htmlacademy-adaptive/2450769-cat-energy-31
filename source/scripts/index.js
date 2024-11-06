import { activateNavigation } from "./main-nav.js"

let navigations = document.querySelectorAll(`.main-nav`)

navigations.forEach((navigation) => { activateNavigation(navigation) })
