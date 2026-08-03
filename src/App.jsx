/**
 * App.jsx — the shell for the project collection.
 *
 * Project 1 is the ThemeFlex color picker. Additional projects can be added to
 * the `PROJECTS` registry below and they will share this same code base,
 * tooling and design primitives.
 */

import ColorPickerApp from './projects/color-picker/ColorPickerApp.jsx'

const PROJECTS = [
  {
    id: 'color-picker',
    name: 'Color Picker',
    component: ColorPickerApp,
  },
]

export default function App() {
  const Active = PROJECTS[0].component
  return <Active />
}
