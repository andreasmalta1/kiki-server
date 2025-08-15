const getTimeStampWithTimeZone = () => {
  return new Date(Date.now()).toISOString()
}

export { getTimeStampWithTimeZone }
