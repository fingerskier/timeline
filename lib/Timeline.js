import { context, _default } from "./context.js";

export default class Timeline {
  constructor() {
    this.current_container = 'timeline'
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

    this.render()
  }


  delete(index) {
    const T = context.timeline

    delete T[index]

    context.timeline = T
  }


  link_delete_buttons() {
    const buttons = document.querySelectorAll('.delete.button')

    for (let button of buttons) {
      button.addEventListener('click', (event)=>{
        const el = event.target
        
        const T = context.timeline

        const index = el.dataset.index
  
        T.splice(index, 1)
  
        context.timeline = T

        this.render()
      })
    }
  }


  markup_events(wrappers, events) {
    let result = ''
    
    const wrapper = wrappers[0]
    console.log('marking up ', wrappers, events)
    
    events.forEach((el,I)=>{
      result += `<${wrapper}>
        <span>${el.due}: ${el.name}</span>
        <button class="delete button" data-index="${I}">X</button>
      </${wrapper}>`
    })
    
    return result
  }
  
  
  markup_list() {
    let content = '<ul>'
    
    content += this.markup_events`li${context.timeline}`
    
    content += '</ul>'
    
    console.log(content)
    return content
  }


  render(container_id) {
    this.current_container = container_id || this.current_container

    const container = document.getElementById(this.current_container)

    container.innerHTML = this.markup_list()

    this.link_delete_buttons()
  }
}