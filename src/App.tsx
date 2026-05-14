

import Nav from './components/nav'
import TaskList from './components/Tasks'
import Time from './components/Time'

function App() {
  

  return (
 <main className='min-h-screen w-full flex flex-col'>
  <Nav/>  
  <section className='flex flex-col items-start md:gap-5 md:flex-row md:justify-between px-10 '>
    <TaskList/>
    <Time/>
  </section>

 </main>
  )
}

export default App
