export function formatNumber(num: number) {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  } else {
    return num.toString()
  }
}

export function formatRelativeDate(date: Date) {
  const now = new Date()
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000)

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (secondsAgo < 60) {
    return rtf.format(-secondsAgo, 'second')
  } else if (secondsAgo < 3600) {
    const minutesAgo = Math.floor(secondsAgo / 60)
    return rtf.format(-minutesAgo, 'minute')
  } else if (secondsAgo < 86400) {
    const hoursAgo = Math.floor(secondsAgo / 3600)
    return rtf.format(-hoursAgo, 'hour')
  } else if (secondsAgo < 2592000) {
    const daysAgo = Math.floor(secondsAgo / 86400)
    return rtf.format(-daysAgo, 'day')
  } else if (secondsAgo < 31536000) {
    const monthsAgo = Math.floor(secondsAgo / 2592000)
    return rtf.format(-monthsAgo, 'month')
  } else {
    const yearsAgo = Math.floor(secondsAgo / 31536000)
    return rtf.format(-yearsAgo, 'year')
  }
}

export function formatSize(bytes: number) {
  const sizes = ['B', 'KB', 'MB', 'GB']

  if (bytes === 0) return '0 B'

  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}
