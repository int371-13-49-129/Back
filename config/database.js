const Sequelize = require("sequelize");
const config = require("./config");
console.log(config);
let sequelize;

sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  port: config.port_db,
  dialect: "mysql",
  dialectOption: {
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    ssl: true,
    native: true,
  },
  timezone: "+07:00",
  logging: false,
});

sequelize
  .authenticate()
  .then(async () => {
    await sequelize.sync({ alter: true });
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const db = {};

db.sequelize = sequelize;

db.account = require("../models/account")(sequelize, Sequelize);
db.json_web_token = require("../models/jsonWebToken")(sequelize, Sequelize);
db.post = require("../models/post")(sequelize, Sequelize);
db.comment = require("../models/comment")(sequelize, Sequelize);
db.tag = require("../models/tag")(sequelize, Sequelize);
db.post_tag = require("../models/postTag")(sequelize, Sequelize);
db.emotion = require("../models/emotion")(sequelize, Sequelize);
db.log_edit = require("../models/logEdit")(sequelize, Sequelize);
db.message_connect = require("../models/messageConnect")(sequelize, Sequelize);
db.message = require("../models/message")(sequelize, Sequelize);
db.topic = require("../models/topic")(sequelize, Sequelize);
db.account_topic = require("../models/accountTopic")(sequelize, Sequelize);
db.diary = require("../models/diary")(sequelize, Sequelize);
db.mood = require("../models/mood")(sequelize, Sequelize);
db.mood_diary = require("../models/moodDiary")(sequelize, Sequelize);
db.rating = require("../models/rating")(sequelize, Sequelize);
db.follow = require("../models/follow")(sequelize, Sequelize);
db.report = require("../models/report")(sequelize, Sequelize);
db.notification = require("../models/notification")(sequelize, Sequelize);
db.account_read = require("../models/accountRead")(sequelize, Sequelize);
db.request = require("../models/request")(sequelize, Sequelize);

db.account.hasMany(db.json_web_token, {
  foreignKey: "account_id",
});
db.json_web_token.belongsTo(db.account, {
  foreignKey: "account_id",
});

db.account.hasMany(db.post, {
  foreignKey: "account_id",
});
db.post.belongsTo(db.account, {
  foreignKey: "account_id",
});

db.post.hasMany(db.post, {
  as: 'posts',
  foreignKey: "refer_post_id",
});
db.post.belongsTo(db.post, {
  as: 'refer_post',
  foreignKey: "refer_post_id",
});

db.account.hasMany(db.comment, {
  foreignKey: "account_id",
});
db.comment.belongsTo(db.account, {
  foreignKey: "account_id",
});

db.post.hasMany(db.comment, {
  foreignKey: "post_id",
});
db.comment.belongsTo(db.post, {
  foreignKey: "post_id",
});

db.comment.hasMany(db.comment, {
  foreignKey: "reply_comment_id",
});
db.comment.belongsTo(db.comment, {
  foreignKey: "reply_comment_id",
});

db.post.hasMany(db.post_tag, {
  foreignKey: "post_id",
  as:"tag_filter",
});
db.post.hasMany(db.post_tag, {
  foreignKey: "post_id",
});
db.post_tag.belongsTo(db.post, {
  foreignKey: "post_id",
});

db.tag.hasMany(db.post_tag, {
  foreignKey: "tag_id",
});
db.post_tag.belongsTo(db.tag, {
  foreignKey: "tag_id",
});

db.account.hasMany(db.emotion, {
  foreignKey: "account_id",
});
db.emotion.belongsTo(db.account, {
  foreignKey: "account_id",
});

db.post.hasMany(db.emotion, {
  foreignKey: "post_id",
});
db.emotion.belongsTo(db.post, {
  foreignKey: "post_id",
});

db.comment.hasMany(db.emotion, {
  foreignKey: "comment_id",
});
db.emotion.belongsTo(db.comment, {
  foreignKey: "comment_id",
});

db.post.hasMany(db.log_edit, {
  foreignKey: "post_id",
});
db.log_edit.belongsTo(db.post, {
  foreignKey: "post_id",
});

db.comment.hasMany(db.log_edit, {
  foreignKey: "comment_id",
});
db.log_edit.belongsTo(db.comment, {
  foreignKey: "comment_id",
});

db.account.hasMany(db.log_edit, {
  foreignKey: "account_id",
});
db.log_edit.belongsTo(db.account, {
  foreignKey: "account_id",
});

db.account.hasMany(db.message_connect, {
  foreignKey: "account_id_1",
});
db.message_connect.belongsTo(db.account, {
  as: 'account_1',
  foreignKey: "account_id_1",
});

db.account.hasMany(db.message_connect, {
  foreignKey: "account_id_2",
});
db.message_connect.belongsTo(db.account, {
  as: 'account_2',
  foreignKey: "account_id_2",
});

db.message_connect.hasMany(db.message, {
  foreignKey: "message_connect_id",
});
db.message.belongsTo(db.message_connect, {
  foreignKey: "message_connect_id",
});

db.account.hasMany(db.message, {
  foreignKey: "account_id",
});
db.message.belongsTo(db.account, {
  foreignKey: "account_id",
});

db.account.hasMany(db.account_topic, {
  foreignKey: "account_id",
});
db.account_topic.belongsTo(db.account, {
  foreignKey: "account_id",
});

db.topic.hasMany(db.account_topic, {
  foreignKey: "topic_id",
});
db.account_topic.belongsTo(db.topic, {
  foreignKey: "topic_id",
});

db.account.hasMany(db.diary, {
  foreignKey: "account_id",
});
db.diary.belongsTo(db.account, {
  foreignKey: "account_id",
});

db.account.hasMany(db.mood_diary, {
  foreignKey: "account_id",
});
db.mood_diary.belongsTo(db.account, {
  foreignKey: "account_id",
});

db.mood.hasMany(db.mood_diary, {
  foreignKey: "mood_id",
});
db.mood_diary.belongsTo(db.mood, {
  foreignKey: "mood_id",
});

db.tag.hasMany(db.post, {
  foreignKey: "tag_id",
});
db.post.belongsTo(db.tag, {
  foreignKey: "tag_id",
});

db.account.hasMany(db.rating, {
  as: 'account_reviewer',
  foreignKey: "account_id",
});
db.rating.belongsTo(db.account, {
  foreignKey: "account_id",
});
db.account.hasMany(db.rating, {
  foreignKey: "account_id_reviewer",
});
db.rating.belongsTo(db.account, {
  as: 'account_reviewer',
  foreignKey: "account_id_reviewer",
});


db.account.hasMany(db.follow, {
  as: "account_follower",
  foreignKey: "account_id",
});
db.follow.belongsTo(db.account, {
  foreignKey: "account_id",
});
db.account.hasMany(db.follow, {
  foreignKey: "account_id_follower",
});
db.follow.belongsTo(db.account, {
  as: 'account_follower',
  foreignKey: "account_id_follower",
});

db.post.hasMany(db.report, {
  foreignKey: "post_id",
});
db.report.belongsTo(db.post, {
  foreignKey: "post_id",
});

db.comment.hasMany(db.report, {
  foreignKey: "comment_id",
});
db.report.belongsTo(db.comment, {
  foreignKey: "comment_id",
});

db.account.hasMany(db.report, {
  foreignKey: "account_id",
});
db.report.belongsTo(db.account, {
  foreignKey: "account_id",
});

db.account.hasMany(db.report, {
  foreignKey: "account_id_reporter",
});
db.report.belongsTo(db.account, {
  as: 'account_reporter',
  foreignKey: "account_id_reporter",
});

db.post.hasMany(db.notification, {
  foreignKey: "post_id",
});
db.notification.belongsTo(db.post, {
  foreignKey: "post_id",
});

db.comment.hasMany(db.notification, {
  foreignKey: "comment_id",
});
db.notification.belongsTo(db.comment, {
  foreignKey: "comment_id",
});

db.account.hasMany(db.notification, {
  foreignKey: "account_id",
});
db.notification.belongsTo(db.account, {
  foreignKey: "account_id",
});

db.account.hasMany(db.account_read, {
  foreignKey: "account_id",
});
db.account_read.belongsTo(db.account, {
  foreignKey: "account_id",
});

db.post.hasMany(db.account_read, {
  foreignKey: "post_id",
});
db.account_read.belongsTo(db.post, {
  foreignKey: "post_id",
});

db.account.hasMany(db.request, {
  foreignKey: "account_id",
});
db.request.belongsTo(db.account, {
  foreignKey: "account_id",
});

db.message_connect.hasMany(db.request, {
  foreignKey: "message_connect_id",
});
db.request.belongsTo(db.message_connect, {
  foreignKey: "message_connect_id",
});

module.exports = db;
