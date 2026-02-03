declare module 'react-big-calendar' {
  import { ReactNode, ComponentType } from 'react'

  export interface DateRange {
    start: Date
    end: Date
  }

  export interface SlotInfo {
    start: Date
    end: Date
    action: 'select' | 'click' | 'doubleClick'
  }

  export interface Event {
    id?: string | number
    title?: string
    start: Date
    end: Date
    [key: string]: any
  }

  export interface DateFnsLocalizerOptions {
    format: any
    parse: any
    startOfWeek: (date: Date, options?: any) => Date
    getDay: (date: Date) => number
    getDayName?: (date: Date) => string
    getMonthName?: (date: Date) => string
    locales?: { [key: string]: any }
  }

  export function dateFnsLocalizer(
    options: DateFnsLocalizerOptions
  ): {
    format: any
    parse: any
    startOfWeek: any
    getDay: any
  }

  export type View = 'month' | 'week' | 'work_week' | 'day' | 'agenda'

  export const Views: {
    MONTH: 'month'
    WEEK: 'week'
    WORK_WEEK: 'work_week'
    DAY: 'day'
    AGENDA: 'agenda'
  }

  export interface Messages {
    allDay?: string
    previous?: string
    next?: string
    today?: string
    month?: string
    week?: string
    day?: string
    agenda?: string
    date?: string
    time?: string
    event?: string
    noEventsInRange?: string
    showMore?: (total: number) => string
  }

  export interface CalendarProps {
    localizer: any
    events: Event[]
    startAccessor?: string | ((event: Event) => Date)
    endAccessor?: string | ((event: Event) => Date)
    style?: React.CSSProperties
    onSelectSlot?: (slotInfo: SlotInfo) => void
    onSelectEvent?: (event: Event, e: React.SyntheticEvent) => void
    selectable?: boolean
    popup?: boolean
    eventPropGetter?: (event: Event) => { style: React.CSSProperties }
    dayPropGetter?: (date: Date) => { style?: React.CSSProperties; className?: string } | object
    view?: View
    views?: View[] | { [key in View]?: boolean }
    onView?: (view: View) => void
    date?: Date
    onNavigate?: (date: Date) => void
    defaultDate?: Date
    defaultView?: View
    messages?: Messages
    culture?: string
    min?: Date
    max?: Date
    step?: number
    timeslots?: number
    scrollToTime?: Date
    toolbar?: boolean
  }

  export const Calendar: ComponentType<CalendarProps>
}

declare module 'react-big-calendar/lib/css/react-big-calendar.css' {
  export {}
}
