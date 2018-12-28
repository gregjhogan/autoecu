export default (file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = () => { resolve(Buffer.from(reader.result)) }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}