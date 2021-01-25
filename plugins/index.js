export default ({ app }, inject) => {
  inject('convertDisplayRate', (total, count) => {
    return Math.floor((count / total) * 100 * 100) / 100
  })
}
