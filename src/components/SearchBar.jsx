import { useState } from 'react'

export default function SearchBar({ onChange, onSubmit }) {
  const [value, setValue] = useState('')

  function handleChange(e) {
    setValue(e.target.value)
    onChange(e.target.value)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmit(value)
    }
  }

  return (
    <form className="search" onSubmit={(e) => { e.preventDefault(); onSubmit(value) }}>
      <input
        type="search"
        value={value}
        placeholder="Search events…"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </form>
  )
}
