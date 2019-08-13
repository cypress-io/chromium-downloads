const { getBuilds } = require('.')

getBuilds()
.then(builds => {
  console.log(builds[1])
  return builds[1].getDownloads()
})
.then(console.log)
