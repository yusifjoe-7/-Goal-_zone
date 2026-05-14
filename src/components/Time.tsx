import { useEffect, useState } from "react"
import Countdown from "react-countdown"
import { useTaskStore } from "./zustan"

function Time() {

  const [endDate, setEndDate] = useState<Date | null>(null)

  const [isOn, setIsOn] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState(false)

  const [startInput, setStartInput] = useState("")
  const [endInput, setEndInput] = useState("")
  

  // restore data from localStorage
  useEffect(() => {

    const savedCompleted = localStorage.getItem("completed")

    
    if (savedCompleted === "true") {
      setCompleted(true)
      return
    }

    const savedStart = localStorage.getItem("startDate")
    const savedEnd = localStorage.getItem("endDate")

    if (!savedStart || !savedEnd) return

    const start = new Date(savedStart)
    const end = new Date(savedEnd)

    setEndDate(end)

    setStartInput(start.toISOString().slice(0, 16))
    setEndInput(end.toISOString().slice(0, 16))

    startTimer(start, end)

  }, [])

  const startTimer = (start: Date, end: Date) => {

    const diff = start.getTime() - Date.now()

    if (start.getTime() >= end.getTime()) {
      setError(true)
      return
    }

    // start immediately
    if (diff <= 0) {

      // لو الوقت خلص بالفعل
      if (Date.now() >= end.getTime()) {
        setCompleted(true)
        localStorage.setItem("completed", "true")
        return
      }

      setWaiting(false)
      setIsOn(true)
      return
    }

    // wait until start date
    setWaiting(true)

    setTimeout(() => {

      // 
      if (Date.now() >= end.getTime()) {
        setCompleted(true)
        localStorage.setItem("completed", "true")
        return
      }

      setWaiting(false)
      setIsOn(true)

    }, diff)
  }

  const handleStart = () => {

    if (!startInput || !endInput) {
      setError(true)
      return
    }

    setError(false)
    setCompleted(false)

    const start = new Date(startInput)
    const end = new Date(endInput)

    setEndDate(end)

    localStorage.setItem("startDate", start.toISOString())
    localStorage.setItem("endDate", end.toISOString())
    localStorage.setItem("completed", "false")

    startTimer(start, end)
  }

const { clearTasks } = useTaskStore()
  const clearTimer = () => {

    localStorage.removeItem("startDate")
    localStorage.removeItem("endDate")
    localStorage.removeItem("completed")
    localStorage.removeItem("tasks")

    setEndDate(null)
    setCompleted(false)
    setWaiting(false)
    setIsOn(false)

    setStartInput("")
    setEndInput("")
    clearTasks()
    
  }

  return (

    <div className="w-full flex justify-center items-center flex-col gap-5 sm:my-10 my-5 order-1 md:order-2 ">

      {/* start date */}
      <div className="flex flex-col items-center justify-center gap-2 bg-card p-5 rounded-2xl shadow-lg border-border [.dark_&]:border-2 [.dark_&]:shadow-none">

        <h2>start date</h2>

        <input
          type="datetime-local"
          value={startInput}
          onChange={(e) => setStartInput(e.target.value)}
          className="inputDate border-none"
        />

      </div>

      {/* timer */}
      {waiting ? (

        <h1 className="text-7xl my-5 secFont">Waiting...</h1>

      ) : completed ? (

        <h1 className="text-7xl my-5 secFont z-50">Time Out</h1>

      ) : endDate ? (

        <Countdown
          date={endDate}

          onComplete={() => {

            setCompleted(true)
            setIsOn(false)

            localStorage.setItem("completed", "true")
          }}

          renderer={({ days, hours, minutes, seconds, completed }) => {

            if (completed) {


              return <h1 className="text-7xl my-5 secFont">Done</h1>
              
            }

            const totalHours = days * 24 + hours

            return (

              <h1 className="sm:text-[7rem] text-7xl my-10 secFont">

                {String(totalHours).padStart(2, "0")}:
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}

              </h1>
            )
          }}
        />

      ) : null}

      {/* end date */}
      <div className="flex flex-col items-center justify-center gap-2 bg-card p-5 rounded-2xl shadow-lg border-border [.dark_&]:border-2 [.dark_&]:shadow-none">

        <h2>end date</h2>

        <input
          type="datetime-local"
          value={endInput}
          onChange={(e) => setEndInput(e.target.value)}
          className="inputDate border-none "
        />

      </div>

      {error && (
        <p className="text-red-500">
          there is something missing
        </p>
      )}

      {!isOn && !waiting && !completed && (
        <button
          className="px-15 py-4 rounded-4xl my-5 shadow-sm hover:scale-105 hover:shadow-2xl transition text-pf bg-primary cursor-pointer"
          onClick={handleStart}
        >
          start
        </button>
      )}

     
     {completed&&
     <div className="fixed bottom-0 top-0 right-0 left-0 backdrop-blur-md">
     <button
     onClick={clearTimer}
      className="fixed bottom-20 left-3 right-3 sm:left-20 sm:right-20 py-5 rounded-3xl bg-secondary shadow-xl hover:scale-105 hover:shadow-2xl transition cursor-pointer "
      >create another goal</button>
      </div>}

    </div>
  )
}

export default Time