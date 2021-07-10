import { context, _default } from "./lib/context.js";
import Timeline from "./lib/Timeline.js";

const timeline = new Timeline()


function timeline_event(wrappers, ...events) {
  let result = ''

  for (let I in events) {
    const event = events[I]
    const wrapper = wrappers[I]

    result += `<${wrapper}>
      ${event.due}: ${event.name}
    </${wrapper}>`
  }

  return result
}


function render_timeline() {
  const container = document.getElementById('timeline')

  let content = '<ul>'

  const T = context.timeline
  T.sort((a,b)=>{
    if (a.due > b.due) return 1
    if (a.due < b.due) return -1
    return 0
  })

  for (const event of T) {
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

  timeline.add(event)

  render_timeline()

  return false
}


function main(event) {
  const add_event_form = document.getElementById('add_event')

  _default('timeline', [])

  add_event_form.addEventListener('submit', addEvent)

  timeline.render('timeline')
}


window.addEventListener('load', main)