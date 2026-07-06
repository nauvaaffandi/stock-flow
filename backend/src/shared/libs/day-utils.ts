import dayjs from 'dayjs'

type TodayFormattedOptions = {
    separator?: string
    noSeparator?: boolean
}

export function todayFormatted(options: TodayFormattedOptions = {}) {
    const {
        separator = '/',
        noSeparator = false,
    } = options

    const format = noSeparator
        ? 'YYYYMMDD'
        : `YYYY${separator}MM${separator}DD`

    return dayjs().format(format)
}