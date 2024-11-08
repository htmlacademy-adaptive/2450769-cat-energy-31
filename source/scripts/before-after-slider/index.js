export function activateSlider (slider) {
	let curtain = slider.querySelector(`.slider__curtain`)
	let sliderStyles = getComputedStyle(slider)
	let curtainPlaceStart
	let clientX

	window.addEventListener(`pointerup`, stopTheCurtainShifting)
	curtain.addEventListener(`pointerdown`, startTheCurtainShifting)

	function startTheCurtainShifting (event) {
		curtainPlaceStart = Number(sliderStyles.getPropertyValue(`--curtain-place`))
		clientX = event.clientX
		window.addEventListener(`pointermove`, shiftТheСurtain)
	}

	function shiftТheСurtain (event) {
		let deltaX = event.clientX - clientX
		let cursorPlace = curtainPlaceStart + (deltaX / slider.clientWidth)
		let curtainPlace = Math.min(Math.max(cursorPlace, 0), 1)

		slider.style.setProperty(`--curtain-place`, `${curtainPlace}`)
	}

	function stopTheCurtainShifting () {
		window.removeEventListener(`pointermove`, shiftТheСurtain)
	}
}
