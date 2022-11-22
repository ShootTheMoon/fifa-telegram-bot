const axios = require("axios");

function sendMessage(api, chat, msg, msgID, button) {
  if (button) {
    axios
      .post(`${api}/sendMessage`, {
        chat_id: chat,
        text: msg,
        reply_to_message_id: msgID ? msgID : false,
        allow_sending_without_reply: true,
        parse_mode: "Markdown",
        inline_keyboard: [
          [
            {
              text: button[0],
              url: button[1],
            },
          ],
        ],
      })
      .catch((err) => console.log(err));
  } else {
    axios
      .post(`${api}/sendMessage`, {
        chat_id: chat,
        text: msg,
        reply_to_message_id: msgID ? msgID : false,
        allow_sending_without_reply: true,
        parse_mode: "Markdown",
      })
      .catch((err) => console.log(err));
  }
}
function sendPhoto(api, chat, image, text, button, msgID) {
  if (button) {
    axios
      .post(`${api}/sendPhoto`, {
        chat_id: chat,
        photo: image,
        caption: text,
        reply_to_message_id: msgID ? msgID : false,
        allow_sending_without_reply: true,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: button[0],
                url: button[1],
              },
            ],
          ],
        },
      })
      .catch((err) => {
        console.log(err.data);
        sendMessage(api, chat, "*Please try again later*", msgID);
      });
  } else {
    axios
      .post(`${api}/sendPhoto`, {
        chat_id: chat,
        photo: photo,
        caption: caption,
        reply_to_message_id: msgID ? msgID : false,
        allow_sending_without_reply: true,
        parse_mode: "Markdown",
      })
      .catch((err) => console.log(err));
  }
}
function sendVideo(api, chat, video, text, button, msgID) {
  if (button) {
    axios
      .post(`${api}/sendVideo`, {
        chat_id: chat,
        video: video,
        caption: text,
        reply_to_message_id: msgID ? msgID : false,
        allow_sending_without_reply: true,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: button[0],
                url: button[1],
              },
            ],
          ],
        },
      })
      .catch((err) => {
        console.log(err.data);
        sendMessage(api, chat, "*Please try again later*", msgID);
      });
  } else {
    axios
      .post(`${api}/sendVideo`, {
        chat_id: chat,
        video: video,
        caption: text,
        reply_to_message_id: msgID ? msgID : false,
        allow_sending_without_reply: true,
        parse_mode: "Markdown",
      })
      .catch((err) => console.log(err));
  }
}

module.exports = { sendMessage, sendVideo, sendPhoto };
