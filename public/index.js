import { context, _default } from "./lib/context.js";


function timeline_event(wrappers, ...events) {
  let result = ''

  for (let I in events) {
    const event = events[I]
    const wrapper = wrappers[I]

    result += `<${wrapper}>${event.due}: ${event.name}</${wrapper}>`
  }

  return result
}


function render_timeline() {
  const container = document.getElementById('timeline')

  let content = '<ul>'

  for (const event of context.timeline) {
    content += timeline_event`li${event}`
  }

  content += '</ul>'

  container.innerHTML = content
}


function addEvent(E) {
  E.preventDefault()

  const event = {
    name: document.getElementById('event_name').value,
    due: document.getElementById('event_due').value,
  }

  const T = context.timeline
  T.push(event)
  context.timeline = T
  console.log(T)

  return false
}


function main(event) {
  const add_event_form = document.getElementById('add_event')

  _default('timeline', [])

  add_event_form.addEventListener('submit', addEvent)

  render_timeline()
}


window.addEventListener('load', main)