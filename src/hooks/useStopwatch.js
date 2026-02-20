import { useReducer, useEffect, useCallback, useRef } from 'react'
import { loadDay, saveDay } from '../utils/storage.js'
import { todayKey } from '../utils/time.js'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

const initialState = {
  laps: [],
  activeLap: null,
  running: false,
  dateKey: todayKey(),
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD': {
      return {
        ...state,
        laps: action.laps,
        activeLap: action.activeLap,
        running: !!action.activeLap,
        dateKey: action.dateKey,
      }
    }
    case 'START': {
      const now = Date.now()
      return {
        ...state,
        activeLap: { id: generateId(), name: action.name, startTime: now },
        running: true,
      }
    }
    case 'LAP': {
      const now = Date.now()
      const completedLap = state.activeLap
        ? {
            ...state.activeLap,
            endTime: now,
            duration: now - state.activeLap.startTime,
          }
        : null
      return {
        ...state,
        laps: completedLap ? [completedLap, ...state.laps] : state.laps,
        activeLap: { id: generateId(), name: action.name, startTime: now },
      }
    }
    case 'STOP': {
      const now = Date.now()
      const completedLap = state.activeLap
        ? {
            ...state.activeLap,
            endTime: now,
            duration: now - state.activeLap.startTime,
          }
        : null
      return {
        ...state,
        laps: completedLap ? [completedLap, ...state.laps] : state.laps,
        activeLap: null,
        running: false,
      }
    }
    case 'DELETE_LAP': {
      return {
        ...state,
        laps: state.laps.filter((l) => l.id !== action.id),
      }
    }
    case 'CHECK_DATE': {
      const today = todayKey()
      if (state.dateKey !== today) {
        // Day rolled over — stop current lap at midnight, start fresh
        const midnight = new Date()
        midnight.setHours(0, 0, 0, 0)
        const midnightTs = midnight.getTime()

        const completedLap = state.activeLap
          ? {
              ...state.activeLap,
              endTime: midnightTs,
              duration: midnightTs - state.activeLap.startTime,
            }
          : null

        // Save yesterday's data
        const yesterdayLaps = completedLap ? [completedLap, ...state.laps] : state.laps
        saveDay(state.dateKey, { laps: yesterdayLaps, activeLap: null })

        // Start fresh today, carrying over the activity name
        const newActiveLap = state.activeLap
          ? { id: generateId(), name: state.activeLap.name, startTime: midnightTs }
          : null

        return {
          laps: [],
          activeLap: newActiveLap,
          running: !!newActiveLap,
          dateKey: today,
        }
      }
      return state
    }
    default:
      return state
  }
}

export function useStopwatch() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const onChangeRef = useRef(null)

  // Load saved state on mount
  useEffect(() => {
    const dateKey = todayKey()
    const saved = loadDay(dateKey)
    if (saved) {
      dispatch({
        type: 'LOAD',
        laps: saved.laps || [],
        activeLap: saved.activeLap || null,
        dateKey,
      })
    }
  }, [])

  // Persist on every state change
  useEffect(() => {
    saveDay(state.dateKey, { laps: state.laps, activeLap: state.activeLap })
    if (onChangeRef.current) {
      onChangeRef.current(state.dateKey, { laps: state.laps, activeLap: state.activeLap })
    }
  }, [state.laps, state.activeLap, state.dateKey])

  // Check for date rollover every minute
  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: 'CHECK_DATE' }), 60000)
    return () => clearInterval(interval)
  }, [])

  const start = useCallback((name) => dispatch({ type: 'START', name }), [])
  const lap = useCallback((name) => dispatch({ type: 'LAP', name }), [])
  const stop = useCallback(() => dispatch({ type: 'STOP' }), [])
  const deleteLap = useCallback((id) => dispatch({ type: 'DELETE_LAP', id }), [])

  const setOnChange = useCallback((fn) => {
    onChangeRef.current = fn
  }, [])

  return {
    laps: state.laps,
    activeLap: state.activeLap,
    running: state.running,
    dateKey: state.dateKey,
    start,
    lap,
    stop,
    deleteLap,
    setOnChange,
  }
}
