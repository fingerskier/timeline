import { context, _default } from "./context.js";

export default class Timeline {
  constructor() {
    this.events = []

    _default('timeline', [])
  }


  add({due, name}) {
    const T = context.timeline

    T.push({
      due: due,
      name: name,
    })

    T.sort((a,b)=>{
      if (a.due > b.due) return 1
      if (a.due < b.due) return -1
      return 0
    })

    context.timeline = T
  }


  link_delete_buttons() {
    function delete_event(event) {
      
    }
    
    const buttons = document.querySelectorAll('.delete.button')


  }


  markup_events(wrappers, events) {
    let result = ''
    
    const wrapper = wrappers[0]
    
    events.forEach((el,I)=>{
      result += `<${wrapper}>
        ${el.due}: ${el.name}
        <button class="delete button">X</button>
      </${wrapper}>`
    })
    
    return result
  }
  

  markup_list() {
    let content = '<ul>'
    
    content += this.markup_events`li${context.timeline}`
    
    content += '</ul>'

    return content
  }


  render(container_id) {
    const container = document.getElementById(container_id)

    container.innerHTML = this.markup_list()

    this.link_delete_buttons()
  }
}