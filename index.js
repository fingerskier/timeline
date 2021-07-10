import { context, _default } from "./lib/context.js";
import Timeline from "./lib/Timeline.js";

const timeline = new Timeline()

let menu


function addEvent(E) {
  E.preventDefault()

  const event = {
    name: document.getElementById('event_name').value,
    due: document.getElementById('event_due').value,
  }

  timeline.add(event)

  return false
}


function hide_menu() {
  menu.style.display = 'none';
}


function right_click(event) {
  event.preventDefault()

  console.log(event)
  
  menu.style.display = 'block';
  menu.style.left = event.pageX + "px";
  menu.style.top = event.pageY + "px";

  return false
}


function main(event) {
  const add_event_form = document.getElementById('add_event')
  
  menu = document.getElementById('context_menu')

  document.addEventListener('contextmenu', right_click)
  document.addEventListener('click', hide_menu)
  document.addEventListener('keydown', hide_menu)

  _default('timeline', [])

  add_event_form.addEventListener('submit', addEvent)

  timeline.render('timeline')
}


window.addEventListener('load', main)