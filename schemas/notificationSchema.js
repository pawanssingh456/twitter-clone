const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    userTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    userFrom: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notificationType: String,
    opened: { type: Boolean, default: false },
    entityID: Schema.Types.ObjectId,
  },
  { timestamps: true }
);

notificationSchema.statics.insertNotification = async (
  userTo,
  userFrom,
  notificationType,
  entityID
) => {
  let data = {
    userTo,
    userFrom,
    notificationType,
    entityID,
  };

  await Notification.deleteOne(data).catch((error) => {
    console.log(error);
  });
  return Notification.create(data).catch((error) => {
    console.log(error);
  });
};

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
