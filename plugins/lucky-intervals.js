export default {
  getIntervalKeys() {
    return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11+']
  },
  getIntervalKeysIndex(interval) {
    const intervalKeys = this.getIntervalKeys()
    const index = intervalKeys.indexOf(String(interval))
    return index !== -1 ? index : intervalKeys.length - 1
  },
  getIntervalKey(interval) {
    const intervalKeysIndex = this.getIntervalKeysIndex(interval)
    const intervalKeys = this.getIntervalKeys()
    return intervalKeys[intervalKeysIndex]
  },
  getIntervalColors() {
    return [
      { background: 'rgba(163, 203, 71, 0.2)', border: 'rgb(163, 203, 71)' },
      { background: 'rgba(13, 109, 17, 0.2)', border: 'rgb(13, 109, 17)' },
      { background: 'rgba(40, 167, 163, 0.2)', border: 'rgb(40, 167, 163)' },
      { background: 'rgba(11, 96, 86, 0.2)', border: 'rgb(11, 96, 86)' },
      { background: 'rgba(41, 125, 192, 0.2)', border: 'rgb(41, 125, 192)' },
      { background: 'rgba(102, 106, 169, 0.2)', border: 'rgb(102, 106, 169)' },
      { background: 'rgba(223, 97, 138, 0.2)', border: 'rgb(223, 97, 138)' },
      { background: 'rgba(166, 2, 37, 0.2)', border: 'rgb(166, 2, 37)' },
      { background: 'rgba(243, 125, 80, 0.2)', border: 'rgb(243, 125, 80)' },
      { background: 'rgba(180, 109, 28, 0.2)', border: 'rgb(180, 109, 28)' },
      { background: 'rgba(254, 228, 51, 0.2)', border: 'rgb(254, 228, 51)' },
    ]
  },
}
