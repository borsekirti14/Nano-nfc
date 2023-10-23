var config = module.exports;

config.db = {
  mongodb : 'mongodb://localhost/nfc_project'
  // mongodb : 'mongodb://admin:admin@clusternew-shard-00-00-dwd7u.mongodb.net:27017,clusternew-shard-00-01-dwd7u.mongodb.net:27017,clusternew-shard-00-02-dwd7u.mongodb.net:27017/testingnewDB?ssl=true&replicaSet=ClusterNew-shard-0&authSource=admin&retryWrites=false'
};

config.jwt = {
  secret: 'nanonfcproject'
};

config.server = {
  port: PORT = process.env.PORT || 3000
};

config.passwordCredentials = {
  user:'nanonfcinfo@gmail.com',
  pass:'Naisha@2409'
}
